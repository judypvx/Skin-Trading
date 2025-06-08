import { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpDown,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Star,
  Package,
  History,
  X,
  Users,
} from "lucide-react";
import {
  TradingItem,
  formatCurrency,
  formatPercentage,
  formatDate,
  mockSteamAccountsBasic,
} from "@/lib/trading-data";
import {
  TradingTableSettings,
  loadSettings,
  saveSettings,
} from "@/lib/settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TradingTableProps {
  items: TradingItem[];
  onUpdateItem?: (id: string, updates: Partial<TradingItem>) => void;
}

type SortField =
  | "itemName"
  | "buyPrice"
  | "buyDate"
  | "market"
  | "status"
  | "sellPrice"
  | "sellDate"
  | "profit";

type SortDirection = "asc" | "desc";

interface DateRange {
  startDate: string | null;
  endDate: string | null;
  preset: string;
}

const TradingTable = ({ items, onUpdateItem }: TradingTableProps) => {
  const [activeTab, setActiveTab] = useState<"inventory" | "history">(
    "inventory",
  );
  const [sortField, setSortField] = useState<SortField>("buyDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [marketFilters, setMarketFilters] = useState<string[]>([]);
  const [accountFilters, setAccountFilters] = useState<string[]>([]);
  const [settings, setSettings] = useState<TradingTableSettings>(() => {
    const loaded = loadSettings();
    return loaded;
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    preset: "all-time",
  });

  const getDatePresetRange = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case "today":
        return {
          startDate: today.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday.toISOString().split("T")[0],
          endDate: yesterday.toISOString().split("T")[0],
        };
      case "last-7-days":
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return {
          startDate: lastWeek.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "last-30-days":
        const lastMonth = new Date(today);
        lastMonth.setDate(lastMonth.getDate() - 30);
        return {
          startDate: lastMonth.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "this-month":
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: thisMonthStart.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "last-month":
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: lastMonthStart.toISOString().split("T")[0],
          endDate: lastMonthEnd.toISOString().split("T")[0],
        };
      default:
        return { startDate: null, endDate: null };
    }
  };

  // Helper function to extract StatTrak and wear condition from item name
  const extractItemNameParts = (itemName: string) => {
    let processedName = itemName;
    let isStatTrak = false;

    // Check for StatTrak™
    if (processedName.startsWith("StatTrak™ ")) {
      isStatTrak = true;
      processedName = processedName.replace("StatTrak™ ", "");
    }

    // Extract wear condition
    const wearConditions = [
      "Factory New",
      "Minimal Wear",
      "Field-Tested",
      "Well-Worn",
      "Battle-Scarred",
    ];

    let wearCondition = null;
    for (const condition of wearConditions) {
      if (processedName.includes(`(${condition})`)) {
        wearCondition = condition;
        processedName = processedName.replace(` (${condition})`, "");
        break;
      }
    }

    return {
      nameWithoutPrefixes: processedName,
      wearCondition,
      isStatTrak,
    };
  };

  const clearAllMarkets = () => {
    setMarketFilters([]);
  };

  const selectAllMarkets = () => {
    const allMarkets = Array.from(new Set(items.map((item) => item.market)));
    setMarketFilters(allMarkets);
  };

  const clearAllAccounts = () => {
    setAccountFilters([]);
  };

  const selectAllAccounts = () => {
    const allAccounts = Array.from(
      new Set(items.map((item) => item.accountId)),
    );
    setAccountFilters(allAccounts);
  };

  const getStatusBadge = (item: TradingItem) => {
    const getDaysLeft = (dateString: string) => {
      const targetDate = new Date(dateString);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    switch (item.status) {
      case "sold":
        return (
          <div className="flex items-center justify-center">
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Sold
            </Badge>
          </div>
        );
      case "trade_ban":
        const tradeBanDaysLeft = item.trade_ban_until
          ? getDaysLeft(item.trade_ban_until)
          : null;
        return (
          <div className="flex items-center justify-center">
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              {tradeBanDaysLeft !== null && tradeBanDaysLeft > 0
                ? `Trade Ban - ${tradeBanDaysLeft}d Left`
                : "Trade Ban"}
            </Badge>
          </div>
        );
      case "waiting_unlock":
        const unlockDaysLeft = item.unlock_at
          ? getDaysLeft(item.unlock_at)
          : null;
        return (
          <div className="flex items-center justify-center">
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {unlockDaysLeft !== null && unlockDaysLeft > 0
                ? `Waiting for Unlock - ${unlockDaysLeft}d`
                : "Waiting for Unlock"}
            </Badge>
          </div>
        );
      case "unsold":
      default:
        return (
          <div className="flex items-center justify-center">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Unlocked
            </Badge>
          </div>
        );
    }
  };

  const getSellInfoDisplay = (item: TradingItem) => {
    if (item.status === "sold" && item.sellPrice && item.sellDate) {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center w-full mb-1">
            <Badge
              variant="outline"
              className="text-xs text-center whitespace-nowrap"
            >
              {item.sellMarket || "Unknown Market"}
            </Badge>
          </div>
          <div className="text-center">
            <div className="font-semibold text-base">
              {formatCurrency(item.sellPrice)}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(item.sellDate)}
            </div>
          </div>
        </div>
      );
    } else {
      // For unsold items, show current market price or target market
      const currentPrice = item.currentMarketPrice;
      const targetMarket =
        item.targetSellMarket || item.sellMarket || "Steam Market";

      return (
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center w-full mb-1">
            <Badge
              variant="outline"
              className="text-xs text-center whitespace-nowrap"
            >
              {targetMarket}
            </Badge>
          </div>
          <div className="text-center">
            <div className="font-semibold text-base">
              {currentPrice ? formatCurrency(currentPrice) : "—"}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Current lowest
            </div>
          </div>
        </div>
      );
    }
  };

  const getProfitDisplay = (item: TradingItem) => {
    if (item.status === "sold") {
      const profit = item.profit;
      const profitPercentage = item.profitPercentage;
      const isProfit = profit > 0;

      const Icon = isProfit ? TrendingUp : TrendingDown;
      const colorClass = isProfit
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";
      const bgColorClass = isProfit
        ? "bg-green-100 dark:bg-green-900"
        : "bg-red-100 dark:bg-red-900";

      return (
        <div className="flex flex-col items-center justify-center">
          <div className={`font-medium text-lg ${colorClass}`}>
            {formatCurrency(profit)}
          </div>
          <div
            className={`flex items-center justify-center gap-1 ${bgColorClass} rounded px-2 py-1 whitespace-nowrap mt-1`}
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{isProfit ? "Profit" : "Loss"}</span>
          </div>
          <div className="text-xs opacity-80 mt-0.5">
            ({formatPercentage(profitPercentage)})
          </div>
        </div>
      );
    } else {
      // For unsold items, show potential profit
      const potentialProfit = item.potentialProfit;
      const potentialProfitPercentage =
        item.buyPrice > 0 ? (potentialProfit / item.buyPrice) * 100 : 0;
      const isProfit = potentialProfit > 0;

      const Icon = isProfit ? TrendingUp : TrendingDown;
      const colorClass = isProfit
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";

      return (
        <div className="flex flex-col items-center justify-center">
          <div className={`font-medium text-lg ${colorClass}`}>
            {formatCurrency(potentialProfit)}
          </div>
          <div className="flex items-center justify-center gap-1 whitespace-nowrap mt-1">
            <Icon className="h-3 w-3" />
            <span className="text-xs">Potential</span>
          </div>
          <div className="text-xs opacity-80 mt-0.5">
            ({formatPercentage(potentialProfitPercentage)})
          </div>
        </div>
      );
    }
  };

  const getPotentialProfitDisplay = (item: TradingItem) => {
    if (item.status === "sold") {
      return <span className="text-muted-foreground">—</span>;
    }

    const potentialProfit = item.potentialProfit;
    const potentialProfitPercentage =
      item.buyPrice > 0 ? (potentialProfit / item.buyPrice) * 100 : 0;
    const isProfit = potentialProfit > 0;

    const Icon = isProfit ? TrendingUp : TrendingDown;
    const textColorClass = isProfit
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

    return (
      <div className="flex items-center justify-center gap-2">
        <div className={`flex items-center gap-1 ${textColorClass}`}>
          <Icon className="h-4 w-4" />
          <span className="font-medium">{formatCurrency(potentialProfit)}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          ({formatPercentage(potentialProfitPercentage)})
        </span>
      </div>
    );
  };

  const getStickersAndCharmDisplay = (item: TradingItem) => {
    const hasStickers = item.stickers && item.stickers.length > 0;
    const hasCharm = item.charm;

    if (!hasStickers && !hasCharm) {
      return (
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">—</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1">
        {hasStickers &&
          item.stickers.slice(0, 4).map((sticker, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center">
                    <Star className="h-3 w-3 text-yellow-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{sticker.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        {hasCharm && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">C</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.charm.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const getMarketLinksDisplay = (item: TradingItem) => {
    return (
      <div className="flex items-center justify-center gap-1">
        {item.marketLinks.lisSkins && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center cursor-pointer hover:bg-blue-200">
                  <span className="text-xs font-bold">L</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lis-Skins</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {item.marketLinks.marketCSGO && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center cursor-pointer hover:bg-green-200">
                  <span className="text-xs font-bold">M</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Market.CSGO</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {item.marketLinks.steamMarket && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200">
                  <span className="text-xs font-bold">S</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Steam Market</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      // Tab filtering
      if (activeTab === "inventory") {
        return ["unsold", "waiting_unlock", "trade_ban"].includes(item.status);
      } else {
        return item.status === "sold";
      }
    });

    // Search filtering
    if (searchTerm) {
      const matchesSearch = item.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      filtered = filtered.filter((item) => matchesSearch);
    }

    // Multi-select market filtering - if no markets selected, show all
    if (marketFilters.length > 0) {
      filtered = filtered.filter((item) => marketFilters.includes(item.market));
    }

    // Multi-select account filtering - if no accounts selected, show all
    if (accountFilters.length > 0) {
      filtered = filtered.filter((item) =>
        accountFilters.includes(item.accountId),
      );
    }

    // Date range filtering (only for sell history tab)
    if (activeTab === "history") {
      if (dateRange.startDate || dateRange.endDate) {
        filtered = filtered.filter((item) => {
          if (!item.sellDate) return false;
          const sellDate = new Date(item.sellDate);
          const startDate = dateRange.startDate
            ? new Date(dateRange.startDate)
            : null;
          const endDate = dateRange.endDate
            ? new Date(dateRange.endDate)
            : null;

          if (startDate && sellDate < startDate) return false;
          if (endDate && sellDate > endDate) return false;
          return true;
        });
      }
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "itemName":
          aValue = a.itemName.toLowerCase();
          bValue = b.itemName.toLowerCase();
          break;
        case "buyPrice":
          aValue = a.buyPrice;
          bValue = b.buyPrice;
          break;
        case "buyDate":
          aValue = new Date(a.buyDate);
          bValue = new Date(b.buyDate);
          break;
        case "market":
          aValue = a.market.toLowerCase();
          bValue = b.market.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "sellPrice":
          aValue = a.sellPrice || 0;
          bValue = b.sellPrice || 0;
          break;
        case "sellDate":
          aValue = a.sellDate ? new Date(a.sellDate) : new Date(0);
          bValue = b.sellDate ? new Date(b.sellDate) : new Date(0);
          break;
        case "profit":
          aValue = a.profit;
          bValue = b.profit;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [
    items,
    searchTerm,
    marketFilters,
    accountFilters,
    sortField,
    sortDirection,
    activeTab,
    dateRange,
  ]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Get visible columns from settings, filtered to exclude removed columns
  const visibleColumns = settings.columns
    .filter((col) => col.visible)
    .filter((col) => col.id !== "itemImage" && col.id !== "assetId");

  // Count items for each tab
  const inventoryCount = items.filter((item) =>
    ["unsold", "waiting_unlock", "trade_ban"].includes(item.status),
  ).length;
  const historyCount = items.filter((item) => item.status === "sold").length;

  // Save settings when they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Update sort direction for existing sorted field
  useEffect(() => {
    if (sortField === "buyDate" && sortDirection === "asc") {
      setSortDirection("desc");
    }
  }, []);

  const markets = ["Lis-Skins", "Market.CSGO", "Steam Market"];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Trading Items</span>
          </CardTitle>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "inventory" | "history")
          }
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="inventory" className="gap-2">
                <Package className="h-4 w-4" />
                Inventory ({inventoryCount})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Sell History ({historyCount})
              </TabsTrigger>
            </TabsList>

            <span className="text-sm text-muted-foreground">
              {filteredAndSortedItems.length} of{" "}
              {activeTab === "inventory" ? inventoryCount : historyCount} items
            </span>
          </div>

          <TabsContent value="inventory" className="space-y-4 mt-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search inventory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Markets
                      {marketFilters.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {marketFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter by Market</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Array.from(new Set(items.map((item) => item.market))).map(
                      (market) => (
                        <DropdownMenuItem
                          key={market}
                          className="flex items-center space-x-2"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Checkbox
                            checked={marketFilters.includes(market)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setMarketFilters([...marketFilters, market]);
                              } else {
                                setMarketFilters(
                                  marketFilters.filter((f) => f !== market),
                                );
                              }
                            }}
                          />
                          <span>{market}</span>
                        </DropdownMenuItem>
                      ),
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="border rounded-lg w-full">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    {visibleColumns.map((column) => (
                      <TableHead
                        key={column.id}
                        className={`hover:bg-muted/50 cursor-pointer text-center ${
                          column.id === "itemName"
                            ? "w-1/4 min-w-[280px]"
                            : column.id === "buyPrice"
                              ? "w-[120px]"
                              : column.id === "buyDate"
                                ? "w-[120px]"
                                : column.id === "market"
                                  ? "w-[140px]"
                                  : column.id === "status"
                                    ? "w-[160px]"
                                    : column.id === "sellInfo"
                                      ? "w-[180px]"
                                      : column.id === "profit"
                                        ? "w-[160px]"
                                        : column.id === "stickersCharm"
                                          ? "w-[140px]"
                                          : column.id === "marketLinks"
                                            ? "w-[120px]"
                                            : "w-auto"
                        }`}
                        onClick={() => {
                          if (
                            column.id !== "stickersCharm" &&
                            column.id !== "marketLinks" &&
                            column.id !== "itemImage"
                          ) {
                            handleSort(column.id as SortField);
                          }
                        }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {column.label}
                          {column.id !== "stickersCharm" &&
                            column.id !== "marketLinks" &&
                            column.id !== "itemImage" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center w-[80px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50 h-16">
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id} className="py-4">
                          {column.id === "itemName" && (
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex-shrink-0">
                                <img
                                  src={`https://community.cloudflare.steamstatic.com/economy/image/${item.assetId || "placeholder"}/96fx96f`}
                                  alt={item.itemName}
                                  className="w-12 h-12 object-contain rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23374151'/%3E%3Ctext x='24' y='24' text-anchor='middle' dominant-baseline='middle' fill='%23D1D5DB' font-size='8'%3EIMG%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0 pr-2">
                                {(() => {
                                  const {
                                    nameWithoutPrefixes,
                                    wearCondition,
                                    isStatTrak,
                                  } = extractItemNameParts(item.itemName);
                                  return (
                                    <div>
                                      <div className="flex items-center">
                                        {isStatTrak && (
                                          <span
                                            className="border-0 font-semibold mr-1.5"
                                            style={{
                                              fontSize: '10px',
                                              padding: '2px 6px',
                                              borderRadius: '6px',
                                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                              color: '#ff6a00',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              marginRight: '6px'
                                            }}
                                          >
                                            StatTrak™
                                          </span>
                                        )}
                          )}
                          {column.id === "market" && (
                            <div className="flex items-center justify-center">
                              <Badge
                                variant="outline"
                                className="whitespace-nowrap"
                              >
                                {item.market}
                              </Badge>
                            </div>
                          )}
                          {column.id === "status" && getStatusBadge(item)}
                          {column.id === "sellInfo" && getSellInfoDisplay(item)}
                          {column.id === "profit" && getProfitDisplay(item)}
                          {column.id === "stickersCharm" &&
                            getStickersAndCharmDisplay(item)}
                          {column.id === "marketLinks" && (
                            <div className="flex items-center justify-center gap-1">
                              {item.marketLinks.lisSkins && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center cursor-pointer hover:bg-blue-200">
                                        <span className="text-xs font-bold">
                                          L
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Lis-Skins</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.marketLinks.marketCSGO && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center cursor-pointer hover:bg-green-200">
                                        <span className="text-xs font-bold">
                                          M
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Market.CSGO</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.marketLinks.steamMarket && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200">
                                        <span className="text-xs font-bold">
                                          S
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Steam Market</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAndSortedItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <h3 className="text-lg font-semibold mb-2">
                  No inventory items found
                </h3>
                <p className="text-sm">No items match your current filters.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search sell history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Date Range{" "}
                        {dateRange.preset !== "all-time" &&
                          `(${dateRange.preset.replace("-", " ")})`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>
                        Filter by Date Range
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Preset buttons */}
                      <div className="p-2 space-y-1">
                        {[
                          "today",
                          "yesterday",
                          "last-7-days",
                          "last-30-days",
                          "this-month",
                          "last-month",
                          "all-time",
                        ].map((preset) => (
                          <Button
                            key={preset}
                            variant={
                              dateRange.preset === preset ? "default" : "ghost"
                            }
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => {
                              if (preset === "all-time") {
                                setDateRange({
                                  startDate: null,
                                  endDate: null,
                                  preset,
                                });
                              } else {
                                const range = getDatePresetRange(preset);
                                setDateRange({
                                  ...range,
                                  preset,
                                });
                              }
                            }}
                          >
                            {preset
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                          </Button>
                        ))}
                      </div>

                      <DropdownMenuSeparator />

                      {/* Custom date inputs */}
                      <div className="p-2 space-y-2">
                        <div>
                          <label className="text-xs font-medium">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={dateRange.startDate || ""}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                startDate: e.target.value || null,
                                preset: "custom",
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={dateRange.endDate || ""}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                endDate: e.target.value || null,
                                preset: "custom",
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Markets{" "}
                        {marketFilters.length > 0 &&
                          `(${marketFilters.length})`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by Market</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {markets.map((market) => (
                        <DropdownMenuItem
                          key={market}
                          className="flex items-center space-x-2"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Checkbox
                            checked={marketFilters.includes(market)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setMarketFilters([...marketFilters, market]);
                              } else {
                                setMarketFilters(
                                  marketFilters.filter((f) => f !== market),
                                );
                              }
                            }}
                          />
                          <span>{market}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={clearAllMarkets}
                        className="text-red-600"
                      >
                        <X className="h-3 w-3 mr-2" />
                        Clear All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="border rounded-lg w-full">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    {visibleColumns.map((column) => (
                      <TableHead
                        key={column.id}
                        className={`hover:bg-muted/50 cursor-pointer text-center ${
                          column.id === "itemName"
                            ? "w-1/4 min-w-[280px]"
                            : column.id === "buyPrice"
                              ? "w-[120px]"
                              : column.id === "buyDate"
                                ? "w-[120px]"
                                : column.id === "market"
                                  ? "w-[140px]"
                                  : column.id === "status"
                                    ? "w-[160px]"
                                    : column.id === "sellInfo"
                                      ? "w-[180px]"
                                      : column.id === "profit"
                                        ? "w-[160px]"
                                        : column.id === "stickersCharm"
                                          ? "w-[140px]"
                                          : column.id === "marketLinks"
                                            ? "w-[120px]"
                                            : "w-auto"
                        }`}
                        onClick={() => {
                          if (
                            column.id !== "stickersCharm" &&
                            column.id !== "marketLinks" &&
                            column.id !== "itemImage"
                          ) {
                            handleSort(column.id as SortField);
                          }
                        }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {column.label}
                          {column.id !== "stickersCharm" &&
                            column.id !== "marketLinks" &&
                            column.id !== "itemImage" && (
                              <ArrowUpDown className="h-3 w-3" />
                            )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center w-[80px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50 h-16">
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id} className="py-4">
                          {column.id === "itemName" && (
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex-shrink-0">
                                <img
                                  src={`https://community.cloudflare.steamstatic.com/economy/image/${item.assetId || "placeholder"}/96fx96f`}
                                  alt={item.itemName}
                                  className="w-12 h-12 object-contain rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23374151'/%3E%3Ctext x='24' y='24' text-anchor='middle' dominant-baseline='middle' fill='%23D1D5DB' font-size='8'%3EIMG%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0 pr-2">
                                {(() => {
                                  const {
                                    nameWithoutPrefixes,
                                    wearCondition,
                                    isStatTrak,
                                  } = extractItemNameParts(item.itemName);
                                  return (
                                    <div>
                                      <div className="flex items-center">
                                        {isStatTrak && (
                                          <span
                                            className="text-white border-0 font-semibold mr-1.5"
                                            style={{
                                              fontSize: "10px",
                                              padding: "2px 6px",
                                              borderRadius: "6px",
                                              background:
                                                "linear-gradient(135deg, #ff944d 0%, #ff6a00 100%)",
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              marginRight: "6px",
                                            }}
                                          >
                                            ST™
                                          </span>
                                        )}
                                        <span className="font-medium break-words">
                                          {nameWithoutPrefixes}
                                        </span>
                                      </div>
                                      {wearCondition && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          {wearCondition}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                          {column.id === "buyPrice" && (
                            <div className="flex items-center justify-center">
                              <span className="font-medium">
                                {formatCurrency(item.buyPrice)}
                              </span>
                            </div>
                          )}
                          {column.id === "buyDate" && (
                            <div className="flex items-center justify-center">
                              <span className="text-sm font-medium whitespace-nowrap">
                                {formatDate(item.buyDate)}
                              </span>
                            </div>
                          )}
                          {column.id === "market" && (
                            <div className="flex items-center justify-center">
                              <Badge
                                variant="outline"
                                className="whitespace-nowrap"
                              >
                                {item.market}
                              </Badge>
                            </div>
                          )}
                          {column.id === "status" && getStatusBadge(item)}
                          {column.id === "sellInfo" && getSellInfoDisplay(item)}
                          {column.id === "profit" && getProfitDisplay(item)}
                          {column.id === "stickersCharm" &&
                            getStickersAndCharmDisplay(item)}
                          {column.id === "marketLinks" && (
                            <div className="flex items-center justify-center gap-1">
                              {item.marketLinks.lisSkins && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center cursor-pointer hover:bg-blue-200">
                                        <span className="text-xs font-bold">
                                          L
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Lis-Skins</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.marketLinks.marketCSGO && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center cursor-pointer hover:bg-green-200">
                                        <span className="text-xs font-bold">
                                          M
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Market.CSGO</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.marketLinks.steamMarket && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200">
                                        <span className="text-xs font-bold">
                                          S
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Steam Market</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAndSortedItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No sell history found
                </h3>
                <p className="text-sm">
                  No sold items match your current filters.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default TradingTable;