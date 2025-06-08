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
