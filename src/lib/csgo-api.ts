export interface CSGOApiItem {
  id: string;
  name: string;
  description?: string;
  weapon?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  pattern?: {
    id: string;
    name: string;
  };
  min_float?: number;
  max_float?: number;
  rarity?: {
    id: string;
    name: string;
    color: string;
  };
  stattrak?: boolean;
  souvenir?: boolean;
  crates?: Array<{
    id: string;
    name: string;
  }>;
  image?: string;
  market_hash_name?: string;
}

export interface CSGOApiResponse<T> {
  success: boolean;
  data: T[];
}

export type ItemCategory =
  | "Skin"
  | "Sticker"
  | "Agent"
  | "Keychain"
  | "Graffiti"
  | "Patch"
  | "Music Kit"
  | "Container"
  | "Key"
  | "Collectible";

export interface EnhancedItemData {
  image: string;
  category: ItemCategory;
  categoryColor: string;
  rarity?: {
    name: string;
    color: string;
  };
}

// Use public CORS proxy to bypass CORS restrictions
const CORS_PROXY = "https://corsproxy.io/?";
const API_BASE_URL = "https://bymykel.github.io/CSGO-API/api/en";

const ENDPOINTS = {
  skins: `${CORS_PROXY}${API_BASE_URL}/skins.json`,
  stickers: `${CORS_PROXY}${API_BASE_URL}/stickers.json`,
  agents: `${CORS_PROXY}${API_BASE_URL}/agents.json`,
  keychains: `${CORS_PROXY}${API_BASE_URL}/keychains.json`,
  graffiti: `${CORS_PROXY}${API_BASE_URL}/graffiti.json`,
  patches: `${CORS_PROXY}${API_BASE_URL}/patches.json`,
  music_kits: `${CORS_PROXY}${API_BASE_URL}/music_kits.json`,
  containers: `${CORS_PROXY}${API_BASE_URL}/containers.json`,
  keys: `${CORS_PROXY}${API_BASE_URL}/keys.json`,
  collectibles: `${CORS_PROXY}${API_BASE_URL}/collectibles.json`,
};

const CATEGORY_COLORS: Record<ItemCategory, string> = {
  Skin: "#3b82f6", // Blue
  Sticker: "#f59e0b", // Amber
  Agent: "#10b981", // Emerald
  Keychain: "#8b5cf6", // Violet
  Graffiti: "#ef4444", // Red
  Patch: "#14b8a6", // Teal
  "Music Kit": "#f97316", // Orange
  Container: "#6b7280", // Gray
  Key: "#fbbf24", // Yellow
  Collectible: "#ec4899", // Pink
};

class CSGOApiService {
  private cache = new Map<string, any>();
  private fetchPromises = new Map<string, Promise<any>>();

  private async fetchWithCache<T>(url: string): Promise<T[]> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    if (this.fetchPromises.has(url)) {
      return this.fetchPromises.get(url);
    }

