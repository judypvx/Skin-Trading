import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import NavigationTabs from "@/components/trading/NavigationTabs";
import StatsPanel from "@/components/trading/StatsPanel";
import TradingTable from "@/components/trading/TradingTable";
import ImportDialog from "@/components/trading/ImportDialog";
import PortfolioChart from "@/components/trading/PortfolioChart";
import AccountSelector from "@/components/trading/AccountSelector";
import {
  TradingItem,
  mockTradingItems,
  calculateStats,
  TradingStats,
} from "@/lib/trading-data";
import {
  BarChart3,
  Settings,
  TrendingUp,
  FileText,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [items, setItems] = useState<TradingItem[]>(mockTradingItems);
  const [stats, setStats] = useState<TradingStats>(
    calculateStats(mockTradingItems),
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<string>("all-time");

  // Filter items by selected time period
  const getFilteredItemsByTimePeriod = (timePeriod: string) => {
    if (timePeriod === "all-time") return items;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;

    switch (timePeriod) {
      case "today":
        startDate = today;
        break;
      case "last-7-days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return items;
    }

    return items.filter((item) => {
      // For sold items, use sell date; for unsold items, use buy date
      const itemDate =
        item.status === "sold" && item.sellDate
          ? new Date(item.sellDate)
          : new Date(item.buyDate);
      return itemDate >= startDate;
    });
  };

  useEffect(() => {
    const filteredItems = getFilteredItemsByTimePeriod(selectedTimePeriod);
    const newStats = calculateStats(filteredItems);
    setStats(newStats);
  }, [items, selectedTimePeriod]);

  const handleUpdateItem = (id: string, updates: Partial<TradingItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const handleImportSuccess = () => {
    // In a real app, this would refresh the data from the API
    toast.success("Import successful - refreshing data...");
  };

  const handleExportTrades = () => {
    const csvContent = items
      .map(
        (item) =>
          `${item.itemName},${item.buyPrice},${item.buyDate},${item.market},${item.status},${item.sellPrice || ""},${item.sellDate || ""},${item.profit},${item.profitPercentage}`,
      )
      .join("\n");

    const blob = new Blob(
      [
        `Item Name,Buy Price,Buy Date,Market,Status,Sell Price,Sell Date,Profit,Profit %\n${csvContent}`,
      ],
      { type: "text/csv" },
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trading-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Trading data exported to CSV");
  };

  const getProfitStatus = () => {
    if (stats.totalProfit > 0) {
      return {
        status: "Profitable",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900",
      };
    } else if (stats.totalProfit === 0) {
      return {
        status: "Break Even",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100 dark:bg-yellow-900",
      };
    } else {
      return {
        status: "At Loss",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900",
      };
    }
  };

  const profitStatus = getProfitStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavigationTabs />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Welcome back, Trader!
                    </CardTitle>
                    <CardDescription>
                      Track and analyze your CS:GO skin investments across all
                      marketplaces
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  className={`${profitStatus.bgColor} ${profitStatus.color}`}
                >
                  Portfolio {profitStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected to Lis-Skins</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected to Market.CSGO</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Steam Market</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Period Selector */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Statistics for:
            </span>
            <div className="flex gap-1">
              {[
                { value: "today", label: "Today" },
                { value: "last-7-days", label: "Last 7 Days" },
                { value: "this-month", label: "This Month" },
                { value: "all-time", label: "All Time" },
              ].map((period) => (
                <Button
                  key={period.value}
                  variant={
                    selectedTimePeriod === period.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedTimePeriod(period.value)}
                  className="text-xs h-8"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <StatsPanel stats={stats} />

        {/* Account Selector */}
        <div className="mt-6">
          <AccountSelector />
        </div>

        {/* Portfolio Chart */}
        <div className="mt-6">
          <PortfolioChart items={items} timePeriod={selectedTimePeriod} />
        </div>

        <Separator className="my-6" />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <ImportDialog onImportSuccess={handleImportSuccess} />
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTrades}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        {/* Trading Table */}
        <TradingTable items={items} onUpdateItem={handleUpdateItem} />
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            Skin Trading Dashboard v1.0 • Tracking {items.length} items across{" "}
            {new Set(items.map((i) => i.market)).size} marketplaces •
            <Button variant="link" className="p-0 h-auto text-sm">
              Documentation
            </Button>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
