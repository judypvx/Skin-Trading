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
import AccountStatsPanel from "@/components/trading/AccountStatsPanel";
import AccountsTable from "@/components/trading/AccountsTable";
import AddAccountModal from "@/components/trading/AddAccountModal";
import {
  SteamAccount,
  mockSteamAccounts,
  calculateAccountStats,
  AccountStats,
} from "@/lib/account-data";
import { Users, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Accounts = () => {
  const [accounts, setAccounts] = useState<SteamAccount[]>(mockSteamAccounts);
  const [stats, setStats] = useState<AccountStats>(
    calculateAccountStats(mockSteamAccounts),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);

  useEffect(() => {
    const newStats = calculateAccountStats(accounts);
    setStats(newStats);
  }, [accounts]);

  const handleUpdateAccount = (id: string, updates: Partial<SteamAccount>) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, ...updates } : account,
      ),
    );
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call to refresh account data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update last activity for all accounts
      const updatedAccounts = accounts.map((account) => ({
        ...account,
        lastActivity: new Date().toISOString(),
      }));

      setAccounts(updatedAccounts);
      toast.success("All accounts refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh accounts");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddAccount = (newAccount: Partial<SteamAccount>) => {
    setAccounts((prev) => [...prev, newAccount as SteamAccount]);
  };

  const handleExportAccounts = () => {
    const csvContent = accounts
      .map(
        (acc) =>
          `${acc.nickname},${acc.proxy},${acc.steamBalance},${acc.inventoryValue},${acc.status}`,
      )
      .join("\n");

    const blob = new Blob(
      [`Nickname,Proxy,Steam Balance,Inventory Value,Status\n${csvContent}`],
      { type: "text/csv" },
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "steam-accounts.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Accounts exported to CSV");
  };

  const getHealthStatus = () => {
    const errorCount = stats.errorAccounts;
    const totalCount = stats.totalAccounts;

    if (errorCount === 0) {
      return {
        status: "Excellent",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900",
      };
    } else if (errorCount / totalCount <= 0.1) {
      return {
        status: "Good",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100 dark:bg-yellow-900",
      };
    } else {
      return {
        status: "Needs Attention",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900",
      };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NavigationTabs />

      {/* Main Content */}
      <main className="w-full mx-auto px-4 py-6" style={{ maxWidth: "1584px" }}>
        {/* Welcome Section */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-background border-blue-200 dark:from-blue-950 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Account Control Panel
                    </CardTitle>
                    <CardDescription>
                      Manage and monitor your Steam trading bot accounts
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  className={`${healthStatus.bgColor} ${healthStatus.color}`}
                >
                  System {healthStatus.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{stats.activeAccounts} Active Accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>{stats.pausedAccounts} Paused</span>
                </div>
                {stats.errorAccounts > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{stats.errorAccounts} Need Attention</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel */}
        <AccountStatsPanel stats={stats} />

        <Separator className="my-6" />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button onClick={() => setAddAccountOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh All"}
            </Button>
          </div>
        </div>

        {/* Accounts Table */}
        <AccountsTable
          accounts={accounts}
          onUpdateAccount={handleUpdateAccount}
        />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            Account Control Panel v1.0 • Managing {stats.totalAccounts} Steam
            accounts •
            <Button variant="link" className="p-0 h-auto text-sm">
              System Logs
            </Button>
          </p>
        </footer>
      </main>

      <AddAccountModal
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        onAdd={handleAddAccount}
      />
    </div>
  );
};
export default Accounts;
