const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:4173",
      "http://localhost:8080",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// CS:GO API base URL
const CSGO_API_BASE = "https://bymykel.github.io/CSGO-API/api/en";

// Available endpoints
const ENDPOINTS = {
  skins: `${CSGO_API_BASE}/skins.json`,
  stickers: `${CSGO_API_BASE}/stickers.json`,
  agents: `${CSGO_API_BASE}/agents.json`,
  keychains: `${CSGO_API_BASE}/keychains.json`,
  graffiti: `${CSGO_API_BASE}/graffiti.json`,
  patches: `${CSGO_API_BASE}/patches.json`,
  music_kits: `${CSGO_API_BASE}/music_kits.json`,
  containers: `${CSGO_API_BASE}/containers.json`,
  keys: `${CSGO_API_BASE}/keys.json`,
  collectibles: `${CSGO_API_BASE}/collectibles.json`,
};

// Helper function to get cached data or fetch from API
async function getCachedData(key, url) {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }

  try {
    console.log(`Fetching ${key} from CS:GO API...`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "CS:GO-Trading-Dashboard/1.0",
      },
    });

    const data = response.data;
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    console.log(`Successfully fetched ${key}: ${data.length} items`);
    return data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error.message);

    // Return cached data if available, even if expired
    if (cached) {
      console.log(`Using expired cache for ${key}`);
      return cached.data;
    }

    throw error;
  }
}

// Individual endpoint routes
app.get("/api/csgo/:category", async (req, res) => {
  const { category } = req.params;

  if (!ENDPOINTS[category]) {
    return res.status(404).json({
      success: false,
      error: `Category '${category}' not found. Available categories: ${Object.keys(ENDPOINTS).join(", ")}`,
    });
  }

  try {
    const data = await getCachedData(category, ENDPOINTS[category]);
    res.json({
      success: true,
      data,
      cached:
        cache.has(category) &&
        Date.now() - cache.get(category).timestamp < CACHE_DURATION,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      category,
    });
  }
});

// Get all items at once (optimized endpoint)
app.get("/api/csgo/all", async (req, res) => {
  try {
    console.log("Fetching all CS:GO data...");

    // Fetch all endpoints in parallel
    const promises = Object.entries(ENDPOINTS).map(([category, url]) =>
      getCachedData(category, url).then((data) => ({ category, data })),
    );

    const results = await Promise.allSettled(promises);

    const allItems = {};
    const errors = [];

    results.forEach((result, index) => {
      const category = Object.keys(ENDPOINTS)[index];

      if (result.status === "fulfilled") {
        allItems[category] = result.value.data;
      } else {
        console.error(`Failed to fetch ${category}:`, result.reason.message);
        errors.push({
          category,
          error: result.reason.message,
        });
        allItems[category] = []; // Empty array for failed categories
      }
    });

    const totalItems = Object.values(allItems).reduce(
      (sum, items) => sum + items.length,
      0,
    );

    console.log(
      `Successfully fetched ${totalItems} total items across ${Object.keys(allItems).length} categories`,
    );

    res.json({
      success: true,
      data: allItems,
      totalItems,
      errors: errors.length > 0 ? errors : undefined,
      cached: Object.keys(ENDPOINTS).every(
        (category) =>
          cache.has(category) &&
          Date.now() - cache.get(category).timestamp < CACHE_DURATION,
      ),
    });
  } catch (error) {
    console.error("Error in /api/csgo/all:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    cache: {
      size: cache.size,
      keys: Array.from(cache.keys()),
    },
  });
});

// Clear cache endpoint (for development)
app.post("/api/clear-cache", (req, res) => {
  cache.clear();
  res.json({
    success: true,
    message: "Cache cleared",
  });
});

