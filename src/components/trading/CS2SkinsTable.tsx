import React, { useState, useMemo } from "react";
import { useCS2Skins, CS2Skin } from "@/hooks/use-cs2-skins";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Loader2, AlertCircle, Languages } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Language = "en" | "ru";

const CS2SkinsTable: React.FC = () => {
  const [language, setLanguage] = useState<Language>("en");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: skins = [], isLoading, error } = useCS2Skins();

  // Filter skins based on search term (searches both languages but displays according to toggle)
  const filteredSkins = useMemo(() => {
    if (!searchTerm) return skins;

    const searchLower = searchTerm.toLowerCase();
    return skins.filter((skin) => {
      // Search in both English and Russian names
      const englishMatch = skin.name_en.toLowerCase().includes(searchLower);
      const russianMatch = skin.name_ru.toLowerCase().includes(searchLower);
      return englishMatch || russianMatch;
    });
  }, [skins, searchTerm]); // Remove language dependency since we search both

  // Get rarity color for badges
  const getRarityColor = (rarity: string) => {
    const rarityLower = rarity.toLowerCase();
    switch (rarityLower) {
      case "contraband":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "covert":
        return "bg-red-400/10 text-red-400 border-red-400/20";
      case "classified":
        return "bg-pink-400/10 text-pink-400 border-pink-400/20";
      case "restricted":
        return "bg-purple-400/10 text-purple-400 border-purple-400/20";
      case "mil-spec":
      case "mil-spec grade":
        return "bg-blue-400/10 text-blue-400 border-blue-400/20";
      case "industrial grade":
        return "bg-cyan-400/10 text-cyan-400 border-cyan-400/20";
      case "consumer grade":
        return "bg-gray-400/10 text-gray-400 border-gray-400/20";
      default:
        return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-[1584px]">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading CS2 skins from Firestore. Please check your Firebase
            configuration and ensure the "skins" collection exists.
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1584px]">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">CS2 Skins Database</h1>
        <p className="text-muted-foreground">
          Browse the complete collection of Counter-Strike 2 skins with
          multilingual support
        </p>
      </div>

      {/* Controls Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Language</CardTitle>
          <CardDescription>
            Search for skins and switch between English and Russian names
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="gap-2"
              >
                {language === "en" ? "EN" : "RU"}
                <span className="text-xs text-muted-foreground">
                  {language === "en"
                    ? "Switch to Russian"
                    : "Switch to English"}
                </span>
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skins in both English and Russian..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>

            {/* Results Counter */}
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                `${filteredSkins.length} of ${skins.length} skins`
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skins Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            CS2 Skins Collection ({language === "en" ? "English" : "Русский"})
          </CardTitle>
          <CardDescription>
            Complete database of Counter-Strike 2 weapon skins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground w-20">
                    Image
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Rarity
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Weapon
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-muted-foreground">
                          Loading CS2 skins from Firestore...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSkins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="text-muted-foreground">
                        {searchTerm
                          ? `No skins found matching "${searchTerm}" in either language`
                          : "No skins found in database"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSkins.map((skin) => (
                    <tr
                      key={skin.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      {/* Image */}
                      <td className="py-4">
                        <div className="w-16 h-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded border overflow-hidden">
                          {skin.image ? (
                            <img
                              src={skin.image}
                              alt={
                                language === "en" ? skin.name_en : skin.name_ru
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to gradient background if image fails to load
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4">
                        <div className="font-medium">
                          {language === "en" ? skin.name_en : skin.name_ru}
                        </div>
                        {/* Show alternate language as subtitle if available */}
                        {language === "en" && skin.name_ru && (
                          <div className="text-sm text-muted-foreground">
                            {skin.name_ru}
                          </div>
                        )}
                        {language === "ru" && skin.name_en && (
                          <div className="text-sm text-muted-foreground">
                            {skin.name_en}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-4">
                        <span className="text-sm">{skin.type}</span>
                      </td>

                      {/* Rarity */}
                      <td className="py-4">
                        <Badge
                          variant="outline"
                          className={getRarityColor(skin.rarity)}
                        >
                          {skin.rarity}
                        </Badge>
                      </td>

                      {/* Weapon */}
                      <td className="py-4">
                        <span className="text-sm font-medium">
                          {skin.weapon}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4">
                        <span className="text-sm text-muted-foreground">
                          {skin.category}
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

      {/* Footer Stats */}
      {!isLoading && skins.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Displaying {filteredSkins.length} of {skins.length} total CS2 skins
          {searchTerm && ` matching "${searchTerm}" in both languages`}
        </div>
      )}
    </div>
  );
};

export default CS2SkinsTable;
