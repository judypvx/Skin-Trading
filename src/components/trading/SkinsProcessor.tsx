import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Download,
  Database,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  processSkins,
  getSavedSkins,
  type ProcessSkinsResponse,
  type ProcessedSkin,
} from "@/lib/skins-processor";

export const SkinsProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProcessSkinsResponse | null>(null);
  const [savedSkins, setSavedSkins] = useState<ProcessedSkin[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleProcessSkins = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      console.log("🔄 Starting skins processing...");
      const response = await processSkins(true, true); // Save to file and include data
      setResult(response);

      if (response.success && response.data) {
        console.log(`✅ Successfully processed ${response.count} skins`);
      }
    } catch (error) {
      console.error("Error processing skins:", error);
      setResult({
        success: false,
        message: "Failed to process skins",
        count: 0,
        saved: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSavedSkins = async () => {
    setIsLoading(true);

    try {
      const response = await getSavedSkins();
      if (response.success && response.data) {
        setSavedSkins(response.data);
        setShowPreview(true);
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to load saved skins",
          count: 0,
          saved: false,
          error: response.error,
        });
      }
    } catch (error) {
      console.error("Error loading saved skins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CS2 Skins Data Processor
          </CardTitle>
          <CardDescription>
            Fetch and process CS2 skins data from ByMykel API (all.json
            endpoint). This will normalize the data structure and prepare it for
            Builder.io integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleProcessSkins}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : "Process Skins Data"}
            </Button>

            <Button
              variant="outline"
              onClick={handleLoadSavedSkins}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isLoading ? "Loading..." : "Load Saved Data"}
            </Button>

            {savedSkins.length > 0 && (
              <Button
                variant="secondary"
                onClick={togglePreview}
                className="flex items-center gap-2"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            )}
          </div>

          {/* Results */}
          {result && (
            <Alert
              className={
                result.success
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription
                  className={result.success ? "text-green-800" : "text-red-800"}
                >
                  <div className="font-medium">{result.message}</div>
                  {result.success && (
                    <div className="text-sm mt-1">
                      Processed {result.count} skins
                      {result.saved && result.filePath && (
                        <span> • Saved to {result.filePath}</span>
                      )}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-sm mt-1 text-red-600">
                      Error: {result.error}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Stats */}
          {savedSkins.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {savedSkins.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Skins</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {new Set(savedSkins.map((s) => s.weapon)).size}
                </div>
                <div className="text-sm text-muted-foreground">Weapons</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {savedSkins.filter((s) => s.stattrak).length}
                </div>
                <div className="text-sm text-muted-foreground">StatTrak™</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {savedSkins.filter((s) => s.souvenir).length}
                </div>
                <div className="text-sm text-muted-foreground">Souvenir</div>
              </div>
            </div>
          )}

          {/* Preview */}
          {showPreview && savedSkins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Preview</CardTitle>
                <CardDescription>
                  First 10 processed skins (showing structure for Builder.io
                  integration)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savedSkins.slice(0, 10).map((skin, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{skin.name}</span>
                        {skin.stattrak && (
                          <Badge variant="secondary" className="text-xs">
                            StatTrak™
                          </Badge>
                        )}
                        {skin.souvenir && (
                          <Badge variant="outline" className="text-xs">
                            Souvenir
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Weapon: {skin.weapon}</div>
                        <div>Rarity: {skin.rarity}</div>
                        <div>
                          Float: {skin.min_float} - {skin.max_float}
                        </div>
                        <div>Collections: {skin.collections.length}</div>
                      </div>
                      {skin.image && (
                        <div className="mt-2">
                          <img
                            src={skin.image}
                            alt={skin.name}
                            className="w-16 h-12 object-contain rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {savedSkins.length > 10 && (
                    <div className="text-center text-muted-foreground text-sm">
                      ... and {savedSkins.length - 10} more skins
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
