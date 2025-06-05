export interface TradingItem {
  id: string;
  itemName: string;
  buyPrice: number;
  buyDate: string;
  market: "Lis-Skins" | "Market.CSGO" | "Buff163" | "Steam Market";
  assetId: string;
  status: "sold" | "unsold";
  sellPrice: number | null;
  sellDate: string | null;
  profit: number;
  profitPercentage: number;
  potentialProfit: number;
  tags: string[];
}

export interface TradingStats {
  totalSpent: number;
  totalEarned: number;
  totalProfit: number;
  averageROI: number;
  itemsInInventory: number;
  totalItems: number;
}

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
    profit: 6.8,
    profitPercentage: 7.95,
    potentialProfit: 0,
    tags: ["flip", "ak47"],
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
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 450.0,
    tags: ["invest", "awp", "high-tier"],
  },
  {
    id: "3",
    itemName: "M4A4 | Howl (Minimal Wear)",
    buyPrice: 2850.75,
    buyDate: "2024-01-08",
    market: "Buff163",
    assetId: "BF_123789456",
    status: "sold",
    sellPrice: 3120.5,
    sellDate: "2024-01-25",
    profit: 269.75,
    profitPercentage: 9.46,
    potentialProfit: 0,
    tags: ["invest", "m4a4", "contraband"],
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
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 25.8,
    tags: ["hold", "glock"],
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
    profit: 70.5,
    profitPercentage: 3.81,
    potentialProfit: 0,
    tags: ["flip", "knife", "karambit"],
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
    profit: 0,
    profitPercentage: 0,
    potentialProfit: 45.7,
    tags: ["hold", "ak47"],
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
