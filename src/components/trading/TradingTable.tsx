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
import { toast } from "sonner";

interface TradingTableProps {
  items: TradingItem[];
  onUpdateItem: (id: string, updates: Partial<TradingItem>) => void;
}

type SortField = keyof TradingItem;
type SortDirection = "asc" | "desc";

const TradingTable = ({ items, onUpdateItem }: TradingTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [marketFilters, setMarketFilters] = useState<string[]>([]);
  const [accountFilters, setAccountFilters] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("buyDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [settings, setSettings] = useState<TradingTableSettings>(() => {
    const loadedSettings = loadSettings();
    // Ensure Asset ID and Image columns are completely removed
    loadedSettings.columns = loadedSettings.columns.filter(
      (col) => col.id !== "assetId" && col.id !== "itemImage",
    );
    return loadedSettings;
  });
  const [activeTab, setActiveTab] = useState<"inventory" | "history">(
    "inventory",
  );
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
    preset: string;
  }>({
    startDate: null,
    endDate: null,
    preset: "all-time",
  });

  // Force clear Asset ID and Image columns from localStorage on mount
  useEffect(() => {
    const currentSettings = loadSettings();
    const filteredColumns = currentSettings.columns.filter(
      (col) => col.id !== "assetId" && col.id !== "itemImage",
    );
    if (filteredColumns.length !== currentSettings.columns.length) {
      const newSettings = { ...currentSettings, columns: filteredColumns };
      saveSettings(newSettings);
      setSettings(newSettings);
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Date preset calculations
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
    const allAccountIds = mockSteamAccountsBasic
      .filter((account) => account.id !== "all")
      .map((account) => account.id);
    setAccountFilters(allAccountIds);
  };

  const getStatusBadge = (item: TradingItem) => {
    const getDaysLeft = (dateString: string) => {
      const targetDate = new Date(dateString);
      const now = new Date();
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    };

    switch (item.status) {
      case "sold":
        return (
          <div className="flex justify-center">
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap"
            >
              Sold
            </Badge>
          </div>
        );

      case "waiting_unlock":
        return (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap flex items-center gap-1"
                  >
                    🕒 Waiting for Unlock
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This item was purchased on an external bot and is pending
                    delivery to your Steam inventory
                  </p>
                  {item.unlock_at && (
                    <p className="text-xs text-muted-foreground">
                      Expected delivery:{" "}
                      {new Date(item.unlock_at).toLocaleDateString()}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );

      case "trade_ban":
        const daysLeft = item.trade_ban_until
          ? getDaysLeft(item.trade_ban_until)
          : 0;
        return (
          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant="destructive"
                    className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 whitespace-nowrap flex items-center gap-1"
                  >
                    🔒 Trade Ban - {daysLeft}d Left
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This item is in your Steam inventory but still under trade
                    cooldown
                  </p>
                  {item.trade_ban_until && (
                    <p className="text-xs text-muted-foreground">
                      Will be tradable on:{" "}
                      {new Date(item.trade_ban_until).toLocaleDateString()}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );

      default:
        return (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap"
            >
              Unlocked
            </Badge>
          </div>
        );
    }
  };

  const getSellInfoDisplay = (item: TradingItem) => {
    if (item.status === "sold") {
      return (
        <div className="flex items-center justify-center">
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {item.sellMarket}
              </Badge>
            </div>
            <div className="font-medium">{formatCurrency(item.sellPrice!)}</div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(item.sellDate!)}
            </div>
          </div>
        </div>
      );
    } else {
      if (item.targetSellMarket && item.currentMarketPrice) {
        return (
          <div className="flex items-center justify-center">
            <div className="text-center space-y-1">
              <div className="flex justify-center">
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {item.targetSellMarket}
                </Badge>
              </div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(item.currentMarketPrice)}
              </div>
              <div className="text-xs text-muted-foreground">
                Current lowest
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground">—</span>
          </div>
        );
      }
    }
  };

  const getProfitDisplay = (item: TradingItem) => {
    if (item.status === "sold") {
      const isPositive = item.profit >= 0;
      const Icon = isPositive ? TrendingUp : TrendingDown;
      const colorClass = isPositive
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";

      return (
        <div className="flex items-center justify-center">
          <div className={`text-center ${colorClass}`}>
            <div className="font-medium text-lg">
              {formatCurrency(item.profit)}
            </div>
            <div className="flex items-center justify-center gap-1 whitespace-nowrap mt-1">
              <Icon className="h-3 w-3" />
              <span className="text-xs">Profit</span>
            </div>
            <div className="text-xs opacity-80 mt-0.5">
              ({formatPercentage(item.profitPercentage)})
            </div>
          </div>
        </div>
      );
    } else {
      // Calculate potential profit percentage
      const potentialProfitPercentage =
        item.buyPrice > 0 ? (item.potentialProfit / item.buyPrice) * 100 : 0;

      const isPositive = item.potentialProfit >= 0;
      const Icon = isPositive ? TrendingUp : TrendingDown;
      const colorClass = isPositive
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";

      return (
        <div className="flex items-center justify-center">
          <div className={`text-center ${colorClass}`}>
            <div className="font-medium text-lg">
              {formatCurrency(item.potentialProfit)}
            </div>
            <div className="flex items-center justify-center gap-1 whitespace-nowrap mt-1">
              <Icon className="h-3 w-3" />
              <span className="text-xs">Potential</span>
            </div>
            <div className="text-xs opacity-80 mt-0.5">
              ({formatPercentage(potentialProfitPercentage)})
            </div>
          </div>
        </div>
      );
    }
  };

  const getPotentialProfitDisplay = (item: TradingItem) => {
    if (item.status === "sold") {
      return getProfitDisplay(item);
    }

    const potentialProfitPercentage =
      item.buyPrice > 0 ? (item.potentialProfit / item.buyPrice) * 100 : 0;

    const isPositive = item.potentialProfit >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

    return (
      <div className="flex items-center justify-center">
        <div className={`text-center ${colorClass}`}>
          <div className="flex items-center justify-center gap-1 whitespace-nowrap">
            <Icon className="h-3 w-3" />
            <span className="text-xs">Potential:</span>
            <span className="font-medium">
              {formatCurrency(item.potentialProfit)}
            </span>
          </div>
          <div className="text-xs opacity-80 mt-0.5">
            ({formatPercentage(potentialProfitPercentage)})
          </div>
        </div>
      </div>
    );
  };

  const getStickersAndCharmDisplay = (item: TradingItem) => {
    return (
      <div className="flex items-center justify-center gap-1 overflow-hidden">
        {item.charm && (
          <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded flex items-center justify-center">
            <span className="text-xs">💎</span>
          </div>
        )}
        {item.stickers.slice(0, 4).map((sticker, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 bg-orange-100 border border-orange-300 rounded flex items-center justify-center">
                  <span className="text-xs">⭐</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sticker.name}</p>
                {sticker.wear !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    Wear: {sticker.wear}%
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
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
      const matchesSearch = item.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Tab-based filtering
      const matchesTab =
        activeTab === "inventory"
          ? item.status === "unsold" ||
            item.status === "waiting_unlock" ||
            item.status === "trade_ban"
          : item.status === "sold";

      // Multi-select market filtering - if no markets selected, show all
      const matchesMarket =
        marketFilters.length === 0 || marketFilters.includes(item.market);

      // Multi-select account filtering - if no accounts selected, show all
      const matchesAccount =
        accountFilters.length === 0 || accountFilters.includes(item.accountId);

      // Date range filtering (only for sell history tab)
      let matchesDateRange = true;
      if (activeTab === "history" && item.status === "sold" && item.sellDate) {
        if (dateRange.startDate || dateRange.endDate) {
          const sellDate = new Date(item.sellDate);
          const startDate = dateRange.startDate
            ? new Date(dateRange.startDate)
            : null;
          const endDate = dateRange.endDate
            ? new Date(dateRange.endDate)
            : null;

          // Set time to start/end of day for proper comparison
          if (startDate) {
            startDate.setHours(0, 0, 0, 0);
          }
          if (endDate) {
            endDate.setHours(23, 59, 59, 999);
          }

          matchesDateRange =
            (!startDate || sellDate >= startDate) &&
            (!endDate || sellDate <= endDate);
        }
      }

      return (
        matchesSearch &&
        matchesTab &&
        matchesMarket &&
        matchesAccount &&
        matchesDateRange
      );
    });

    // Sort the filtered items
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (sortField === "buyDate" || sortField === "sellDate") {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }

      // Handle numeric fields
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle string fields
      const aStr = String(aValue || "").toLowerCase();
      const bStr = String(bValue || "").toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [
    items,
    searchTerm,
    activeTab,
    marketFilters,
    accountFilters,
    dateRange,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Calculate tab counts
  const inventoryCount = items.filter(
    (item) =>
      item.status === "unsold" ||
      item.status === "waiting_unlock" ||
      item.status === "trade_ban",
  ).length;
  const historyCount = items.filter((item) => item.status === "sold").length;

  const visibleColumns = settings.columns
    .filter((col) => col.visible)
    .filter((col) => col.id !== "itemImage" && col.id !== "assetId") // Hard filter
    .sort((a, b) => a.order - b.order);

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
                                <div className="font-medium break-words">
                                  {item.itemName}
                                </div>
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
                      <Button variant="outline" className="gap-2">
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
                      <Button variant="outline" className="gap-2">
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
                        className="hover:bg-muted/50 cursor-pointer text-center"
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
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50 h-16">
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id} className="py-4">
                          {column.id === "itemName" && (
                            <div className="flex items-center gap-2 max-w-[300px]">
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
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-medium">
                                  {item.itemName}
                                </div>
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
