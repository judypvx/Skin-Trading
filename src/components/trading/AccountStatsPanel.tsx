import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountStats, formatCurrency } from "@/lib/account-data";
import {
  Users,
  Play,
  Pause,
  AlertTriangle,
  DollarSign,
  Package,
  Bell,
  CreditCard,
  Banknote,
} from "lucide-react";

interface AccountStatsPanelProps {
  stats: AccountStats;
}

const AccountStatsPanel = ({ stats }: AccountStatsPanelProps) => {
  const statCards = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts.toString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Active Accounts",
      value: stats.activeAccounts.toString(),
      icon: Play,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Paused Accounts",
      value: stats.pausedAccounts.toString(),
      icon: Pause,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Error Accounts",
      value: stats.errorAccounts.toString(),
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ];

  const balanceCards = [
    {
      title: "Steam Balances",
      value: formatCurrency(stats.totalSteamBalance),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Market.CSGO Balances",
      value: formatCurrency(stats.totalMarketCSGOBalance),
      icon: CreditCard,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Lis-Skins Balances",
      value: formatCurrency(stats.totalLisSkinBalance),
      icon: Banknote,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Total Inventory Value",
      value: formatCurrency(stats.totalInventoryValue),
      icon: Package,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
  ];

  // Calculate additional metrics
  const activePercentage =
    stats.totalAccounts > 0
      ? ((stats.activeAccounts / stats.totalAccounts) * 100).toFixed(1)
      : "0";
  const errorPercentage =
    stats.totalAccounts > 0
      ? ((stats.errorAccounts / stats.totalAccounts) * 100).toFixed(1)
      : "0";
  const totalLiquidFunds =
    stats.totalSteamBalance +
    stats.totalMarketCSGOBalance +
    stats.totalLisSkinBalance;
  const totalNetWorth = totalLiquidFunds + stats.totalInventoryValue;

  return (
    <div className="space-y-6">
      {/* Account Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Balance Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {balanceCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Account Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Accounts</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">{activePercentage}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paused Accounts</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">{stats.pausedAccounts}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">{errorPercentage}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Liquid Funds</span>
                <span className="font-medium">
                  {formatCurrency(totalLiquidFunds)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inventory Assets</span>
                <span className="font-medium">
                  {formatCurrency(stats.totalInventoryValue)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Total Net Worth</span>
                <span className="font-bold text-lg">
                  {formatCurrency(totalNetWorth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Market Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Steam Market</span>
                <span className="font-medium">
                  {((stats.totalSteamBalance / totalLiquidFunds) * 100).toFixed(
                    1,
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Market.CSGO</span>
                <span className="font-medium">
                  {(
                    (stats.totalMarketCSGOBalance / totalLiquidFunds) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lis-Skins</span>
                <span className="font-medium">
                  {(
                    (stats.totalLisSkinBalance / totalLiquidFunds) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountStatsPanel;
