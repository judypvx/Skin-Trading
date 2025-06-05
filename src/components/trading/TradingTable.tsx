import { useState, useMemo } from "react";
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
import {
  ArrowUpDown,
  Search,
  Filter,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  TradingItem,
  formatCurrency,
  formatPercentage,
  formatDate,
} from "@/lib/trading-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TradingTableProps {
  items: TradingItem[];
  onUpdateItem: (id: string, updates: Partial<TradingItem>) => void;
}

type SortField = keyof TradingItem;
type SortDirection = "asc" | "desc";

const TradingTable = ({ items, onUpdateItem }: TradingTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("buyDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesMarket =
        marketFilter === "all" || item.market === marketFilter;

      return matchesSearch && matchesStatus && matchesMarket;
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
  }, [items, searchTerm, statusFilter, marketFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleMarkAsSold = (id: string, sellPrice: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const profit = sellPrice - item.buyPrice;
    const profitPercentage = (profit / item.buyPrice) * 100;

    onUpdateItem(id, {
      status: "sold",
      sellPrice,
      sellDate: new Date().toISOString().split("T")[0],
      profit,
      profitPercentage,
      potentialProfit: 0,
    });
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

  const markets = Array.from(new Set(items.map((item) => item.market)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trading Items</span>
          <span className="text-sm font-normal text-muted-foreground">
            {filteredAndSortedItems.length} of {items.length} items
          </span>
        </CardTitle>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search items or asset IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="unsold">In Inventory</SelectItem>
              </SelectContent>
            </Select>

            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
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
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("itemName")}
                >
                  <div className="flex items-center gap-1">
                    Item Name
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("buyPrice")}
                >
                  <div className="flex items-center gap-1">
                    Buy Price
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("buyDate")}
                >
                  <div className="flex items-center gap-1">
                    Buy Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("market")}
                >
                  <div className="flex items-center gap-1">
                    Market
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Asset ID</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Sell Info</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("profit")}
                >
                  <div className="flex items-center gap-1">
                    Profit
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate" title={item.itemName}>
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
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.buyPrice)}
                  </TableCell>
                  <TableCell>{formatDate(item.buyDate)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.market}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {item.assetId}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {item.status === "sold" ? (
                      <div>
                        <div className="font-medium">
                          {formatCurrency(item.sellPrice!)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(item.sellDate!)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getProfitDisplay(item)}</TableCell>
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
                            navigator.clipboard.writeText(item.assetId)
                          }
                        >
                          Copy Asset ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.status === "unsold" && (
                          <DropdownMenuItem
                            onClick={() => {
                              const sellPrice = prompt(
                                "Enter sell price (USD):",
                              );
                              if (sellPrice && !isNaN(Number(sellPrice))) {
                                handleMarkAsSold(item.id, Number(sellPrice));
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
  );
};

export default TradingTable;
