import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

console.log("🚀 NEW Server starting with ES modules...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Process skins endpoint
app.get("/api/process-skins", async (req, res) => {
  try {
    console.log("🔄 Processing CS2 skins from skins.json...");

    // Try the skins endpoint first (seems more reliable)
    const response = await axios.get("https://bymykel.github.io/CSGO-API/api/en/skins.json", {
      timeout: 30000,
      headers: { "User-Agent": "CS:GO-Trading-Dashboard/1.0" }
    });

    console.log("📡 API Response status:", response.status);
    console.log("📦 Response data type:", typeof response.data);
    console.log("📋 Response data sample:", JSON.stringify(response.data).substring(0, 200));

    // Check if we got an array directly (which is what skins.json returns)
    let skinsData;
    if (Array.isArray(response.data)) {
      skinsData = response.data;
    } else if (response.data?.skins && Array.isArray(response.data.skins)) {
      skinsData = response.data.skins;
    } else {
      console.error("❌ Unexpected response format:", response.data);
      return res.status(500).json({
        success: false,
        error: "Unexpected API response format",
        receivedData: typeof response.data,
        sample: JSON.stringify(response.data).substring(0, 100)
      });
    }

    if (!skinsData || skinsData.length === 0) {
      return res.status(500).json({
        success: false,
        error: "No skins data found or empty array received"
      });
    }
    }

    const skins = skinsData.map((skin) => ({
      name: skin.name || "Unknown",
      weapon: skin.name ? skin.name.split(" | ")[0] : "Unknown",
      rarity: skin.rarity?.name || skin.rarity || "Unknown",
      min_float: typeof skin.min_float === "number" ? skin.min_float : 0,
      max_float: typeof skin.max_float === "number" ? skin.max_float : 1,
      image: skin.image || "",
      collections: skin.crates?.map((c) => c.name || c) || [],
      souvenir: Boolean(skin.souvenir),
      stattrak: Boolean(skin.stattrak),
    }));

    const validSkins = skins.filter((s) => s.name && s.name !== "Unknown");

    if (req.query.save === "true") {
      const dataDir = path.join(__dirname, "public", "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, "skins.json");
      fs.writeFileSync(filePath, JSON.stringify(validSkins, null, 2));
      console.log(`💾 Saved ${validSkins.length} skins to ${filePath}`);
    }

    res.json({
      success: true,
      count: validSkins.length,
      message: `Processed ${validSkins.length} skins`,
      saved: req.query.save === "true",
      data: req.query.include_data === "true" ? validSkins : undefined,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/skins", (req, res) => {
  try {
    const filePath = path.join(__dirname, "public", "data", "skins.json");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Skins file not found. Run /api/process-skins?save=true first.",
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
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "New server running with ES modules!",
  });
});

app.listen(PORT, () => {
  console.log(`✅ NEW Server running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   GET /api/process-skins?save=true&include_data=true`);
  console.log(`   GET /api/skins`);
  console.log(`   GET /api/health`);
});