    const fetchPromise = fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.cache.set(url, data);
        this.fetchPromises.delete(url);
        return data;
      })
      .catch((error) => {
        this.fetchPromises.delete(url);
        console.warn(`Failed to fetch from ${url}:`, error.message);
        return [];
      });

    this.fetchPromises.set(url, fetchPromise);
    return fetchPromise;
  }

  async getAllItems(): Promise<Map<string, EnhancedItemData>> {
    const itemMap = new Map<string, EnhancedItemData>();

    try {
      // Use the optimized /all endpoint from our proxy
      const response = await this.fetchWithCache<any>(ENDPOINTS.all);

      // Check if response is from our proxy format
      if (response && typeof response === "object" && "data" in response) {
        const { data, totalItems, errors } = response;

        if (errors && errors.length > 0) {
          console.warn("Some categories failed to load:", errors);
        }

        // Process each category from the combined response
        if (data.skins) this.processItems(data.skins, "Skin", itemMap);
        if (data.stickers) this.processItems(data.stickers, "Sticker", itemMap);
        if (data.agents) this.processItems(data.agents, "Agent", itemMap);
        if (data.keychains)
          this.processItems(data.keychains, "Keychain", itemMap);
        if (data.graffiti)
          this.processItems(data.graffiti, "Graffiti", itemMap);
        if (data.patches) this.processItems(data.patches, "Patch", itemMap);
        if (data.music_kits)
          this.processItems(data.music_kits, "Music Kit", itemMap);
        if (data.containers)
          this.processItems(data.containers, "Container", itemMap);
        if (data.keys) this.processItems(data.keys, "Key", itemMap);
        if (data.collectibles)
          this.processItems(data.collectibles, "Collectible", itemMap);

        console.log(
          `✅ Loaded ${itemMap.size} CS:GO items from proxy API (${totalItems} total from server)`,
        );
        return itemMap;
      }

      // Fallback: try individual endpoints if /all doesn't work
      console.log("Fallback: Using individual endpoints...");
      const [
        skins,
        stickers,
        agents,
        keychains,
        graffiti,
        patches,
        musicKits,
        containers,
        keys,
        collectibles,
      ] = await Promise.all([
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.skins),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.stickers),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.agents),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.keychains),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.graffiti),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.patches),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.music_kits),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.containers),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.keys),
        this.fetchWithCache<CSGOApiItem>(ENDPOINTS.collectibles),
      ]);

      // Process each category
      this.processItems(skins, "Skin", itemMap);
      this.processItems(stickers, "Sticker", itemMap);
      this.processItems(agents, "Agent", itemMap);
      this.processItems(keychains, "Keychain", itemMap);
      this.processItems(graffiti, "Graffiti", itemMap);
      this.processItems(patches, "Patch", itemMap);
      this.processItems(musicKits, "Music Kit", itemMap);
      this.processItems(containers, "Container", itemMap);
      this.processItems(keys, "Key", itemMap);
      this.processItems(collectibles, "Collectible", itemMap);

      console.log(
        `✅ Loaded ${itemMap.size} CS:GO items from fallback endpoints`,
      );
      return itemMap;
    } catch (error) {
      console.error("❌ Failed to fetch CS:GO API data:", error);
      return itemMap;
    }
  }

  private processItems(
    items: CSGOApiItem[],
    category: ItemCategory,
    itemMap: Map<string, EnhancedItemData>,
  ): void {
    items.forEach((item) => {
      const keys = this.generateItemKeys(item);
      const enhancedData: EnhancedItemData = {
        image: item.image || this.getDefaultImage(category),
        category,
        categoryColor: CATEGORY_COLORS[category],
        rarity: item.rarity
          ? {
              name: item.rarity.name,
              color: item.rarity.color,
            }
          : undefined,
      };

      keys.forEach((key) => {
        if (key && !itemMap.has(key)) {
          itemMap.set(key, enhancedData);
        }
      });
    });
  }

  private generateItemKeys(item: CSGOApiItem): string[] {
    const keys: string[] = [];

    // Add market_hash_name if available
    if (item.market_hash_name) {
      keys.push(item.market_hash_name);
    }

    // Add name
    if (item.name) {
      keys.push(item.name);
    }

    // Add normalized versions (lowercase, no special chars)
    if (item.name) {
      keys.push(item.name.toLowerCase());
      keys.push(item.name.toLowerCase().replace(/[^\w\s]/g, ""));
    }

    if (item.market_hash_name) {
      keys.push(item.market_hash_name.toLowerCase());
      keys.push(item.market_hash_name.toLowerCase().replace(/[^\w\s]/g, ""));
    }

    return keys;
  }

  private getDefaultImage(category: ItemCategory): string {
    // Return a data URL for a simple SVG icon based on category
    const iconSvg = this.getCategoryIcon(category);
    return `data:image/svg+xml;base64,${btoa(iconSvg)}`;
  }

  private getCategoryIcon(category: ItemCategory): string {
    const color = CATEGORY_COLORS[category];

    switch (category) {
      case "Skin":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="${color}" opacity="0.1"/><path d="M12 20h24v8H12z" fill="${color}"/></svg>`;
      case "Sticker":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="${color}" opacity="0.1"/><circle cx="24" cy="24" r="8" fill="${color}"/></svg>`;
      case "Agent":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="${color}" opacity="0.1"/><path d="M24 14c-4 0-7 3-7 7v13h14V21c0-4-3-7-7-7z" fill="${color}"/></svg>`;
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="${color}" opacity="0.1"/><rect x="16" y="16" width="16" height="16" fill="${color}"/></svg>`;
    }
  }

  findItemData(
    itemName: string,
    itemMap: Map<string, EnhancedItemData>,
  ): EnhancedItemData | null {
    // Try exact match first
    if (itemMap.has(itemName)) {
      return itemMap.get(itemName)!;
    }

    // Try lowercase match
    const lowerName = itemName.toLowerCase();
    if (itemMap.has(lowerName)) {
      return itemMap.get(lowerName)!;
    }

    // Try without special characters
    const normalizedName = itemName.toLowerCase().replace(/[^\w\s]/g, "");
    if (itemMap.has(normalizedName)) {
      return itemMap.get(normalizedName)!;
    }

    // Try partial matching for StatTrak items
    const cleanName = itemName.replace(/^StatTrak™\s+/, "");
    if (itemMap.has(cleanName)) {
      return itemMap.get(cleanName)!;
    }

    return null;
  }
}

export const csgoApiService = new CSGOApiService();
