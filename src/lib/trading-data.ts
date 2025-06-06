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
  status: "sold" | "unsold";
  sellPrice: number | null;
  sellDate: string | null;
  sellMarket?: "Lis-Skins" | "Market.CSGO" | "Steam Market" | null;
  targetSellMarket?: "Lis-Skins" | "Market.CSGO" | "Steam Market" | null; // Selected marketplace during import
  currentMarketPrice?: number; // Current lowest price on target marketplace
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

// Mock data for demonstration
export const mockTradingItems: TradingItem[] = [
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
    itemName: "AWP | Dragon Lore (Well-Worn)",
    buyPrice: 4250.0,
    buyDate: "2024-01-10",
    market: "Market.CSGO",
    assetId: "MC_456789123",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Lis-Skins",
    currentMarketPrice: 4299.99,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 450.0,
    tags: ["invest", "awp", "high-tier"],
    stickers: [],
    charm: { name: "Gold Web Stuck" },
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/awp-dragon-lore-ww",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/AWP%20%7C%20Dragon%20Lore%20%28Well-Worn%29",
      marketCSGO: "https://market.csgo.com/item/awp-dragon-lore-ww",
    },
    accountId: "2",
  },
  {
    id: "3",
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
      { name: "Clan-Mystik | Katowice 2014", wear: 12, position: 3 },
    ],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/m4a4-howl-mw",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/M4A4%20%7C%20Howl%20%28Minimal%20Wear%29",
      marketCSGO: "https://market.csgo.com/item/m4a4-howl-mw",
    },
    accountId: "1",
  },
  {
    id: "4",
    itemName: "Glock-18 | Fade (Factory New)",
    buyPrice: 340.2,
    buyDate: "2024-01-20",
    market: "Steam Market",
    assetId: "SM_987654321",
    status: "unsold",
    sellPrice: null,
    sellDate: null,
    targetSellMarket: "Market.CSGO",
    currentMarketPrice: 355.5,
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 25.8,
    tags: ["hold", "glock"],
    stickers: [{ name: "Crown (Foil)", wear: 0, position: 1 }],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/glock-18-fade-fn",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/Glock-18%20%7C%20Fade%20%28Factory%20New%29",
      marketCSGO: "https://market.csgo.com/item/glock-18-fade-fn",
    },
    accountId: "3",
  },
  {
    id: "5",
    itemName: "Karambit | Crimson Web (Minimal Wear)",
    buyPrice: 1850.0,
    buyDate: "2024-01-12",
    market: "Lis-Skins",
    assetId: "LS_555123789",
    status: "sold",
    sellPrice: 1920.5,
    sellDate: "2024-01-28",
    sellMarket: "Market.CSGO",
    profit: 70.5,
    profitPercentage: 3.81,
    potentialProfit: 0,
    tags: ["flip", "knife", "karambit"],
    stickers: [],
    marketLinks: {
      lisSkins: "https://lis-skins.ru/item/karambit-crimson-web-mw",
      steamMarket:
        "https://steamcommunity.com/market/listings/730/Karambit%20%7C%20Crimson%20Web%20%28Minimal%20Wear%29",
      marketCSGO: "https://market.csgo.com/item/karambit-crimson-web-mw",
    },
    accountId: "1",
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
    potentialProfit: 45.7,
    tags: ["hold", "ak47"],
    stickers: [
      { name: "Titan | Katowice 2014", wear: 15, position: 1 },
      { name: "Natus Vincere | Katowice 2014", wear: 20, position: 2 },
      { name: "Virtus.pro | Katowice 2014", wear: 18, position: 3 },
      { name: "LGB eSports | Katowice 2014", wear: 22, position: 4 },
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
    (item) => item.status === "unsold",
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
