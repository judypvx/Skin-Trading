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
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useFirebaseSkins,
  useSkinsStats,
  SkinsFilters,
} from "@/hooks/use-firebase-skins";
import { seedSkinsDatabase } from "@/lib/firebase-seed";
import { useState } from "react";

const Explorer = () => {
  const [filters, setFilters] = useState<SkinsFilters>({});
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch skins data from Firebase
  const {
    data: skins = [],
    isLoading: skinsLoading,
    error: skinsError,
  } = useFirebaseSkins(filters);
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useSkinsStats();

  // Handle search input
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SkinsFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  // Seed database with sample data
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedSkinsDatabase();
      // Refetch data after seeding
      window.location.reload();
    } catch (error) {
      console.error("Error seeding database:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  // Show error state
  if (skinsError || statsError) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationTabs />
        <div className="container mx-auto px-4 py-6 max-w-[1584px]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading data from Firebase. Please check your Firebase
              configuration.
              <br />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skins..."
                  className="pl-10"
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <Select
                onValueChange={(value) =>
                  handleFilterChange("weaponType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Weapon Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="rifle">Rifles</SelectItem>
                  <SelectItem value="pistol">Pistols</SelectItem>
                  <SelectItem value="smg">SMGs</SelectItem>
                  <SelectItem value="sniper">Sniper Rifles</SelectItem>
                  <SelectItem value="knife">Knives</SelectItem>
                  <SelectItem value="gloves">Gloves</SelectItem>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value) => handleFilterChange("rarity", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="Contraband">Contraband</SelectItem>
                  <SelectItem value="Covert">Covert</SelectItem>
                  <SelectItem value="Classified">Classified</SelectItem>
                  <SelectItem value="Restricted">Restricted</SelectItem>
                  <SelectItem value="Mil-Spec">Mil-Spec</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>

              {skins.length === 0 && !skinsLoading && (
                <Button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="gap-2"
                >
                  {isSeeding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Seed Sample Data
                </Button>
              )}
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
              {statsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.totalSkins?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all collections
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Market Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.formattedAvgPrice || "$0.00"}
                  </div>
                  <p
                    className={`text-xs ${
                      (stats?.avgChange || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {stats?.formattedAvgChange || "0.0%"} from yesterday
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.formattedTotalVolume || "$0.0M"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trading volume
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {skins.length.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Currently loaded</p>
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
                  {skinsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground">
                            Loading skins...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : skins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <div className="text-muted-foreground">
                          No skins found. Try adjusting your filters or{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={handleSeedDatabase}
                            disabled={isSeeding}
                          >
                            seed sample data
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    skins.map((skin) => (
                      <tr
                        key={skin.id}
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
                            {skin.priceFormatted}
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
                              {skin.changeFormatted}
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
                    ))
                  )}
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
