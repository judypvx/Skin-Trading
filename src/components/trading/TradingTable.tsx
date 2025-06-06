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
  Copy,
  Star,
  Gem,
  GripVertical,
  Package,
  History,
  X,
  Users,
  Check,
  Calendar,
  CalendarDays,
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
  const [settings, setSettings] =
    useState<TradingTableSettings>(loadSettings());
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
        const week = new Date(today);
        week.setDate(week.getDate() - 7);
        return {
          startDate: week.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "last-30-days":
        const month = new Date(today);
        month.setDate(month.getDate() - 30);
        return {
          startDate: month.toISOString().split("T")[0],
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
      case "all-time":
      default:
        return {
          startDate: null,
          endDate: null,
        };
    }
  };

  const handleDatePresetChange = (preset: string) => {
    const range = getDatePresetRange(preset);
    setDateRange({
      startDate: range.startDate,
      endDate: range.endDate,
      preset,
    });
  };

  const handleCustomDateChange = (
    field: "startDate" | "endDate",
    value: string,
  ) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value || null,
      preset: "custom",
    }));
  };

  const clearDateFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      preset: "all-time",
    });
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetId.toLowerCase().includes(searchTerm.toLowerCase());

      // Tab-based filtering
      const matchesTab =
        activeTab === "inventory"
          ? item.status === "unsold"
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

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null values
      if (aValue === null || aValue === undefined)
        aValue = sortDirection === "asc" ? -Infinity : Infinity;
      if (bValue === null || bValue === undefined)
        bValue = sortDirection === "asc" ? -Infinity : Infinity;

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
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
      setSortDirection("asc");
    }
  };

  const handleMarketFilterChange = (market: string, checked: boolean) => {
    if (checked) {
      setMarketFilters((prev) => [...prev, market]);
    } else {
      setMarketFilters((prev) => prev.filter((m) => m !== market));
    }
  };

  const handleAccountFilterChange = (accountId: string, checked: boolean) => {
    if (checked) {
      setAccountFilters((prev) => [...prev, accountId]);
    } else {
      setAccountFilters((prev) => prev.filter((id) => id !== accountId));
    }
  };

  const clearAllMarkets = () => {
    setMarketFilters([]);
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

  const getStatusBadge = (status: string) => {
    return status === "sold" ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap"
      >
        Sold
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 whitespace-nowrap"
      >
        In Inventory
      </Badge>
    );
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
          <div
            className={`flex items-center gap-1 ${colorClass} whitespace-nowrap`}
          >
            <Icon className="h-3 w-3" />
            <span className="font-medium">{formatCurrency(item.profit)}</span>
            <span className="text-xs opacity-80">
              ({formatPercentage(item.profitPercentage)})
            </span>
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
            <div className="flex items-center justify-center gap-1 whitespace-nowrap">
              <Icon className="h-3 w-3" />
              <span className="text-xs">Potential:</span>
              <span className="font-medium">
                {formatCurrency(item.potentialProfit)}
              </span>
            </div>
            <div className="text-xs opacity-80 mt-1">
              ({isPositive ? "+" : ""}
              {potentialProfitPercentage.toFixed(2)}%)
            </div>
          </div>
        </div>
      );
    }
  };

  const getStickersAndCharmDisplay = (item: TradingItem) => {
    const maxStickers = 3;
    const visibleStickers = item.stickers.slice(0, maxStickers);
    const remainingCount = item.stickers.length - maxStickers;

    return (
      <div className="flex items-center justify-center gap-1 overflow-hidden">
        {item.charm && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded flex items-center justify-center">
                  <span className="text-xs">💎</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.charm.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {visibleStickers.map((sticker, index) => (
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
        {remainingCount > 0 && (
          <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
            <span className="text-xs">+{remainingCount}</span>
          </div>
        )}
      </div>
    );
  };

  // Calculate tab counts
  const inventoryCount = items.filter(
    (item) => item.status === "unsold",
  ).length;
  const historyCount = items.filter((item) => item.status === "sold").length;

  const visibleColumns = settings.columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const markets = ["Lis-Skins", "Market.CSGO", "Steam Market"];
  const nonAllAccounts = mockSteamAccountsBasic.filter(
    (account) => account.id !== "all",
  );

  return (
    <Card>
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

              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Users className="h-4 w-4" />
                      Accounts{" "}
                      {accountFilters.length > 0 &&
                        `(${accountFilters.length})`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Accounts</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={selectAllAccounts}
                      className="text-blue-600"
                    >
                      <Check className="h-3 w-3 mr-2" />
                      Select All
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {nonAllAccounts.map((account) => (
                      <DropdownMenuItem
                        key={account.id}
                        className="flex items-center gap-2 cursor-pointer"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Checkbox
                          checked={accountFilters.includes(account.id)}
                          onCheckedChange={(checked) =>
                            handleAccountFilterChange(
                              account.id,
                              checked as boolean,
                            )
                          }
                        />
                        <span className="flex-1">{account.nickname}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={clearAllAccounts}
                      className="text-red-600"
                    >
                      <X className="h-3 w-3 mr-2" />
                      Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Markets{" "}
                      {marketFilters.length > 0 && `(${marketFilters.length})`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Markets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {markets.map((market) => (
                      <DropdownMenuItem
                        key={market}
                        className="flex items-center gap-2 cursor-pointer"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Checkbox
                          checked={marketFilters.includes(market)}
                          onCheckedChange={(checked) =>
                            handleMarketFilterChange(market, checked as boolean)
                          }
                        />
                        <span className="flex-1">{market}</span>
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

            <div className="overflow-x-auto border rounded-lg">
              <Table>
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
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id}>
                          {column.id === "itemImage" && (
                            <div className="flex items-center justify-center">
                              <div className="w-20 h-15 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  IMG
                                </span>
                              </div>
                            </div>
                          )}
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
                            <span className="font-medium">
                              {formatCurrency(item.buyPrice)}
                            </span>
                          )}
                          {column.id === "buyDate" && (
                            <div className="flex items-center justify-center">
                              <span className="text-sm font-medium whitespace-nowrap">
                                {formatDate(item.buyDate)}
                              </span>
                            </div>
                          )}
                          {column.id === "market" && (
                            <Badge
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {item.market}
                            </Badge>
                          )}
                          {column.id === "assetId" && (
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {item.assetId}
                            </code>
                          )}
                          {column.id === "status" &&
                            getStatusBadge(item.status)}
                          {column.id === "sellInfo" && (
                            <div className="flex items-center justify-center">
                              {item.status === "sold" ? (
                                <div className="text-center">
                                  <div className="font-medium">
                                    {formatCurrency(item.sellPrice!)}
                                  </div>
                                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(item.sellDate!)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center">
                                  {item.targetSellMarket &&
                                  item.currentMarketPrice ? (
                                    <div className="space-y-1">
                                      <div className="flex justify-center">
                                        <Badge
                                          variant="outline"
                                          className="text-xs whitespace-nowrap"
                                        >
                                          {item.targetSellMarket}
                                        </Badge>
                                      </div>
                                      <div className="font-medium text-blue-600 dark:text-blue-400">
                                        {formatCurrency(
                                          item.currentMarketPrice,
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Current lowest
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Copy className="h-3 w-3 mr-2" />
                              Copy Asset ID
                            </DropdownMenuItem>
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
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
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

                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Users className="h-4 w-4" />
                        Accounts{" "}
                        {accountFilters.length > 0 &&
                          `(${accountFilters.length})`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Select Accounts</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={selectAllAccounts}
                        className="text-blue-600"
                      >
                        <Check className="h-3 w-3 mr-2" />
                        Select All
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {nonAllAccounts.map((account) => (
                        <DropdownMenuItem
                          key={account.id}
                          className="flex items-center gap-2 cursor-pointer"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Checkbox
                            checked={accountFilters.includes(account.id)}
                            onCheckedChange={(checked) =>
                              handleAccountFilterChange(
                                account.id,
                                checked as boolean,
                              )
                            }
                          />
                          <span className="flex-1">{account.nickname}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={clearAllAccounts}
                        className="text-red-600"
                      >
                        <X className="h-3 w-3 mr-2" />
                        Clear All
                      </DropdownMenuItem>
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
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Select Markets</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {markets.map((market) => (
                        <DropdownMenuItem
                          key={market}
                          className="flex items-center gap-2 cursor-pointer"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Checkbox
                            checked={marketFilters.includes(market)}
                            onCheckedChange={(checked) =>
                              handleMarketFilterChange(
                                market,
                                checked as boolean,
                              )
                            }
                          />
                          <span className="flex-1">{market}</span>
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Date Range{" "}
                        {dateRange.preset !== "all-time" &&
                          `(${dateRange.preset.replace("-", " ")})`}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-4">
                      <DropdownMenuLabel>Select Date Range</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Preset Options */}
                      <div className="space-y-2 mb-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          Quick Select:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: "today", label: "Today" },
                            { value: "yesterday", label: "Yesterday" },
                            { value: "last-7-days", label: "Last 7 Days" },
                            { value: "last-30-days", label: "Last 30 Days" },
                            { value: "this-month", label: "This Month" },
                            { value: "last-month", label: "Last Month" },
                            { value: "all-time", label: "All Time" },
                          ].map((preset) => (
                            <Button
                              key={preset.value}
                              variant={
                                dateRange.preset === preset.value
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleDatePresetChange(preset.value)
                              }
                              className="justify-start text-xs h-8"
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <DropdownMenuSeparator />

                      {/* Custom Date Inputs */}
                      <div className="space-y-3 mt-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          Custom Range:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              From
                            </label>
                            <Input
                              type="date"
                              value={dateRange.startDate || ""}
                              onChange={(e) =>
                                handleCustomDateChange(
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              className="text-xs h-8"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              To
                            </label>
                            <Input
                              type="date"
                              value={dateRange.endDate || ""}
                              onChange={(e) =>
                                handleCustomDateChange(
                                  "endDate",
                                  e.target.value,
                                )
                              }
                              className="text-xs h-8"
                            />
                          </div>
                        </div>

                        {dateRange.preset !== "all-time" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearDateFilter}
                            className="w-full text-xs h-8 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Clear Date Filter
                          </Button>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <Table>
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
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      {visibleColumns.map((column) => (
                        <TableCell key={column.id}>
                          {column.id === "itemImage" && (
                            <div className="flex items-center justify-center">
                              <div className="w-20 h-15 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  IMG
                                </span>
                              </div>
                            </div>
                          )}
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
                            <span className="font-medium">
                              {formatCurrency(item.buyPrice)}
                            </span>
                          )}
                          {column.id === "buyDate" && (
                            <div className="flex items-center justify-center">
                              <span className="text-sm font-medium whitespace-nowrap">
                                {formatDate(item.buyDate)}
                              </span>
                            </div>
                          )}
                          {column.id === "market" && (
                            <Badge
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              {item.market}
                            </Badge>
                          )}
                          {column.id === "assetId" && (
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {item.assetId}
                            </code>
                          )}
                          {column.id === "status" &&
                            getStatusBadge(item.status)}
                          {column.id === "sellInfo" && (
                            <div className="flex items-center justify-center">
                              {item.status === "sold" ? (
                                <div className="text-center">
                                  <div className="font-medium">
                                    {formatCurrency(item.sellPrice!)}
                                  </div>
                                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDate(item.sellDate!)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          )}
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Copy className="h-3 w-3 mr-2" />
                              Copy Asset ID
                            </DropdownMenuItem>
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
