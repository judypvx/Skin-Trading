import { useState, useMemo, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  Settings,
  Star,
  Gem,
} from "lucide-react";
import {
  TradingItem,
  formatCurrency,
  formatPercentage,
  formatDate,
  mockSteamAccountsBasic,
  SteamAccountBasic,
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
import TableSettingsModal from "./TableSettingsModal";
import { toast } from "sonner";

interface TradingTableProps {
  items: TradingItem[];
  onUpdateItem: (id: string, updates: Partial<TradingItem>) => void;
}

type SortField = keyof TradingItem;
type SortDirection = "asc" | "desc";

const TradingTable = ({ items, onUpdateItem }: TradingTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [marketFilters, setMarketFilters] = useState<string[]>([]);
  const [accountFilter, setAccountFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("buyDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [settings, setSettings] =
    useState<TradingTableSettings>(loadSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesMarket =
        marketFilters.length === 0 || marketFilters.includes(item.market);

      const matchesAccount =
        accountFilter === "all" || item.accountId === accountFilter;

      return matchesSearch && matchesStatus && matchesMarket && matchesAccount;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null values for sellPrice and sellDate
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
    statusFilter,
    marketFilters,
    accountFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleMarkAsSold = (
    id: string,
    sellPrice: number,
    sellMarket: string,
  ) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const profit = sellPrice - item.buyPrice;
    const profitPercentage = (profit / item.buyPrice) * 100;

    onUpdateItem(id, {
      status: "sold",
      sellPrice,
      sellDate: new Date().toISOString().split("T")[0],
      sellMarket: sellMarket as "Lis-Skins" | "Market.CSGO" | "Steam Market",
      profit,
      profitPercentage,
      potentialProfit: 0,
    });
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const handleMarketFilterChange = (market: string, checked: boolean) => {
    if (checked) {
      setMarketFilters((prev) => [...prev, market]);
    } else {
      setMarketFilters((prev) => prev.filter((m) => m !== market));
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "sold" ? (
      <Badge
        variant="default"
        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      >
        Sold
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
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
        <div className={`flex items-center gap-1 ${colorClass}`}>
          <Icon className="h-3 w-3" />
          <span className="font-medium">{formatCurrency(item.profit)}</span>
          <span className="text-xs">
            ({formatPercentage(item.profitPercentage)})
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-blue-600 dark:text-blue-400">
          <span className="text-xs">Potential: </span>
          <span className="font-medium">
            {formatCurrency(item.potentialProfit)}
          </span>
        </div>
      );
    }
  };

  const getStickersAndCharmDisplay = (item: TradingItem) => {
    return (
      <div className="flex flex-col gap-1 w-[100px]">
        {item.charm && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className="text-xs bg-purple-600 text-white hover:bg-purple-700 border-0 rounded-full px-2 py-1 font-medium">
                  <Gem className="h-3 w-3 mr-1" />
                  Charm
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.charm.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {item.stickers.slice(0, 5).map((sticker, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger>
                <Badge className="text-xs bg-orange-500 text-white hover:bg-orange-600 border-0 rounded-full px-2 py-1 font-medium">
                  S{index + 1}
                </Badge>
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
        {item.stickers.length > 5 && (
          <Badge className="text-xs bg-gray-500 text-white border-0 rounded-full px-2 py-1 font-medium">
            +{item.stickers.length - 5}
          </Badge>
        )}
      </div>
    );
  };
  const getMarketLinksDisplay = (item: TradingItem) => {
    if (!settings.showMarketLinks) return null;

    return (
      <div className="flex gap-2">
        {settings.showMarketIcons ? (
          <>
            {item.marketLinks.lisSkins && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        window.open(item.marketLinks.lisSkins, "_blank")
                      }
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                        L
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on Lis-Skins</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {item.marketLinks.marketCSGO && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        window.open(item.marketLinks.marketCSGO, "_blank")
                      }
                    >
                      <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on Market.CSGO</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {item.marketLinks.steamMarket && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        window.open(item.marketLinks.steamMarket, "_blank")
                      }
                    >
                      <div className="w-4 h-4 bg-gray-700 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                        S
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on Steam Market</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-xs">
            {[
              item.marketLinks.lisSkins && "Lis-Skins",
              item.marketLinks.marketCSGO && "Market.CSGO",
              item.marketLinks.steamMarket && "Steam",
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        )}
      </div>
    );
  };

  const visibleColumns = settings.columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const markets = ["Lis-Skins", "Market.CSGO", "Steam Market"];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>Trading Items</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredAndSortedItems.length} of {items.length} items
              </span>
            </CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Table Settings
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items or asset IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockSteamAccountsBasic.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Markets{" "}
                    {marketFilters.length > 0 && `(${marketFilters.length})`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select Markets</DropdownMenuLabel>
                  {markets.map((market) => (
                    <DropdownMenuItem
                      key={market}
                      className="flex items-center gap-2"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Checkbox
                        checked={marketFilters.includes(market)}
                        onCheckedChange={(checked) =>
                          handleMarketFilterChange(market, checked as boolean)
                        }
                      />
                      {market}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setMarketFilters([])}>
                    Clear All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="unsold">In Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead
                      key={column.id}
                      className="cursor-pointer hover:bg-muted/50"
                      style={{ width: column.width }}
                      onClick={() => {
                        if (
                          column.id !== "stickersCharm" &&
                          column.id !== "marketLinks"
                        ) {
                          handleSort(column.id as SortField);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.id !== "stickersCharm" &&
                          column.id !== "marketLinks" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        style={{ width: column.width }}
                        className={
                          column.id === "stickersCharm" ? "align-top" : ""
                        }
                      >
                        {column.id === "itemName" && (
                          <div className="max-w-[250px]">
                            <div
                              className="truncate font-medium cursor-pointer hover:text-primary"
                              title={item.itemName}
                              onClick={() =>
                                copyToClipboard(item.itemName, "Item name")
                              }
                            >
                              {item.itemName}
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {column.id === "buyPrice" && (
                          <span className="font-medium">
                            {formatCurrency(item.buyPrice)}
                          </span>
                        )}
                        {column.id === "buyDate" && (
                          <span>{formatDate(item.buyDate)}</span>
                        )}
                        {column.id === "market" && (
                          <Badge variant="outline">{item.market}</Badge>
                        )}
                        {column.id === "assetId" && (
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {item.assetId}
                          </code>
                        )}
                        {column.id === "status" && getStatusBadge(item.status)}
                        {column.id === "sellInfo" && (
                          <div>
                            {item.status === "sold" ? (
                              <div>
                                <div className="font-medium">
                                  {formatCurrency(item.sellPrice!)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(item.sellDate!)}
                                </div>
                                {item.sellMarket && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1"
                                  >
                                    {item.sellMarket}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        )}
                        {column.id === "profit" && getProfitDisplay(item)}
                        {column.id === "stickersCharm" &&
                          getStickersAndCharmDisplay(item)}
                        {column.id === "marketLinks" &&
                          getMarketLinksDisplay(item)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              copyToClipboard(item.assetId, "Asset ID")
                            }
                            className="gap-2"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Asset ID
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              copyToClipboard(item.itemName, "Item name")
                            }
                            className="gap-2"
                          >
                            <Copy className="h-3 w-3" />
                            Copy Item Name
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status === "unsold" && (
                            <DropdownMenuItem
                              onClick={() => {
                                const sellPrice = prompt(
                                  "Enter sell price (USD):",
                                );
                                const sellMarket = prompt(
                                  "Enter sell market (Lis-Skins, Market.CSGO, Steam Market):",
                                );
                                if (
                                  sellPrice &&
                                  !isNaN(Number(sellPrice)) &&
                                  sellMarket
                                ) {
                                  handleMarkAsSold(
                                    item.id,
                                    Number(sellPrice),
                                    sellMarket,
                                  );
                                }
                              }}
                            >
                              Mark as Sold
                            </DropdownMenuItem>
                          )}
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
              No items found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      <TableSettingsModal
        settings={settings}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={setSettings}
      />
    </>
  );
};

export default TradingTable;
