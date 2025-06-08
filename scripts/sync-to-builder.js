#!/usr/bin/env node

import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // ByMykel API endpoint
  API_URL: "https://bymykel.github.io/CSGO-API/api/en/all.json",

  // Builder.io configuration
  BUILDER_API_KEY: process.env.BUILDER_API_KEY, // Set this as environment variable
  BUILDER_BASE_URL: "https://builder.io/api/v1/write",

  // Rate limiting
  DELAY_MS: 100, // 100ms between requests
  BATCH_SIZE: 50, // Process items in batches

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second

  // Logging
  LOG_FILE: path.join(__dirname, "../logs/builder-sync.log"),

  // Cache/backup
  CACHE_FILE: path.join(__dirname, "../cache/all-items.json"),
};

// Ensure required directories exist
function ensureDirectories() {
  const dirs = [path.dirname(CONFIG.LOG_FILE), path.dirname(CONFIG.CACHE_FILE)];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Logging utility
function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level}: ${message}`;

  console.log(logMessage);

  // Write to log file
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage + "\n");
  } catch (err) {
    console.error("Failed to write to log file:", err.message);
  }
}

// Sleep utility for rate limiting
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch data from ByMykel API
async function fetchAllItemsData() {
  try {
    log("Fetching data from ByMykel API...");

    const response = await axios.get(CONFIG.API_URL, {
      timeout: 30000,
      headers: {
        "User-Agent": "CS2-Trading-Dashboard/1.0",
        Accept: "application/json",
      },
    });

    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format from API");
    }

    log(
      `Successfully fetched data with ${Object.keys(response.data).length} items`,
    );

    // Cache the response
    fs.writeFileSync(CONFIG.CACHE_FILE, JSON.stringify(response.data, null, 2));
    log("Data cached to file system");

    return response.data;
  } catch (error) {
    log(`Error fetching data: ${error.message}`, "ERROR");

    // Try to load from cache
    if (fs.existsSync(CONFIG.CACHE_FILE)) {
      log("Attempting to load from cache...", "WARN");
      const cachedData = JSON.parse(fs.readFileSync(CONFIG.CACHE_FILE, "utf8"));
      return cachedData;
    }

    throw error;
  }
}

// Normalize item data based on item type
function normalizeItem(itemId, itemData) {
  const baseItem = {
    id: itemId,
    name: itemData.name || "Unknown",
    image: itemData.image || "",
    created: new Date().toISOString(),
  };

  // Determine item type and model based on ID prefix
  let model = "item"; // default

  if (itemId.startsWith("skin-")) {
    model = "skin";
    return {
      ...baseItem,
      weapon: itemData.weapon?.name || extractWeaponFromName(itemData.name),
      rarity: itemData.rarity?.name || itemData.rarity || "Unknown",
      min_float: itemData.min_float || 0,
      max_float: itemData.max_float || 1,
      collections: extractCollections(itemData),
      souvenir: Boolean(itemData.souvenir),
      stattrak: Boolean(itemData.stattrak),
      pattern: itemData.pattern?.name || null,
      finish_catalog: itemData.finish_catalog || null,
      model: "skin",
    };
  }

  if (itemId.startsWith("agent-")) {
    model = "agent";
    return {
      ...baseItem,
      rarity: itemData.rarity?.name || itemData.rarity || "Unknown",
      team: itemData.team?.name || itemData.team || "Unknown",
      collections: extractCollections(itemData),
      model: "agent",
    };
  }

  if (itemId.startsWith("sticker-")) {
    model = "sticker";
    return {
      ...baseItem,
      rarity: itemData.rarity?.name || itemData.rarity || "Unknown",
      collections: extractCollections(itemData),
      tournament: itemData.tournament?.name || null,
      type: itemData.type?.name || "Sticker",
      model: "sticker",
    };
  }

  if (itemId.startsWith("patch-")) {
    model = "patch";
    return {
      ...baseItem,
      rarity: itemData.rarity?.name || itemData.rarity || "Unknown",
      collections: extractCollections(itemData),
      model: "patch",
    };
  }

  if (itemId.startsWith("keychain-")) {
    model = "keychain";
    return {
      ...baseItem,
      rarity: itemData.rarity?.name || itemData.rarity || "Unknown",
      collections: extractCollections(itemData),
      model: "keychain",
    };
  }

  if (itemId.startsWith("graffiti-")) {
    model = "graffiti";
    return {
      ...baseItem,
      rarity: itemData.rarity?.name || itemData.rarity || "Unknown",
      collections: extractCollections(itemData),
      model: "graffiti",
    };
  }

  if (itemId.startsWith("music-")) {
    model = "music_kit";
    return {
      ...baseItem,
      artist: itemData.artist || "Unknown",
      collections: extractCollections(itemData),
      model: "music_kit",
    };
  }

  // Default case for containers, collectibles, etc.
  return {
    ...baseItem,
    rarity: itemData.rarity?.name || itemData.rarity || "Unknown",
    collections: extractCollections(itemData),
    type: itemData.type?.name || "Item",
    model: "item",
  };
}

// Helper functions
function extractWeaponFromName(name) {
  if (!name) return "Unknown";
  const parts = name.split(" | ");
  return parts[0] || "Unknown";
}

function extractCollections(itemData) {
  if (itemData.collections && Array.isArray(itemData.collections)) {
    return itemData.collections.map((c) => c.name || c).filter(Boolean);
  }
  if (itemData.crates && Array.isArray(itemData.crates)) {
    return itemData.crates.map((c) => c.name || c).filter(Boolean);
  }
  if (itemData.collection) {
    return [itemData.collection.name || itemData.collection];
  }
  return [];
}

// Send item to Builder.io
async function sendToBuilder(item, retryCount = 0) {
  try {
    const model = item.model || "item";
    const endpoint = `${CONFIG.BUILDER_BASE_URL}/${model}`;

    // Remove the model field from the data we send
    const { model: _, ...itemData } = item;

    const response = await axios.post(endpoint, itemData, {
      headers: {
        Authorization: `Bearer ${CONFIG.BUILDER_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    if (response.status >= 200 && response.status < 300) {
      return { success: true, data: response.data };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES) {
      log(
        `Retry ${retryCount + 1}/${CONFIG.MAX_RETRIES} for item ${item.id}: ${error.message}`,
        "WARN",
      );
      await sleep(CONFIG.RETRY_DELAY * (retryCount + 1));
      return sendToBuilder(item, retryCount + 1);
    }

    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

// Check if item already exists in Builder.io
async function checkItemExists(itemId, model) {
  try {
    const response = await axios.get(
      `https://builder.io/api/v1/content/${model}`,
      {
        params: {
          apiKey: CONFIG.BUILDER_API_KEY,
          "data.id": itemId,
          limit: 1,
        },
        timeout: 5000,
      },
    );

    return response.data?.results?.length > 0;
  } catch (error) {
    log(`Error checking if item exists ${itemId}: ${error.message}`, "WARN");
    return false; // Assume it doesn't exist if we can't check
  }
}

// Process items in batches
async function processItemsBatch(items, skipExisting = true) {
  const results = {
    total: items.length,
    success: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  log(`Processing batch of ${items.length} items...`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    try {
      // Check if item exists (optional optimization)
      if (skipExisting) {
        const exists = await checkItemExists(item.id, item.model);
        if (exists) {
          log(`Skipping existing item: ${item.id}`, "DEBUG");
          results.skipped++;
          continue;
        }
      }

      // Send to Builder.io
      const result = await sendToBuilder(item);

      if (result.success) {
        log(`✅ Successfully uploaded: ${item.id} (${item.model})`);
        results.success++;
      } else {
        log(`❌ Failed to upload: ${item.id} - ${result.error}`, "ERROR");
        results.failed++;
        results.errors.push({
          id: item.id,
          error: result.error,
          status: result.status,
        });
      }
    } catch (error) {
      log(`❌ Unexpected error for ${item.id}: ${error.message}`, "ERROR");
      results.failed++;
      results.errors.push({
        id: item.id,
        error: error.message,
      });
    }

    // Rate limiting
    if (i < items.length - 1) {
      await sleep(CONFIG.DELAY_MS);
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      log(`Progress: ${i + 1}/${items.length} items processed`);
    }
  }

  return results;
}

// Main function
async function main() {
  try {
    log("🚀 Starting Builder.io sync process...");

    // Validate configuration
    if (!CONFIG.BUILDER_API_KEY) {
      throw new Error("BUILDER_API_KEY environment variable is required");
    }

    // Ensure directories exist
    ensureDirectories();

    // Fetch data
    const rawData = await fetchAllItemsData();

    // Convert object to array and normalize
    log("Converting and normalizing items...");
    const items = Object.entries(rawData).map(([id, data]) =>
      normalizeItem(id, data),
    );

    log(`Total items to process: ${items.length}`);

    // Group items by model for statistics
    const itemsByModel = items.reduce((acc, item) => {
      acc[item.model] = (acc[item.model] || 0) + 1;
      return acc;
    }, {});

    log("Items by type:", "INFO");
    Object.entries(itemsByModel).forEach(([model, count]) => {
      log(`  ${model}: ${count} items`);
    });

    // Process in batches
    const totalResults = {
      total: 0,
      success: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < items.length; i += CONFIG.BATCH_SIZE) {
      const batch = items.slice(i, i + CONFIG.BATCH_SIZE);
      log(
        `\n📦 Processing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(items.length / CONFIG.BATCH_SIZE)}`,
      );

      const batchResults = await processItemsBatch(batch);

      // Accumulate results
      totalResults.total += batchResults.total;
      totalResults.success += batchResults.success;
      totalResults.skipped += batchResults.skipped;
      totalResults.failed += batchResults.failed;
      totalResults.errors.push(...batchResults.errors);

      log(
        `Batch complete: ${batchResults.success} success, ${batchResults.skipped} skipped, ${batchResults.failed} failed`,
      );

      // Longer pause between batches
      if (i + CONFIG.BATCH_SIZE < items.length) {
        log("Pausing between batches...");
        await sleep(CONFIG.DELAY_MS * 5);
      }
    }

    // Final results
    log("\n🎉 Sync process completed!");
    log(`📊 Final Results:`);
    log(`  Total items: ${totalResults.total}`);
    log(`  Successfully uploaded: ${totalResults.success}`);
    log(`  Skipped (already exist): ${totalResults.skipped}`);
    log(`  Failed: ${totalResults.failed}`);

    if (totalResults.errors.length > 0) {
      log(`\n❌ Errors (first 10):`);
      totalResults.errors.slice(0, 10).forEach((error) => {
        log(`  ${error.id}: ${error.error}`, "ERROR");
      });

      // Save full error report
      const errorReport = {
        timestamp: new Date().toISOString(),
        summary: totalResults,
        errors: totalResults.errors,
      };

      const errorFile = path.join(__dirname, "../logs/sync-errors.json");
      fs.writeFileSync(errorFile, JSON.stringify(errorReport, null, 2));
      log(`Full error report saved to: ${errorFile}`);
    }

    // Exit with appropriate code
    process.exit(totalResults.failed > 0 ? 1 : 0);
  } catch (error) {
    log(`💥 Fatal error: ${error.message}`, "ERROR");
    log(error.stack, "ERROR");
    process.exit(1);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  log("🛑 Process interrupted by user");
  process.exit(1);
});

process.on("SIGTERM", () => {
  log("🛑 Process terminated");
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, normalizeItem, fetchAllItemsData };
