export interface ProcessedSkin {
  name: string;
  weapon: string;
  rarity: string;
  min_float: number;
  max_float: number;
  image: string;
  collections: string[];
  souvenir: boolean;
  stattrak: boolean;
}

export interface ProcessSkinsResponse {
  success: boolean;
  message: string;
  count: number;
  saved: boolean;
  filePath?: string;
  data?: ProcessedSkin[];
  error?: string;
}

const API_BASE_URL = import.meta.env.PROD
  ? "/api" // In production, API should be on same domain
  : "http://localhost:3001/api"; // Development server

/**
 * Fetches and processes CS2 skins data from ByMykel API (using all.json endpoint)
 * @param saveToFile - Whether to save the processed data to public/data/skins.json
 * @param includeData - Whether to include the processed data in the response
 * @returns Promise with the processing result
 */
export async function processSkins(
  saveToFile: boolean = true,
  includeData: boolean = false,
): Promise<ProcessSkinsResponse> {
  try {
    const params = new URLSearchParams({
      save: saveToFile.toString(),
      include_data: includeData.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/process-skins?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error processing skins:", error);
    return {
      success: false,
      message: "Failed to process skins",
      count: 0,
      saved: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetches the saved skins data from the server
 * @returns Promise with the saved skins data
 */
export async function getSavedSkins(): Promise<ProcessSkinsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/skins`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching saved skins:", error);
    return {
      success: false,
      message: "Failed to fetch saved skins",
      count: 0,
      saved: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Utility function to format skins data for display
 * @param skin - The processed skin data
 * @returns Formatted string for display
 */
export function formatSkinInfo(skin: ProcessedSkin): string {
  const badges = [];
  if (skin.stattrak) badges.push("StatTrak™");
  if (skin.souvenir) badges.push("Souvenir");

  const badgeText = badges.length > 0 ? ` (${badges.join(", ")})` : "";
  const floatRange = `Float: ${skin.min_float}-${skin.max_float}`;
  const collections =
    skin.collections.length > 0
      ? `Collections: ${skin.collections.join(", ")}`
      : "No collections";

  return `${skin.name}${badgeText} | ${skin.rarity} | ${floatRange} | ${collections}`;
}

/**
 * Utility function to group skins by weapon
 * @param skins - Array of processed skins
 * @returns Object with weapons as keys and arrays of skins as values
 */
export function groupSkinsByWeapon(
  skins: ProcessedSkin[],
): Record<string, ProcessedSkin[]> {
  return skins.reduce(
    (acc, skin) => {
      if (!acc[skin.weapon]) {
        acc[skin.weapon] = [];
      }
      acc[skin.weapon].push(skin);
      return acc;
    },
    {} as Record<string, ProcessedSkin[]>,
  );
}

/**
 * Utility function to group skins by rarity
 * @param skins - Array of processed skins
 * @returns Object with rarities as keys and arrays of skins as values
 */
export function groupSkinsByRarity(
  skins: ProcessedSkin[],
): Record<string, ProcessedSkin[]> {
  return skins.reduce(
    (acc, skin) => {
      if (!acc[skin.rarity]) {
        acc[skin.rarity] = [];
      }
      acc[skin.rarity].push(skin);
      return acc;
    },
    {} as Record<string, ProcessedSkin[]>,
  );
}

/**
 * Get unique values for filtering
 */
export function getUniqueWeapons(skins: ProcessedSkin[]): string[] {
  return [...new Set(skins.map((skin) => skin.weapon))].sort();
}

export function getUniqueRarities(skins: ProcessedSkin[]): string[] {
  return [...new Set(skins.map((skin) => skin.rarity))].sort();
}

export function getUniqueCollections(skins: ProcessedSkin[]): string[] {
  const allCollections = skins.flatMap((skin) => skin.collections);
  return [...new Set(allCollections)].sort();
}
