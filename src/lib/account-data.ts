export interface SteamAccount {
  id: string;
  nickname: string;
  proxy: string;
  twoFactorCode: string;
  tradeConfirmations: number;
  steamBalance: number;
  marketCSGOBalance: number;
  lisSkinBalance: number;
  inventoryValue: number;
  inventoryValueMarket: "Lis-Skins" | "Market.CSGO" | "Steam Market"; // which market the inventory value is based on
  status: "OK" | "Error";
  steamLevel: number;
  isActive: boolean;
  isPaused: boolean;
  lastActivity: string;
  profileUrl: string;
  avatarUrl?: string;
  // Login credentials
  login?: string;
  password?: string;
  proxyFull?: string; // ip:port:login:pass format
  maFile?: File;
  // API Keys
  steamApiKey?: string;
  marketCSGOApiKey?: string;
  lisSkinApiKey?: string;
  autoConfirmTrades: boolean;
}

export interface AccountStats {
  totalAccounts: number;
  activeAccounts: number;
  pausedAccounts: number;
  errorAccounts: number;
  totalSteamBalance: number;
  totalMarketCSGOBalance: number;
  totalLisSkinBalance: number;
  totalInventoryValue: number;
  totalTradeConfirmations: number;
}

// Mock data for demonstration
export const mockSteamAccounts: SteamAccount[] = [
  {
    id: "1",
    nickname: "Trader 1",
    proxy: "192.168.1.***",
    twoFactorCode: "YX7K9P",
    tradeConfirmations: 3,
    steamBalance: 45.67,
    marketCSGOBalance: 120.5,
    lisSkinBalance: 89.3,
    inventoryValue: 1250.3,
    inventoryValueMarket: "Lis-Skins",
    status: "OK",
    steamLevel: 42,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T14:30:00Z",
    profileUrl: "https://steamcommunity.com/id/trader1",
    avatarUrl: "/placeholder.svg",
    login: "trader1_account",
    password: "••••••••",
    proxyFull: "192.168.1.100:8080:user:pass",
    steamApiKey: "ABCD1234567890ABCD1234567890ABCD",
    marketCSGOApiKey: "mc_1234567890abcdef",
    lisSkinApiKey: "ls_abcdef1234567890",
    autoConfirmTrades: true,
  },
  {
    id: "2",
    nickname: "Trader 2",
    proxy: "10.0.0.***",
    twoFactorCode: "M3N8K2",
    tradeConfirmations: 0,
    steamBalance: 12.45,
    marketCSGOBalance: 67.8,
    lisSkinBalance: 45.2,
    inventoryValue: 890.75,
    inventoryValueMarket: "Market.CSGO",
    status: "OK",
    steamLevel: 35,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T12:15:00Z",
    profileUrl: "https://steamcommunity.com/id/trader2",
    avatarUrl: "/placeholder.svg",
    login: "trader2_main",
    password: "••••••••",
    proxyFull: "10.0.0.50:3128:trader:secret",
    steamApiKey: "EFGH5678901234EFGH5678901234EFGH",
    marketCSGOApiKey: "mc_5678901234abcdef",
    lisSkinApiKey: "ls_efgh5678901234ab",
    autoConfirmTrades: false,
  },
  {
    id: "3",
    nickname: "Bot Account 1",
    proxy: "172.16.0.***",
    twoFactorCode: "L9P4R7",
    tradeConfirmations: 7,
    steamBalance: 0.0,
    marketCSGOBalance: 0.0,
    lisSkinBalance: 156.75,
    inventoryValue: 2340.5,
    inventoryValueMarket: "Steam Market",
    status: "Error",
    steamLevel: 28,
    isActive: false,
    isPaused: true,
    lastActivity: "2024-01-29T18:45:00Z",
    profileUrl: "https://steamcommunity.com/id/botaccount1",
    avatarUrl: "/placeholder.svg",
    login: "bot_account_1",
    password: "••••••••",
    proxyFull: "172.16.0.25:1080:bot:password123",
    steamApiKey: "",
    marketCSGOApiKey: "",
    lisSkinApiKey: "ls_bot1234567890ab",
    autoConfirmTrades: true,
  },
  {
    id: "4",
    nickname: "Storage Bot",
    proxy: "203.0.113.***",
    twoFactorCode: "Q2W5E8",
    tradeConfirmations: 2,
    steamBalance: 5.25,
    marketCSGOBalance: 0.0,
    lisSkinBalance: 0.0,
    inventoryValue: 156.2,
    inventoryValueMarket: "Lis-Skins",
    status: "Error",
    steamLevel: 15,
    isActive: false,
    isPaused: false,
    lastActivity: "2024-01-28T09:20:00Z",
    profileUrl: "https://steamcommunity.com/id/storagebot",
    avatarUrl: "/placeholder.svg",
    login: "storage_bot",
    password: "••••••••",
    proxyFull: "203.0.113.15:8080:storage:storagepass",
    steamApiKey: "IJKL9012345678IJKL9012345678IJKL",
    marketCSGOApiKey: "",
    lisSkinApiKey: "",
    autoConfirmTrades: false,
  },
  {
    id: "5",
    nickname: "Trader 3",
    proxy: "198.51.100.***",
    twoFactorCode: "K8J7H6",
    tradeConfirmations: 1,
    steamBalance: 78.9,
    marketCSGOBalance: 234.6,
    lisSkinBalance: 178.4,
    inventoryValue: 675.4,
    inventoryValueMarket: "Market.CSGO",
    status: "OK",
    steamLevel: 51,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T16:20:00Z",
    profileUrl: "https://steamcommunity.com/id/trader3",
    avatarUrl: "/placeholder.svg",
    login: "trader3_pro",
    password: "••••••••",
    proxyFull: "198.51.100.33:8888:trader3:mypassword",
    steamApiKey: "MNOP3456789012MNOP3456789012MNOP",
    marketCSGOApiKey: "mc_3456789012abcdef",
    lisSkinApiKey: "ls_mnop3456789012cd",
    autoConfirmTrades: true,
  },
  {
    id: "6",
    nickname: "Market Bot",
    proxy: "192.0.2.***",
    twoFactorCode: "F4G5H1",
    tradeConfirmations: 12,
    steamBalance: 234.56,
    marketCSGOBalance: 445.3,
    lisSkinBalance: 389.7,
    inventoryValue: 3420.8,
    inventoryValueMarket: "Lis-Skins",
    status: "OK",
    steamLevel: 67,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T13:45:00Z",
    profileUrl: "https://steamcommunity.com/id/marketbot",
    avatarUrl: "/placeholder.svg",
    login: "market_bot_main",
    password: "••••••••",
    proxyFull: "192.0.2.77:3128:marketbot:securepass",
    steamApiKey: "QRST7890123456QRST7890123456QRST",
    marketCSGOApiKey: "mc_7890123456abcdef",
    lisSkinApiKey: "ls_qrst7890123456ef",
    autoConfirmTrades: true,
  },
];

