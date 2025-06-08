import { EnhancedItemData, ItemCategory } from "./csgo-api";

// Mock CS:GO item data based on the items visible in your trading table
// This includes real Steam Community Market image URLs
export const MOCK_CSGO_ITEMS: Record<string, EnhancedItemData> = {
  // M4A4 | Neo-Noir
  "M4A4 | Neo-Noir": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alDL_VqXlUu8p03-jBpYitigzn8hA_ZGygcISUdAM7MFyGrlLrlebnjZS4upic1zI",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Restricted",
      color: "#8847ff",
    },
  },

  // Desert Eagle | Blaze
  "Desert Eagle | Blaze": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PLZTjlH7du6kb-HnvD8J_WClTMEsJQpiL-Xo4723gLj-UNrNTqhcoSUe1Q3NFHR-wW4l-a915K7vZ_Kn3Q3uiFw5HnUgVXp1iTXHFrP",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Restricted",
      color: "#8847ff",
    },
  },

  // StatTrak™ AWP | Asiimov
  "StatTrak™ AWP | Asiimov": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJP7c-ikZKSqPrxN7LEmyUFuJx13LGQoY70jgW2-UE5NjiiItKcdgU4NF2D-gC-kOfpjJG5v8ycyyQ26ScqsH7fmBGpwUYbKBL8PFI",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Covert",
      color: "#d32ce6",
    },
  },

  // AWP | Asiimov (non-StatTrak)
  "AWP | Asiimov": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJP7c-ikZKSqPrxN7LEmyUFuJx13LGQoY70jgW2-UE5NjiiItKcdgU4NF2D-gC-kOfpjJG5v8ycyyQ26ScqsH7fmBGpwUYbKBL8PFI",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Covert",
      color: "#d32ce6",
    },
  },

  // Glock-18 | Fade
  "Glock-18 | Fade": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79eJmImMn-O6YOuCl2VV7cYkiOzA-LP5gVO8v11lNWr7d4XEdAE6Yl3X8lC3kuq5jZC56pqaz3c36yFx4XrZm0OwhB9Earc",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Restricted",
      color: "#8847ff",
    },
  },

  // ★ Butterfly Knife | Doppler
  "★ Butterfly Knife | Doppler": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPbTCl2JU6dNoxO-Ro9n331Cx_UM5MWH6d9DDdwE3YgvR_wK9wOfs1pe4u5vIzCBn6nIm-z-DyH7GaLJb",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Covert",
      color: "#d32ce6",
    },
  },

  // USP-S | Kill Confirmed
  "USP-S | Kill Confirmed": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09ulq5WYh8jnI_TDk2pcu5Qo0uqWo9ik0QTh_hJvYGGlLNOXcg47ZguBqQW4l-zphMK5vJjKwHVhviUq7S3fmhLjhh1Ia_sv26JdLDLW_g",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Classified",
      color: "#d32ce6",
    },
  },

  // AWP | Lightning Strike
  "AWP | Lightning Strike": {
    image:
      "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7cqWZU7Mxkh9bM8MLzjAzirhE9YG6hJNCRewU-ZAPA_1Lrweu61Je4v8vPnCNms3E8pSGKgG5Ihw",
    category: "Skin",
    categoryColor: "#3b82f6",
    rarity: {
      name: "Classified",
      color: "#d32ce6",
    },
  },
};

// Enhanced item matching function that handles StatTrak and wear conditions
export function findMockItemData(itemName: string): EnhancedItemData | null {
  // Direct match first
  if (MOCK_CSGO_ITEMS[itemName]) {
    return MOCK_CSGO_ITEMS[itemName];
  }

  // Remove StatTrak™ prefix and try again
  const withoutStatTrak = itemName.replace(/^StatTrak™\s+/, "");
  if (MOCK_CSGO_ITEMS[withoutStatTrak]) {
    return MOCK_CSGO_ITEMS[withoutStatTrak];
  }

  // Try removing wear condition suffix
  const withoutWear = itemName.replace(
    /\s+(Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)$/,
    "",
  );
  if (MOCK_CSGO_ITEMS[withoutWear]) {
    return MOCK_CSGO_ITEMS[withoutWear];
  }

  // Try both StatTrak and wear removal
  const cleanName = withoutStatTrak.replace(
    /\s+(Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)$/,
    "",
  );
  if (MOCK_CSGO_ITEMS[cleanName]) {
    return MOCK_CSGO_ITEMS[cleanName];
  }

  // Return null if not found
  return null;
}

// Default fallback item data for unknown items
export const DEFAULT_ITEM_DATA: EnhancedItemData = {
  image:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23374151'/%3E%3Ctext x='24' y='24' text-anchor='middle' dominant-baseline='middle' fill='%23D1D5DB' font-size='8'%3EIMG%3C/text%3E%3C/svg%3E",
  category: "Unknown",
  categoryColor: "#6b7280",
};
