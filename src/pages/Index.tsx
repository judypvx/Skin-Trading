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
import StatsPanel from "@/components/trading/StatsPanel";
import TradingTable from "@/components/trading/TradingTable";
import ImportDialog from "@/components/trading/ImportDialog";
import {
  TradingItem,
  mockTradingItems,
  calculateStats,
  TradingStats,
} from "@/lib/trading-data";
import { BarChart3, Settings, User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Index = () => {
  const [items, setItems] = useState<TradingItem[]>(mockTradingItems);
  const [stats, setStats] = useState<TradingStats>(
    calculateStats(mockTradingItems),
  );
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

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
    console.log("Import successful - refreshing data...");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Skin Trading Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Track and analyze your CS:GO skin investments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              <ImportDialog onImportSuccess={handleImportSuccess} />

              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>

              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Welcome back, Trader!
                  </CardTitle>
                  <CardDescription>
                    Here's an overview of your skin trading performance across
                    all marketplaces.
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  Live Data
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
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected to Buff163</span>
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
                  <span className="text-sm">Buff163</span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  >
                    Slow
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            Skin Trading Dashboard v1.0 • Built for serious traders •
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
