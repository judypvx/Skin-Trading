export interface SteamAccount {
  id: string;
  nickname: string;
  proxy: string;
  twoFactorCode: string;
  tradeConfirmations: number;
  steamBalance: number;
  inventoryValue: number;
  status: "OK" | "Error" | "Needs Check";
  steamLevel: number;
  isActive: boolean;
  isPaused: boolean;
  lastActivity: string;
  profileUrl: string;
  avatarUrl?: string;
}

export interface AccountStats {
  totalAccounts: number;
  activeAccounts: number;
  pausedAccounts: number;
  errorAccounts: number;
  totalBalance: number;
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
    inventoryValue: 1250.3,
    status: "OK",
    steamLevel: 42,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T14:30:00Z",
    profileUrl: "https://steamcommunity.com/id/trader1",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "2",
    nickname: "Trader 2",
    proxy: "10.0.0.***",
    twoFactorCode: "M3N8K2",
    tradeConfirmations: 0,
    steamBalance: 12.45,
    inventoryValue: 890.75,
    status: "OK",
    steamLevel: 35,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T12:15:00Z",
    profileUrl: "https://steamcommunity.com/id/trader2",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "3",
    nickname: "Bot Account 1",
    proxy: "172.16.0.***",
    twoFactorCode: "L9P4R7",
    tradeConfirmations: 7,
    steamBalance: 0.0,
    inventoryValue: 2340.5,
    status: "Needs Check",
    steamLevel: 28,
    isActive: false,
    isPaused: true,
    lastActivity: "2024-01-29T18:45:00Z",
    profileUrl: "https://steamcommunity.com/id/botaccount1",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "4",
    nickname: "Storage Bot",
    proxy: "203.0.113.***",
    twoFactorCode: "Q2W5E8",
    tradeConfirmations: 2,
    steamBalance: 5.25,
    inventoryValue: 156.2,
    status: "Error",
    steamLevel: 15,
    isActive: false,
    isPaused: false,
    lastActivity: "2024-01-28T09:20:00Z",
    profileUrl: "https://steamcommunity.com/id/storagebot",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "5",
    nickname: "Trader 3",
    proxy: "198.51.100.***",
    twoFactorCode: "K8J7H6",
    tradeConfirmations: 1,
    steamBalance: 78.9,
    inventoryValue: 675.4,
    status: "OK",
    steamLevel: 51,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T16:20:00Z",
    profileUrl: "https://steamcommunity.com/id/trader3",
    avatarUrl: "/placeholder.svg",
  },
  {
    id: "6",
    nickname: "Market Bot",
    proxy: "192.0.2.***",
    twoFactorCode: "F4G5H1",
    tradeConfirmations: 12,
    steamBalance: 234.56,
    inventoryValue: 3420.8,
    status: "OK",
    steamLevel: 67,
    isActive: true,
    isPaused: false,
    lastActivity: "2024-01-30T13:45:00Z",
    profileUrl: "https://steamcommunity.com/id/marketbot",
    avatarUrl: "/placeholder.svg",
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
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.steamBalance, 0);
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
    totalBalance,
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
    case "Needs Check":
      return "secondary";
    default:
      return "outline";
  }
};
