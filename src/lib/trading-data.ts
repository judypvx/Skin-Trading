export interface Sticker {
  name: string;
  wear?: number; // 0-100 for sticker wear
  position: number; // 1-4 for position on weapon
}

export interface Charm {
  name: string;
}

export interface MarketLinks {
  lisSkins?: string;
  steamMarket?: string;
  marketCSGO?: string;
}

export interface TradingItem {
  id: string;
  itemName: string;
  buyPrice: number;
  buyDate: string;
  market: "Lis-Skins" | "Market.CSGO" | "Steam Market";
  assetId: string;
  status: "sold" | "unsold" | "waiting_unlock" | "trade_ban";
  sellPrice: number | null;
  sellDate: string | null;
  sellMarket?: "Lis-Skins" | "Market.CSGO" | "Steam Market" | null;
  targetSellMarket?: "Lis-Skins" | "Market.CSGO" | "Steam Market" | null; // Selected marketplace during import
  currentMarketPrice?: number; // Current lowest price on target marketplace
  unlock_at?: string | null; // ISO date string when item becomes tradable
  trade_ban_until?: string | null; // ISO date string when trade ban expires
  delivered_to_steam?: boolean; // Whether item has been delivered to Steam inventory
  profit: number;
  profitPercentage: number;
  potentialProfit: number;
  tags: string[];
  stickers: Sticker[];
  charm?: Charm;
  marketLinks: MarketLinks;
  accountId: string; // Steam account this item belongs to
}

export interface TradingStats {
  totalSpent: number;
  totalEarned: number;
  totalProfit: number;
  averageROI: number;
  itemsInInventory: number;
  totalItems: number;
}

export interface SteamAccountBasic {
  id: string;
  nickname: string;
}

// Steam accounts for dropdown selector
export const mockSteamAccountsBasic: SteamAccountBasic[] = [
  { id: "all", nickname: "All Accounts" },
  { id: "1", nickname: "Trader 1" },
  { id: "2", nickname: "Trader 2" },
  { id: "3", nickname: "Bot Account 1" },
  { id: "4", nickname: "Storage Bot" },
  { id: "5", nickname: "Trader 3" },
  { id: "6", nickname: "Market Bot" },
];

