import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

console.log("🚀 Fixed Server starting with ES modules...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Mock data as fallback if APIs fail
const MOCK_SKINS_DATA = [
  {
    name: "AK-47 | Redline",
    weapon: "AK-47",
    rarity: "Classified",
    min_float: 0.1,
    max_float: 0.7,
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUJ6JYgiLjFpYj3jQKx80Y5Yzz7cNKRdAE9ZFPR_Qe-l-bsg8K8u8ucySQy7yYn-z-DyKOKuVni",
    collections: ["The Phoenix Collection"],
    souvenir: false,
    stattrak: true,
  },
  {
    name: "AWP | Asiimov",
    weapon: "AWP",
    rarity: "Covert",
    min_float: 0.18,
    max_float: 1.0,
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJP7c-ikZKSqPrxN7LEmyUFuJx13LGQoY70jgW2-UE5NjiiItKcdgU4NF2D-gC-kOfpjJG5v8ycyyQ26ScqsH7fmBGpwUYbOc1v8to",
    collections: ["The Huntsman Collection"],
    souvenir: false,
    stattrak: true,
  },
  {
    name: "M4A4 | Neo-Noir",
    weapon: "M4A4",
    rarity: "Classified",
    min_float: 0.0,
    max_float: 0.7,
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL_VqXlUu8p03-jBpYitigzn8hA_ZGygcISUdAM7MFyGrlLrlebnjZS4upic1zI",
    collections: ["The Cache Collection"],
    souvenir: false,
    stattrak: true,
  },
];

// Process skins endpoint
app.get("/api/process-skins", async (req, res) => {
  try {
    console.log("🔄 Processing CS2 skins...");

    let skinsData = [];
    let dataSource = "fallback";

    // Try multiple API sources
    const apiSources = [
      "https://bymykel.github.io/CSGO-API/api/en/skins.json",
      "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json",
    ];

    for (const apiUrl of apiSources) {
      try {
        console.log(`📡 Trying API: ${apiUrl}`);
        const response = await axios.get(apiUrl, {
          timeout: 15000,
          headers: {
            "User-Agent": "CS:GO-Trading-Dashboard/1.0",
            Accept: "application/json",
          },
        });

        console.log(
          `✅ API Response: ${response.status}, Type: ${typeof response.data}`,
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          skinsData = response.data;
          dataSource = apiUrl;
          console.log(
            `🎯 Successfully got ${skinsData.length} skins from ${apiUrl}`,
          );
          break;
        } else if (response.data?.skins && Array.isArray(response.data.skins)) {
          skinsData = response.data.skins;
          dataSource = apiUrl;
          console.log(
            `🎯 Successfully got ${skinsData.length} skins from ${apiUrl} (nested)`,
          );
          break;
        }
      } catch (apiError) {
        console.warn(`⚠️ Failed to fetch from ${apiUrl}:`, apiError.message);
        continue;
      }
    }

    // Fallback to mock data if all APIs fail
    if (skinsData.length === 0) {
      console.log("🔄 Using mock data as fallback...");
      skinsData = MOCK_SKINS_DATA;
      dataSource = "mock_data";
    }

    // Process the skins data
    const processedSkins = skinsData.map((skin, index) => {
      // Handle different data structures
      const name =
        skin.name || skin.display_name || `Unknown Skin ${index + 1}`;
      const weaponMatch = name ? name.split(" | ")[0] : "Unknown";

      // Handle rarity - try different property names
      let rarity = "Unknown";
      if (skin.rarity) {
        rarity =
          typeof skin.rarity === "string"
            ? skin.rarity
            : skin.rarity.name || skin.rarity.id || "Unknown";
      } else if (skin.type) {
        rarity = skin.type;
      }

      // Handle collections/crates
      let collections = [];
      if (skin.crates && Array.isArray(skin.crates)) {
        collections = skin.crates.map((c) => c.name || c).filter(Boolean);
      } else if (skin.collections && Array.isArray(skin.collections)) {
        collections = skin.collections.map((c) => c.name || c).filter(Boolean);
      } else if (skin.collection) {
        collections = [
          typeof skin.collection === "string"
            ? skin.collection
            : skin.collection.name,
        ];
      } else if (skin.case) {
        collections = [
          typeof skin.case === "string" ? skin.case : skin.case.name,
        ];
      }

      return {
        name: name,
        weapon: weaponMatch || "Unknown",
        rarity: rarity,
        min_float:
          typeof skin.min_float === "number"
            ? skin.min_float
            : skin.minFloat || 0,
        max_float:
          typeof skin.max_float === "number"
            ? skin.max_float
            : skin.maxFloat || 1,
        image: skin.image || skin.icon_url || skin.image_url || "",
        collections: collections,
        souvenir: Boolean(skin.souvenir),
        stattrak: Boolean(skin.stattrak || skin.statTrak),
      };
    });

    // Filter valid skins
    const validSkins = processedSkins.filter(
      (skin) =>
        skin.name &&
        skin.name !== "Unknown" &&
        !skin.name.startsWith("Unknown Skin"),
    );

    console.log(
      `✅ Successfully processed ${validSkins.length} valid skins from ${dataSource}`,
    );

    // Save to file if requested
    if (req.query.save === "true") {
      try {
        const dataDir = path.join(__dirname, "public", "data");
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        const filePath = path.join(dataDir, "skins.json");
        const dataToSave = {
          metadata: {
            timestamp: new Date().toISOString(),
            source: dataSource,
            count: validSkins.length,
          },
          skins: validSkins,
        };

        fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
        console.log(`💾 Saved ${validSkins.length} skins to ${filePath}`);

        return res.json({
          success: true,
          message: `Processed and saved ${validSkins.length} skins`,
          count: validSkins.length,
          saved: true,
          source: dataSource,
          filePath: "/data/skins.json",
          data: req.query.include_data === "true" ? validSkins : undefined,
        });
      } catch (saveError) {
        console.error("💥 Error saving file:", saveError);
        return res.status(500).json({
          success: false,
          error: `Failed to save file: ${saveError.message}`,
          count: validSkins.length,
          data: validSkins,
        });
      }
    }

    // Return processed data
    res.json({
      success: true,
      message: `Successfully processed ${validSkins.length} skins`,
      count: validSkins.length,
      saved: false,
      source: dataSource,
      data: validSkins,
    });
  } catch (error) {
    console.error("💥 Error processing skins:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

    const rawData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(rawData);

    // Handle both old format (direct array) and new format (with metadata)
    const skins = Array.isArray(data) ? data : data.skins;
    const metadata = data.metadata || { count: skins.length };

    res.json({
      success: true,
      count: skins.length,
      metadata: metadata,
      data: skins,
    });
  } catch (error) {
    console.error("💥 Error reading skins file:", error);
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
    message: "Fixed server running with enhanced error handling!",
    endpoints: [
      "GET /api/process-skins?save=true&include_data=true",
      "GET /api/skins",
      "GET /api/health",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`✅ Fixed Server running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   GET /api/process-skins?save=true&include_data=true`);
  console.log(`   GET /api/skins`);
  console.log(`   GET /api/health`);
  console.log(`🔄 Ready to process CS2 skins data!`);
});
