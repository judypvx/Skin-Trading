import NavigationTabs from "@/components/trading/NavigationTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Explorer = () => {
  // Mock data for demonstration
  const mockSkins = [
    {
      name: "AK-47 | Redline",
      wear: "Field-Tested",
      price: "$45.23",
      change: "+2.5%",
      volume: "1,234",
      trend: "up",
      statTrak: false,
      rarity: "Classified",
      collection: "Phoenix Collection",
    },
    {
      name: "AWP | Dragon Lore",
      wear: "Factory New",
      price: "$8,234.12",
      change: "-1.2%",
      volume: "23",
      trend: "down",
      statTrak: false,
      rarity: "Covert",
      collection: "Cobblestone Collection",
    },
    {
      name: "M4A4 | Howl",
      wear: "Minimal Wear",
      price: "$3,456.78",
      change: "0.0%",
      volume: "45",
      trend: "neutral",
      statTrak: true,
      rarity: "Contraband",
      collection: "Huntsman Collection",
    },
    {
      name: "Karambit | Fade",
      wear: "Factory New",
      price: "$1,234.56",
      change: "+5.7%",
      volume: "67",
      trend: "up",
      statTrak: true,
      rarity: "Covert",
      collection: "Knife",
    },
    {
      name: "Glock-18 | Water Elemental",
      wear: "Field-Tested",
      price: "$12.34",
      change: "+0.8%",
      volume: "456",
      trend: "up",
      statTrak: false,
      rarity: "Restricted",
      collection: "Chroma Collection",
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Contraband":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Covert":
        return "bg-red-400/10 text-red-400 border-red-400/20";
      case "Classified":
        return "bg-pink-400/10 text-pink-400 border-pink-400/20";
      case "Restricted":
        return "bg-purple-400/10 text-purple-400 border-purple-400/20";
      case "Mil-Spec":
        return "bg-blue-400/10 text-blue-400 border-blue-400/20";
      default:
        return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationTabs />

      <div className="container mx-auto px-4 py-6 max-w-[1584px]">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Skin Explorer</h1>
          <p className="text-muted-foreground">
            Browse all available skins with real-time pricing, market trends,
            and liquidity data
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <CardDescription>
              Find specific skins and filter by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search skins..." className="pl-10" />
              </div>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Weapon Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rifle">Rifles</SelectItem>
                  <SelectItem value="pistol">Pistols</SelectItem>
                  <SelectItem value="smg">SMGs</SelectItem>
                  <SelectItem value="sniper">Sniper Rifles</SelectItem>
                  <SelectItem value="knife">Knives</SelectItem>
                  <SelectItem value="gloves">Gloves</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contraband">Contraband</SelectItem>
                  <SelectItem value="covert">Covert</SelectItem>
                  <SelectItem value="classified">Classified</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="mil-spec">Mil-Spec</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Skins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-muted-foreground">
                Across all collections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Market Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$47.82</div>
              <p className="text-xs text-green-500">+3.2% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.3M</div>
              <p className="text-xs text-red-500">-1.8% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,123</div>
              <p className="text-xs text-muted-foreground">
                Currently on market
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Skins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Skins</CardTitle>
            <CardDescription>
              Most traded skins with current market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">
                      Skin
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Rarity
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      24h Change
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Volume
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Collection
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockSkins.map((skin, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded border"></div>
                          <div>
                            <div className="flex items-center gap-2">
                              {skin.statTrak && (
                                <span className="text-xs bg-[#1a1a1a] text-[#ff6600] px-1 py-0.5 rounded font-medium">
                                  StatTrak™
                                </span>
                              )}
                              <span className="font-medium">{skin.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {skin.wear}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="outline"
                          className={getRarityColor(skin.rarity)}
                        >
                          {skin.rarity}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <span className="font-mono font-medium">
                          {skin.price}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(skin.trend)}
                          <span
                            className={`text-sm ${
                              skin.trend === "up"
                                ? "text-green-500"
                                : skin.trend === "down"
                                  ? "text-red-500"
                                  : "text-gray-500"
                            }`}
                          >
                            {skin.change}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm">{skin.volume}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-muted-foreground">
                          {skin.collection}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" size="lg">
            Load More Skins
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
