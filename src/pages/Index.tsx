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

  useEffect(() => {
    const newStats = calculateStats(items);
    setStats(newStats);
  }, [items]);

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
          `${item.itemName},${item.buyPrice},${item.buyDate},${item.market},${item.assetId},${item.status},${item.sellPrice || ""},${item.sellDate || ""},${item.profit},${item.profitPercentage}`,
      )
      .join("\n");

    const blob = new Blob(
      [
        `Item Name,Buy Price,Buy Date,Market,Asset ID,Status,Sell Price,Sell Date,Profit,Profit %\n${csvContent}`,
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
      <main className="container mx-auto px-4 py-6">
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
                  <span>Steam Market (Manual)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel */}
        <StatsPanel stats={stats} />

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

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Manage Tags
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Market Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lis-Skins</span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Market.CSGO</span>
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Online
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Steam Market</span>
                  <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  >
                    Manual
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last import:</span>
                  <span>2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last sale:</span>
                  <span>1 day ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last purchase:</span>
                  <span>3 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total trades:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
