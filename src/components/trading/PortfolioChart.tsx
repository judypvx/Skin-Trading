import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingItem } from "@/lib/trading-data";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioChartProps {
  items: TradingItem[];
  timePeriod: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
  rawDate: Date;
}

const PortfolioChart = ({ items, timePeriod }: PortfolioChartProps) => {
  const [animationKey, setAnimationKey] = useState(0);

  // Generate portfolio value data over time
  const chartData = useMemo(() => {
    const now = new Date();
    const dataPoints: ChartDataPoint[] = [];

    // Determine date range based on time period
    let startDate: Date;
    let dateIncrement: number; // days
    let totalPoints: number;

    switch (timePeriod) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateIncrement = 1; // hourly increments (24 points)
        totalPoints = 24;
        break;
      case "last-7-days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        dateIncrement = 1; // daily
        totalPoints = 8;
        break;
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        dateIncrement = 1; // daily
        totalPoints = now.getDate();
        break;
      case "all-time":
      default:
        // Find earliest item date
        const earliestDate = items.reduce((earliest, item) => {
          const itemDate = new Date(item.buyDate);
          return itemDate < earliest ? itemDate : earliest;
        }, now);
        startDate = new Date(earliestDate);
        startDate.setDate(startDate.getDate() - 1); // Start one day before first purchase

        const daysDiff = Math.ceil(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff <= 30) {
          dateIncrement = 1; // daily
          totalPoints = daysDiff + 1;
        } else if (daysDiff <= 90) {
          dateIncrement = 3; // every 3 days
          totalPoints = Math.ceil(daysDiff / 3);
        } else {
          dateIncrement = 7; // weekly
          totalPoints = Math.ceil(daysDiff / 7);
        }
        break;
    }

    // Generate data points
    for (let i = 0; i <= totalPoints; i++) {
      const currentDate = new Date(startDate);

      if (timePeriod === "today") {
        currentDate.setHours(i);
      } else {
        currentDate.setDate(startDate.getDate() + i * dateIncrement);
      }

      // Calculate portfolio value at this point in time
      let portfolioValue = 0;

      items.forEach((item) => {
        const itemBuyDate = new Date(item.buyDate);
        const itemSellDate = item.sellDate ? new Date(item.sellDate) : null;

        // If item was bought before or on this date
        if (itemBuyDate <= currentDate) {
          // If item was sold after this date or not sold yet, include its current value
          if (!itemSellDate || itemSellDate > currentDate) {
            // Use current market price if available, otherwise use buy price
            const currentValue = item.currentMarketPrice || item.buyPrice;
            portfolioValue += currentValue;
          }
        }
      });

      const formattedDate =
        timePeriod === "today"
          ? currentDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : currentDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              ...(timePeriod === "all-time" && dateIncrement >= 7
                ? { year: "2-digit" }
                : {}),
            });

      dataPoints.push({
        date: currentDate.toISOString().split("T")[0],
        value: portfolioValue,
        formattedDate,
        rawDate: currentDate,
      });
    }

    return dataPoints;
  }, [items, timePeriod]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (chartData.length < 2)
      return { percentage: 0, isPositive: true, trend: "neutral" };

    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;

    if (firstValue === 0)
      return { percentage: 0, isPositive: true, trend: "neutral" };

    const percentage = ((lastValue - firstValue) / firstValue) * 100;
    const isPositive = percentage >= 0;

    return {
      percentage: Math.abs(percentage),
      isPositive,
      trend: isPositive ? "up" : "down",
    };
  }, [chartData]);

  // Trigger animation when timePeriod changes
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [timePeriod]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">
            {data.formattedDate}
          </p>
          <p className="text-sm text-muted-foreground">
            Portfolio Value:
            <span className="font-semibold text-foreground ml-1">
              $
              {payload[0].value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case "today":
        return "today";
      case "last-7-days":
        return "this week";
      case "this-month":
        return "this month";
      case "all-time":
        return "all time";
      default:
        return "this period";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Portfolio Value Over Time
          </CardTitle>
          {performanceMetrics.percentage > 0 && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                performanceMetrics.isPositive
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {performanceMetrics.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {performanceMetrics.isPositive ? "+" : "-"}
              {performanceMetrics.percentage.toFixed(2)}% {getTimePeriodLabel()}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={animationKey}
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient
                  id="portfolioGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="formattedDate"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                angle={timePeriod === "all-time" ? -45 : 0}
                textAnchor={timePeriod === "all-time" ? "end" : "middle"}
                height={timePeriod === "all-time" ? 60 : 30}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#portfolioGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                  fill: "hsl(var(--background))",
                }}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No data available for the selected time period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
