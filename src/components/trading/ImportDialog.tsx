import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Key, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getImportFunction, validateApiKey, uploadCSV } from "@/lib/api";

interface ImportDialogProps {
  onImportSuccess: () => void;
}

const ImportDialog = ({ onImportSuccess }: ImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");

  const platforms = [
    { value: "Lis-Skins", label: "Lis-Skins", available: true },
    { value: "Market.CSGO", label: "Market.CSGO", available: true },
    { value: "Steam Market", label: "Steam Market", available: false },
  ];

  const handleApiImport = async () => {
    if (!selectedPlatform || !apiKey) {
      toast.error("Please select a platform and enter your API key");
      return;
    }

    if (!validateApiKey(apiKey, selectedPlatform)) {
      toast.error("Invalid API key format");
      return;
    }

    setLoading(true);
    try {
      const importFunction = getImportFunction(selectedPlatform);
      const result = await importFunction(apiKey);

      if (result.success) {
        toast.success(result.message);
        onImportSuccess();
        setOpen(false);
        setApiKey("");
        setSelectedPlatform("");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setLoading(true);
    try {
      const result = await uploadCSV(file);
      if (result.success) {
        toast.success(result.message);
        onImportSuccess();
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("File upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Update Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Update Inventory
          </DialogTitle>
          <DialogDescription>
            Update your trading inventory from various marketplaces or upload a
            CSV file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api" className="gap-2">
              <Key className="h-4 w-4" />
              API Import
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2">
              <FileText className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Select Platform</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem
                        key={platform.value}
                        value={platform.value}
                        disabled={!platform.available}
                      >
                        {platform.label}
                        {!platform.available && " (Coming Soon)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Your API key is used to fetch trading data from the selected
                  platform.
                </p>
              </div>

              <Button
                onClick={handleApiImport}
                disabled={loading || !selectedPlatform || !apiKey}
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {loading ? "Importing..." : "Import from API"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <Label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="text-lg font-medium">Upload CSV File</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click to browse or drag and drop your CSV file here
                  </p>
                </Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  CSV Format Requirements:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Item Name, Buy Price, Buy Date, Market, Asset ID</li>
                  <li>• Optional: Sell Price, Sell Date, Status</li>
                  <li>• Dates in YYYY-MM-DD format</li>
                  <li>• Prices in USD (numbers only)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
