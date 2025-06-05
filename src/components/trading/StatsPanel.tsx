import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TradingStats,
  formatCurrency,
  formatPercentage,
} from "@/lib/trading-data";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Percent,
  ShoppingCart,
} from "lucide-react";

interface StatsPanelProps {
  stats: TradingStats;
}

const StatsPanel = ({ stats }: StatsPanelProps) => {
  const statCards = [
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: ShoppingCart,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Total Earned",
      value: formatCurrency(stats.totalEarned),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Total Profit",
      value: formatCurrency(stats.totalProfit),
      icon: stats.totalProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalProfit >= 0 ? "text-green-500" : "text-red-500",
      bgColor:
        stats.totalProfit >= 0
          ? "bg-green-50 dark:bg-green-950"
          : "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Average ROI",
      value: formatPercentage(stats.averageROI),
      icon: Percent,
      color: stats.averageROI >= 0 ? "text-green-500" : "text-red-500",
      bgColor:
        stats.averageROI >= 0
          ? "bg-green-50 dark:bg-green-950"
          : "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Items in Inventory",
      value: stats.itemsInInventory.toString(),
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Items",
      value: stats.totalItems.toString(),
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
  );
};

export default StatsPanel;
