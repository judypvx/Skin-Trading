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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Calendar as CalendarIcon,
  Check,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [marketFilters, setMarketFilters] = useState<string[]>([]);
  const [accountFilters, setAccountFilters] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("buyDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [settings, setSettings] =
    useState<TradingTableSettings>(loadSettings());
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inventory" | "history">(
    "inventory",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Helper function to check if a date is within range
  const isDateInRange = (
    dateString: string | null,
    from?: string,
    to?: string,
  ): boolean => {
    if (!dateString || (!from && !to)) return true;

    const date = new Date(dateString);
    if (from && date < new Date(from)) return false;
    if (to && date > new Date(to)) return false;
    return true;
  };

  // Quick date preset functions
  const applyDatePreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case "last7days":
        const last7 = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        setDateFrom(last7.toISOString().split("T")[0]);
        setDateTo(today.toISOString().split("T")[0]);
        break;
      case "last30days":
        const last30 = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
        setDateFrom(last30.toISOString().split("T")[0]);
        setDateTo(today.toISOString().split("T")[0]);
        break;
      case "thisMonth":
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setDateFrom(thisMonthStart.toISOString().split("T")[0]);
        setDateTo(today.toISOString().split("T")[0]);
        break;
      case "lastMonth":
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        setDateFrom(lastMonthStart.toISOString().split("T")[0]);
        setDateTo(lastMonthEnd.toISOString().split("T")[0]);
        break;
      default:
        break;
    }
    setIsDatePickerOpen(false);
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

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // Multi-select market filtering - if no markets selected, show all
      const matchesMarket =
        marketFilters.length === 0 || marketFilters.includes(item.market);

      // Multi-select account filtering - if no accounts selected, show all
      const matchesAccount =
        accountFilters.length === 0 || accountFilters.includes(item.accountId);

      // Date range filtering for sell history
      let matchesDateRange = true;
      if (activeTab === "history" && (dateFrom || dateTo)) {
        matchesDateRange = isDateInRange(item.sellDate, dateFrom, dateTo);
      }

      return (
        matchesSearch &&
        matchesTab &&
        matchesStatus &&
        matchesMarket &&
        matchesAccount &&
        matchesDateRange
      );
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
    accountFilters,
    sortField,
    sortDirection,
    activeTab,
    dateFrom,
    dateTo,
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

  const clearDateRange = () => {
    setDateFrom("");
    setDateTo("");
  };

  // Column drag and drop handlers
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();

    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const visibleColumns = settings.columns
      .filter((col) => col.visible)
      .sort((a, b) => a.order - b.order);

    const draggedIndex = visibleColumns.findIndex(
      (col) => col.id === draggedColumn,
    );
    const targetIndex = visibleColumns.findIndex(
      (col) => col.id === targetColumnId,
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder columns
    const newColumns = [...visibleColumns];
    const [draggedCol] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedCol);

    // Update order values
    const updatedColumns = settings.columns.map((col) => {
      const newIndex = newColumns.findIndex((newCol) => newCol.id === col.id);
      if (newIndex !== -1) {
        return { ...col, order: newIndex + 1 };
      }
      return col;
    });

    setSettings((prev) => ({
      ...prev,
      columns: updatedColumns,
    }));

    setDraggedColumn(null);
    toast.success("Column order updated");
  };

  // Column resize handlers
  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering sort

    setResizingColumn(columnId);
    resizeStartX.current = e.clientX;

    const column = settings.columns.find((col) => col.id === columnId);
    resizeStartWidth.current = column?.width || 120;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumn) return;

      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(80, resizeStartWidth.current + diff);

      setSettings((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === columnId ? { ...col, width: newWidth } : col,
        ),
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
        <div
          className={`flex items-center gap-1 ${colorClass} whitespace-nowrap`}
        >
          <Icon className="h-3 w-3" />
          <span className="font-medium">{formatCurrency(item.profit)}</span>
          <span className="text-xs">
            ({formatPercentage(item.profitPercentage)})
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-blue-600 dark:text-blue-400 whitespace-nowrap">
          <span className="text-xs">Potential: </span>
          <span className="font-medium">
            {formatCurrency(item.potentialProfit)}
          </span>
        </div>
      );
    }
  };

  const getStickersAndCharmDisplay = (item: TradingItem) => {
    const maxStickers = 4;
    const visibleStickers = item.stickers.slice(0, maxStickers);
    const remainingCount = item.stickers.length - maxStickers;

    return (
      <div className="flex items-center gap-1 overflow-hidden">
        {item.charm && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className="text-xs bg-purple-600 text-white hover:bg-purple-700 border-0 rounded-full px-2 py-1 font-medium whitespace-nowrap">
                  <Gem className="h-3 w-3 mr-1" />
                  💎
                </Badge>
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
                <Badge className="text-xs bg-orange-500 text-white hover:bg-orange-600 border-0 rounded-full px-2 py-1 font-medium whitespace-nowrap">
                  ⭐ S{index + 1}
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
        {remainingCount > 0 && (
          <Badge className="text-xs bg-gray-500 text-white border-0 rounded-full px-2 py-1 font-medium whitespace-nowrap">
            +{remainingCount}
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

  const formatDateRange = () => {
    if (!dateFrom && !dateTo) return "All Time";

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    if (dateFrom && dateTo) {
      return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
    } else if (dateFrom) {
      return `From ${formatDate(dateFrom)}`;
    } else if (dateTo) {
      return `Until ${formatDate(dateTo)}`;
    }

    return "All Time";
  };

  const renderTable = () => (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead
                key={column.id}
                className="hover:bg-muted/50 relative group select-none"
                style={{ width: column.width }}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, column.id)}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => handleColumnDrop(e, column.id)}
              >
                <div className="flex items-center gap-1 justify-between">
                  <div
                    className="flex items-center gap-1 cursor-pointer flex-1"
                    onClick={() => {
                      if (
                        column.id !== "stickersCharm" &&
                        column.id !== "marketLinks"
                      ) {
                        handleSort(column.id as SortField);
                      }
                    }}
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    {column.label}
                    {column.id !== "stickersCharm" &&
                      column.id !== "marketLinks" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                  </div>

                  {/* Resize handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/30 opacity-0 group-hover:opacity-100 transition-all duration-200 border-r-2 border-transparent hover:border-primary/50"
                    onMouseDown={(e) => handleResizeStart(e, column.id)}
                    onClick={(e) => e.stopPropagation()}
                    title="Drag to resize column"
                  />
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
                  className={column.id === "stickersCharm" ? "align-top" : ""}
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
                              className="text-xs whitespace-nowrap"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              +{item.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {column.id === "buyPrice" && (
                    <span className="font-medium whitespace-nowrap">
                      {formatCurrency(item.buyPrice)}
                    </span>
                  )}
                  {column.id === "buyDate" && (
                    <span className="whitespace-nowrap">
                      {formatDate(item.buyDate)}
                    </span>
                  )}
                  {column.id === "market" && (
                    <Badge variant="outline" className="whitespace-nowrap">
                      {item.market}
                    </Badge>
                  )}
                  {column.id === "assetId" && (
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono whitespace-nowrap">
                      {item.assetId}
                    </code>
                  )}
                  {column.id === "status" && getStatusBadge(item.status)}
                  {column.id === "sellInfo" && (
                    <div className="whitespace-nowrap">
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
                              className="text-xs mt-1 whitespace-nowrap"
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
                  {column.id === "marketLinks" && getMarketLinksDisplay(item)}
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
                      onClick={() => copyToClipboard(item.assetId, "Asset ID")}
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
                          const sellPrice = prompt("Enter sell price (USD):");
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
  );

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
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <X className="h-3 w-3 mr-2" />
                      Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No inventory items found
                </h3>
                <p className="text-sm">
                  {inventoryCount === 0
                    ? "You don't have any items in your inventory yet."
                    : "No items match your current filters."}
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  {marketFilters.length > 0 && (
                    <Button variant="link" onClick={clearAllMarkets}>
                      Clear market filters
                    </Button>
                  )}
                  {accountFilters.length > 0 && (
                    <Button variant="link" onClick={clearAllAccounts}>
                      Clear account filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              renderTable()
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
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
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <X className="h-3 w-3 mr-2" />
                      Clear All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-4 border-b">
                      <h4 className="font-medium text-sm mb-3">
                        Filter by sell date
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyDatePreset("last7days")}
                          className="text-xs"
                        >
                          Last 7 days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyDatePreset("last30days")}
                          className="text-xs"
                        >
                          Last 30 days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyDatePreset("thisMonth")}
                          className="text-xs"
                        >
                          This Month
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyDatePreset("lastMonth")}
                          className="text-xs"
                        >
                          Last Month
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium">
                            From Date
                          </label>
                          <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">To Date</label>
                          <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearDateRange}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="flex-1"
                      >
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No sell history found
                </h3>
                <p className="text-sm">
                  {historyCount === 0
                    ? "You haven't sold any items yet."
                    : "No sold items match your current filters."}
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  {marketFilters.length > 0 && (
                    <Button variant="link" onClick={clearAllMarkets}>
                      Clear market filters
                    </Button>
                  )}
                  {accountFilters.length > 0 && (
                    <Button variant="link" onClick={clearAllAccounts}>
                      Clear account filters
                    </Button>
                  )}
                  {(dateFrom || dateTo) && (
                    <Button variant="link" onClick={clearDateRange}>
                      Clear date range
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              renderTable()
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default TradingTable;