export const calculateAccountStats = (
  accounts: SteamAccount[],
): AccountStats => {
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(
    (acc) => acc.isActive && !acc.isPaused,
  ).length;
  const pausedAccounts = accounts.filter((acc) => acc.isPaused).length;
  const errorAccounts = accounts.filter((acc) => acc.status === "Error").length;
  const totalSteamBalance = accounts.reduce(
    (sum, acc) => sum + acc.steamBalance,
    0,
  );
  const totalMarketCSGOBalance = accounts.reduce(
    (sum, acc) => sum + acc.marketCSGOBalance,
    0,
  );
  const totalLisSkinBalance = accounts.reduce(
    (sum, acc) => sum + acc.lisSkinBalance,
    0,
  );
  const totalInventoryValue = accounts.reduce(
    (sum, acc) => sum + acc.inventoryValue,
    0,
  );
  const totalTradeConfirmations = accounts.reduce(
    (sum, acc) => sum + acc.tradeConfirmations,
    0,
  );

  return {
    totalAccounts,
    activeAccounts,
    pausedAccounts,
    errorAccounts,
    totalSteamBalance,
    totalMarketCSGOBalance,
    totalLisSkinBalance,
    totalInventoryValue,
    totalTradeConfirmations,
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

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusBadgeVariant = (status: SteamAccount["status"]) => {
  switch (status) {
    case "OK":
      return "default";
    case "Error":
      return "destructive";
    default:
      return "outline";
  }
};
