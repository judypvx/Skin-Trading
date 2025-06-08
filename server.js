import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

async function getCachedData(key, url) {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }

  try {
    console.log(`Fetching ${key}...`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "CS:GO-Trading-Dashboard/1.0" },
    });

    const data = response.data;
    cache.set(key, { data, timestamp: Date.now() });
    console.log(`Successfully fetched ${key}: ${data.length} items`);
    return data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error.message);
    if (cached) {
      console.log(`Using expired cache for ${key}`);
      return cached.data;
    }
    throw error;
  }
}

// Process skins endpoint
app.get("/api/process-skins", async (req, res) => {
  try {
    console.log("🔄 Processing CS2 skins data from all.json...");

    const ALL_ENDPOINT = "https://bymykel.github.io/CSGO-API/api/en/all.json";
    console.log("Fetching from:", ALL_ENDPOINT);

    const response = await axios.get(ALL_ENDPOINT, {
      timeout: 30000,
      headers: { "User-Agent": "CS:GO-Trading-Dashboard/1.0" },
    });

    if (!response.data || !response.data.skins) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch data from all.json or skins not found",
      });
    }

    const skinsData = response.data.skins;
    console.log(`📦 Processing ${skinsData.length} skins from all.json...`);

    const processedSkins = skinsData.map((skin) => {
      const weaponMatch = skin.name ? skin.name.split(" | ")[0] : "";

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

    const validSkins = processedSkins.filter(
      (skin) =>
        skin.name && skin.name !== "Unknown" && skin.name.trim().length > 0,
    );

    console.log(`✅ Successfully processed ${validSkins.length} valid skins`);

    if (req.query.save === "true") {
      try {
        const dataDir = path.join(__dirname, "public", "data");
        const filePath = path.join(dataDir, "skins.json");

        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    cache: { size: cache.size, keys: Array.from(cache.keys()) },
  });
});

// Clear cache endpoint
app.post("/api/clear-cache", (req, res) => {
  cache.clear();
  res.json({ success: true, message: "Cache cleared" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /api/process-skins",
      "GET /api/skins",
      "GET /api/health",
      "POST /api/clear-cache",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CS:GO API Proxy Server running on http://localhost:${PORT}`);
  console.log(`💾 Cache duration: ${CACHE_DURATION / 1000 / 60} minutes`);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});