// Test data with items distributed across each account
export const mockTradingItems: TradingItem[] = [
  // Trader 1 items (Account ID: "1")
  {
    id: "1",
    itemName: "AK-47 | Redline (Field-Tested)",
    buyPrice: 85.5,
    buyDate: "2024-01-15",
    market: "Lis-Skins",
    assetId: "LS_789123456",
    status: "sold",
    sellPrice: 92.3,
    sellDate: "2024-01-22",
    sellMarket: "Steam Market",
    profit: 6.8,
    profitPercentage: 7.95,
    potentialProfit: 0,
    tags: ["flip", "ak47"],
    stickers: [
      { name: "Howling Dawn", wear: 10, position: 1 },
      { name: "iBUYPOWER | Katowice 2014", wear: 25, position: 2 },
    ],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/ak47-redline-ft",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Redline%20%28Field-Tested%29",
      marketCSGO: "https://market.csgo.com/item/ak47-redline-ft",
    },
    accountId: "1",
  },
  {
    id: "2",
    itemName: "AWP | Lightning Strike (Factory New)",
    buyPrice: 195.25,
    buyDate: "2024-01-20",
    market: "Steam Market",
    assetId: "SM_987654321",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Market.CSGO",
    currentMarketPrice: 218.4,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 23.15,
    tags: ["awp", "lightning"],
    stickers: [{ name: "Crown (Foil)", wear: 0, position: 1 }],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/awp-lightning-strike-fn",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/AWP%20%7C%20Lightning%20Strike%20%28Factory%20New%29",
      marketCSGO: "https://market.csgo.com/item/awp-lightning-strike-fn",
    },
    accountId: "1",
  },
  {
    id: "3",
    itemName: "Glock-18 | Fade (Factory New)",
    buyPrice: 340.2,
    buyDate: "2024-02-01",
    market: "Market.CSGO",
    assetId: "MC_456789123",
    status: "waiting_unlock",
    sellPrice: null,
    sellDate: null,
    unlock_at: "2024-02-15T14:30:00Z",
    targetSellMarket: "Lis-Skins",
    currentMarketPrice: 355.5,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 15.3,
    tags: ["glock", "fade"],
    stickers: [],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/glock-18-fade-fn",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/Glock-18%20%7C%20Fade%20%28Factory%20New%29",
      marketCSGO: "https://market.csgo.com/item/glock-18-fade-fn",
    },
    accountId: "1",
  },

  // Trader 2 items (Account ID: "2")
  {
    id: "4",
    itemName: "M4A4 | Howl (Minimal Wear)",
    buyPrice: 2850.75,
    buyDate: "2024-01-08",
    market: "Steam Market",
    assetId: "SM_123789456",
    status: "sold",
    sellPrice: 3120.5,
    sellDate: "2024-01-25",
    sellMarket: "Lis-Skins",
    profit: 269.75,
    profitPercentage: 9.46,
    potentialProfit: 0,
    tags: ["invest", "m4a4", "contraband"],
    stickers: [
      { name: "Reason Gaming | Katowice 2014", wear: 5, position: 1 },
      { name: "Team Dignitas | Katowice 2014", wear: 8, position: 2 },
    ],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/m4a4-howl-mw",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/M4A4%20%7C%20Howl%20%28Minimal%20Wear%29",
      marketCSGO: "https://market.csgo.com/item/m4a4-howl-mw",
    },
    accountId: "2",
  },
  {
    id: "5",
    itemName: "Karambit | Crimson Web (Minimal Wear)",
    buyPrice: 1850.0,
    buyDate: "2024-01-12",
    market: "Lis-Skins",
    assetId: "LS_555123789",
    status: "trade_ban",
    sellPrice: null,
    sellDate: null,
    trade_ban_until: "2024-02-20T10:30:00Z",
    targetSellMarket: "Market.CSGO",
    currentMarketPrice: 1920.5,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 70.5,
    tags: ["knife", "karambit"],
    stickers: [],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/karambit-crimson-web-mw",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/Karambit%20%7C%20Crimson%20Web%20%28Minimal%20Wear%29",
      marketCSGO: "https://market.csgo.com/item/karambit-crimson-web-mw",
    },
    accountId: "2",
  },
  {
    id: "6",
    itemName: "AK-47 | Fire Serpent (Field-Tested)",
    buyPrice: 680.3,
    buyDate: "2024-01-18",
    market: "Market.CSGO",
    assetId: "MC_111222333",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Lis-Skins",
    currentMarketPrice: 715.9,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 35.6,
    tags: ["ak47", "fire-serpent"],
    stickers: [
      { name: "Titan | Katowice 2014", wear: 15, position: 1 },
      { name: "Natus Vincere | Katowice 2014", wear: 20, position: 2 },
    ],
    charm: { name: "Terrorist Fist Bump" },
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/ak47-fire-serpent-ft",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Fire%20Serpent%20%28Field-Tested%29",
      marketCSGO: "https://market.csgo.com/item/ak47-fire-serpent-ft",
    },
    accountId: "2",
  },

  // Bot Account 1 items (Account ID: "3")
  {
    id: "7",
    itemName: "StatTrak™ M4A1-S | Hyper Beast (Field-Tested)",
    buyPrice: 125.75,
    buyDate: "2024-01-25",
    market: "Steam Market",
    assetId: "SM_789456123",
    status: "sold",
    sellPrice: 142.3,
    sellDate: "2024-02-02",
    sellMarket: "Market.CSGO",
    profit: 16.55,
    profitPercentage: 13.16,
    potentialProfit: 0,
    tags: ["stattrak", "m4a1s"],
    stickers: [
      { name: "Team Liquid | MLG Columbus 2016", wear: 35, position: 1 },
      { name: "FaZe Clan | MLG Columbus 2016", wear: 40, position: 2 },
    ],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/m4a1s-hyper-beast-ft-st",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/StatTrak%E2%84%A2%20M4A1-S%20%7C%20Hyper%20Beast%20%28Field-Tested%29",
      marketCSGO: "https://market.csgo.com/item/m4a1s-hyper-beast-ft-st",
    },
    accountId: "3",
  },
  {
    id: "8",
    itemName: "USP-S | Kill Confirmed (Minimal Wear)",
    buyPrice: 45.2,
    buyDate: "2024-01-30",
    market: "Market.CSGO",
    assetId: "MC_555666777",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Lis-Skins",
    currentMarketPrice: 52.75,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 7.55,
    tags: ["usps", "pistol"],
    stickers: [{ name: "Skull Troop", wear: 15, position: 1 }],
    charm: { name: "Death Awaits" },
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/usps-kill-confirmed-mw",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/USP-S%20%7C%20Kill%20Confirmed%20%28Minimal%20Wear%29",
      marketCSGO: "https://market.csgo.com/item/usps-kill-confirmed-mw",
    },
    accountId: "3",
  },

  // Storage Bot items (Account ID: "4")
  {
    id: "9",
    itemName: "★ Butterfly Knife | Doppler (Factory New)",
    buyPrice: 1245.0,
    buyDate: "2024-02-01",
    market: "Lis-Skins",
    assetId: "LS_999888777",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Steam Market",
    currentMarketPrice: 1180.5,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: -64.5,
    tags: ["knife", "butterfly", "doppler"],
    stickers: [],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/butterfly-knife-doppler-fn",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/%E2%98%85%20Butterfly%20Knife%20%7C%20Doppler%20%28Factory%20New%29",
      marketCSGO: "https://market.csgo.com/item/butterfly-knife-doppler-fn",
    },
    accountId: "4",
  },
  {
    id: "10",
    itemName: "★ Karambit | Fade (Factory New)",
    buyPrice: 2890.0,
    buyDate: "2024-01-05",
    market: "Steam Market",
    assetId: "SM_111333555",
    status: "sold",
    sellPrice: 3125.75,
    sellDate: "2024-01-18",
    sellMarket: "Lis-Skins",
    profit: 235.75,
    profitPercentage: 8.16,
    potentialProfit: 0,
    tags: ["knife", "karambit", "fade"],
    stickers: [],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/karambit-fade-fn",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/%E2%98%85%20Karambit%20%7C%20Fade%20%28Factory%20New%29",
      marketCSGO: "https://market.csgo.com/item/karambit-fade-fn",
    },
    accountId: "4",
  },
  {
    id: "11",
    itemName: "Desert Eagle | Blaze (Factory New)",
    buyPrice: 185.3,
    buyDate: "2024-02-05",
    market: "Market.CSGO",
    assetId: "MC_777888999",
    status: "waiting_unlock",
    sellPrice: null,
    sellDate: null,
    unlock_at: "2024-02-18T16:45:00Z",
    targetSellMarket: "Steam Market",
    currentMarketPrice: 195.8,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 10.5,
    tags: ["deagle", "pistol"],
    stickers: [
      { name: "Flammable (Foil)", wear: 5, position: 1 },
      { name: "Phoenix (Foil)", wear: 8, position: 2 },
    ],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/deagle-blaze-fn",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/Desert%20Eagle%20%7C%20Blaze%20%28Factory%20New%29",
      marketCSGO: "https://market.csgo.com/item/deagle-blaze-fn",
    },
    accountId: "4",
  },

  // Trader 3 items (Account ID: "5")
  {
    id: "12",
    itemName: "AK-47 | Case Hardened (Battle-Scarred)",
    buyPrice: 95.75,
    buyDate: "2024-01-28",
    market: "Lis-Skins",
    assetId: "LS_444555666",
    status: "sold",
    sellPrice: 87.2,
    sellDate: "2024-02-08",
    sellMarket: "Market.CSGO",
    profit: -8.55,
    profitPercentage: -8.93,
    potentialProfit: 0,
    tags: ["ak47", "case-hardened"],
    stickers: [
      { name: "Blue Gem", wear: 25, position: 1 },
      { name: "Golden Coil", wear: 30, position: 2 },
    ],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/ak47-case-hardened-bs",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Case%20Hardened%20%28Battle-Scarred%29",
      marketCSGO: "https://market.csgo.com/item/ak47-case-hardened-bs",
    },
    accountId: "5",
  },
  {
    id: "13",
    itemName: "StatTrak™ AWP | Asiimov (Field-Tested)",
    buyPrice: 485.9,
    buyDate: "2024-02-03",
    market: "Steam Market",
    assetId: "SM_123123123",
    status: "trade_ban",
    sellPrice: null,
    sellDate: null,
    trade_ban_until: "2024-02-16T09:00:00Z",
    targetSellMarket: "Market.CSGO",
    currentMarketPrice: 505.25,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 19.35,
    tags: ["stattrak", "awp", "asiimov"],
    stickers: [
      { name: "kennyS | Cluj-Napoca 2015", wear: 10, position: 1 },
      { name: "GuardiaN | Cluj-Napoca 2015", wear: 12, position: 2 },
    ],
    charm: { name: "Sniper's Focus" },
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/awp-asiimov-ft-st",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/StatTrak%E2%84%A2%20AWP%20%7C%20Asiimov%20%28Field-Tested%29",
      marketCSGO: "https://market.csgo.com/item/awp-asiimov-ft-st",
    },
    accountId: "5",
  },

  // Market Bot items (Account ID: "6")
  {
    id: "14",
    itemName: "★ Bayonet | Tiger Tooth (Factory New)",
    buyPrice: 755.4,
    buyDate: "2024-01-22",
    market: "Market.CSGO",
    assetId: "MC_987987987",
    status: "sold",
    sellPrice: 812.85,
    sellDate: "2024-02-01",
    sellMarket: "Steam Market",
    profit: 57.45,
    profitPercentage: 7.61,
    potentialProfit: 0,
    tags: ["knife", "bayonet", "tiger-tooth"],
    stickers: [],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/bayonet-tiger-tooth-fn",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/%E2%98%85%20Bayonet%20%7C%20Tiger%20Tooth%20%28Factory%20New%29",
      marketCSGO: "https://market.csgo.com/item/bayonet-tiger-tooth-fn",
    },
    accountId: "6",
  },
  {
    id: "15",
    itemName: "M4A4 | Neo-Noir (Field-Tested)",
    buyPrice: 78.65,
    buyDate: "2024-02-06",
    market: "Lis-Skins",
    assetId: "LS_666777888",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Steam Market",
    currentMarketPrice: 82.4,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 3.75,
    tags: ["m4a4", "neo-noir"],
    stickers: [{ name: "Virtus.pro | Boston 2018", wear: 20, position: 1 }],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/m4a4-neo-noir-ft",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/M4A4%20%7C%20Neo-Noir%20%28Field-Tested%29",
      marketCSGO: "https://market.csgo.com/item/m4a4-neo-noir-ft",
    },
    accountId: "6",
  },
  {
    id: "16",
    itemName: "P90 | Death by Kitty (Minimal Wear)",
    buyPrice: 85.0,
    buyDate: "2024-01-18",
    market: "Steam Market",
    assetId: "SM_777999888",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Market.CSGO",
    currentMarketPrice: 92.25,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 7.25,
    tags: ["p90", "death-by-kitty"],
    stickers: [{ name: "Kawaii Killer CT", wear: 25, position: 1 }],
    charm: { name: "Backstab" },
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/p90-death-by-kitty-mw",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/P90%20%7C%20Death%20by%20Kitty%20%28Minimal%20Wear%29",
      marketCSGO: "https://market.csgo.com/item/p90-death-by-kitty-mw",
    },
    accountId: "6",
  },
];

export const calculateStats = (items: TradingItem[]): TradingStats => {
  const totalSpent = items.reduce((sum, item) => sum + item.buyPrice, 0);
  const totalEarned = items
    .filter((item) => item.status === "sold")
    .reduce((sum, item) => sum + (item.sellPrice || 0), 0);
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
  const soldItems = items.filter((item) => item.status === "sold");
  const averageROI =
    soldItems.length > 0
      ? soldItems.reduce((sum, item) => sum + item.profitPercentage, 0) /
        soldItems.length
      : 0;
  const itemsInInventory = items.filter(
    (item) =>
      item.status === "unsold" ||
      item.status === "waiting_unlock" ||
      item.status === "trade_ban",
  ).length;

  return {
    totalSpent,
    totalEarned,
    totalProfit,
    averageROI,
    itemsInInventory,
    totalItems: items.length,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