// Process skins endpoint - fetches and transforms CS2 skins data
app.get("/api/process-skins", async (req, res) => {
  const fs = require("fs");
  const path = require("path");

  try {
    console.log("🔄 Processing CS2 skins data...");

    // Fetch skins data from ByMykel API
    const skinsData = await getCachedData("skins", ENDPOINTS.skins);

    if (!skinsData || skinsData.length === 0) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch skins data from API",
      });
    }

    console.log(`📦 Processing ${skinsData.length} skins...`);

    // Transform the data into the required structure
    const processedSkins = skinsData.map((skin) => {
      // Extract weapon name from skin name (everything before the first " | ")
      const weaponMatch = skin.name ? skin.name.split(" | ")[0] : "";

      // Get collections array - handle both string and array cases
      let collections = [];
      if (skin.crates && Array.isArray(skin.crates)) {
        collections = skin.crates
          .map((crate) => crate.name || crate)
          .filter(Boolean);
      } else if (skin.collections && Array.isArray(skin.collections)) {
        collections = skin.collections
          .map((collection) => collection.name || collection)
          .filter(Boolean);
      } else if (skin.collection) {
        collections = [
          typeof skin.collection === "string"
            ? skin.collection
            : skin.collection.name,
        ];
      }

      // Process rarity
      const rarity = skin.rarity
        ? typeof skin.rarity === "string"
          ? skin.rarity
          : skin.rarity.name
        : "Unknown";

      return {
        name: skin.name || "Unknown",
        weapon: weaponMatch || "Unknown",
        rarity: rarity,
        min_float: typeof skin.min_float === "number" ? skin.min_float : 0,
        max_float: typeof skin.max_float === "number" ? skin.max_float : 1,
        image: skin.image || "",
        collections: collections,
        souvenir: Boolean(skin.souvenir),
        stattrak: Boolean(skin.stattrak),
      };
    });

    // Filter out items with no name or invalid data
    const validSkins = processedSkins.filter(
      (skin) =>
        skin.name && skin.name !== "Unknown" && skin.name.trim().length > 0,
    );

    console.log(`✅ Successfully processed ${validSkins.length} valid skins`);

    // Save to file if requested via query parameter
    if (req.query.save === "true") {
      try {
        const dataDir = path.join(__dirname, "public", "data");
        const filePath = path.join(dataDir, "skins.json");

        // Ensure directory exists
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write file with pretty formatting
        fs.writeFileSync(filePath, JSON.stringify(validSkins, null, 2));
        console.log(`💾 Saved ${validSkins.length} skins to ${filePath}`);

        return res.json({
          success: true,
          message: `Processed and saved ${validSkins.length} skins`,
          count: validSkins.length,
          saved: true,
          filePath: "/data/skins.json",
          data: req.query.include_data === "true" ? validSkins : undefined,
        });
      } catch (saveError) {
        console.error("Error saving file:", saveError);
        return res.status(500).json({
          success: false,
          error: `Failed to save file: ${saveError.message}`,
          count: validSkins.length,
          data: validSkins,
        });
      }
    }

    // Return the processed data
    res.json({
      success: true,
      message: `Successfully processed ${validSkins.length} skins`,
      count: validSkins.length,
      saved: false,
      data: validSkins,
    });
  } catch (error) {
    console.error("Error processing skins:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get saved skins data endpoint
app.get("/api/skins", (req, res) => {
  const fs = require("fs");
  const path = require("path");

  try {
    const filePath = path.join(__dirname, "public", "data", "skins.json");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error:
          "Skins data file not found. Run /api/process-skins?save=true first.",
      });
    }

    const data = fs.readFileSync(filePath, "utf8");
    const skins = JSON.parse(data);

    res.json({
      success: true,
      count: skins.length,
      data: skins,
    });
  } catch (error) {
    console.error("Error reading skins file:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /api/csgo/:category",
      "GET /api/csgo/all",
      "GET /api/health",
      "POST /api/clear-cache",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CS:GO API Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: ${CSGO_API_BASE}`);
  console.log(`🎯 Available categories: ${Object.keys(ENDPOINTS).join(", ")}`);
  console.log(`💾 Cache duration: ${CACHE_DURATION / 1000 / 60} minutes`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});
