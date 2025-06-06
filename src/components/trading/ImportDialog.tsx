import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Download, Key, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { getImportFunction, validateApiKey } from "@/lib/api";
import { mockSteamAccounts, SteamAccount } from "@/lib/account-data";

interface ImportDialogProps {
  onImportSuccess: () => void;
}

const ImportDialog = ({ onImportSuccess }: ImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedMarketplace, setSelectedMarketplace] = useState("");
  const [autoFilledApiKey, setAutoFilledApiKey] = useState("");

  const marketplaces = [
    { value: "Lis-Skins", label: "Lis-Skins", available: true },
    { value: "Market.CSGO", label: "Market.CSGO", available: true },
    { value: "Steam Market", label: "Steam Market", available: false },
  ];

  // Filter active accounts only
  const availableAccounts = mockSteamAccounts.filter(
    (account) => account.isActive && account.status === "OK",
  );

  // Auto-fill API key when account and marketplace are selected
  useEffect(() => {
    if (selectedAccount && selectedMarketplace) {
      const account = mockSteamAccounts.find(
        (acc) => acc.id === selectedAccount,
      );
      if (account) {
        let apiKey = "";
        switch (selectedMarketplace) {
          case "Lis-Skins":
            apiKey = account.lisSkinApiKey || "";
            break;
          case "Market.CSGO":
            apiKey = account.marketCSGOApiKey || "";
            break;
          case "Steam Market":
            apiKey = account.steamApiKey || "";
            break;
        }
        setAutoFilledApiKey(apiKey);
      }
    } else {
      setAutoFilledApiKey("");
    }
  }, [selectedAccount, selectedMarketplace]);

  const handleApiImport = async () => {
    if (!selectedAccount || !selectedMarketplace || !autoFilledApiKey) {
      toast.error("Please select an account and marketplace");
      return;
    }

    if (!validateApiKey(autoFilledApiKey, selectedMarketplace)) {
      toast.error("Invalid API key for selected marketplace");
      return;
    }

    setLoading(true);
    try {
      const importFunction = getImportFunction(selectedMarketplace);
      const result = await importFunction(
        autoFilledApiKey,
        selectedAccount,
        selectedMarketplace,
      );

      if (result.success) {
        toast.success(
          `Successfully imported ${result.itemCount || 0} items from ${selectedMarketplace}`,
        );
        onImportSuccess();
        setOpen(false);
        resetForm();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAccount("");
    setSelectedMarketplace("");
    setAutoFilledApiKey("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const selectedAccountData = mockSteamAccounts.find(
    (acc) => acc.id === selectedAccount,
  );

  const isMarketplaceAvailable = (marketplace: string) => {
    if (!selectedAccountData) return false;

    switch (marketplace) {
      case "Lis-Skins":
        return !!selectedAccountData.lisSkinApiKey;
      case "Market.CSGO":
        return !!selectedAccountData.marketCSGOApiKey;
      case "Steam Market":
        return !!selectedAccountData.steamApiKey;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Update Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Update Inventory
          </DialogTitle>
          <DialogDescription>
            Import your trading inventory from a marketplace using API
            integration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">Select Account</Label>
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Steam account">
                    {selectedAccountData && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedAccountData.nickname}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{account.nickname}</span>
                        <span className="text-xs text-muted-foreground">
                          (Level {account.steamLevel})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAccountData && (
                <p className="text-xs text-muted-foreground">
                  Steam Balance: ${selectedAccountData.steamBalance.toFixed(2)}{" "}
                  | Inventory Value: $
                  {selectedAccountData.inventoryValue.toFixed(2)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketplace">Target Selling Marketplace</Label>
              <Select
                value={selectedMarketplace}
                onValueChange={setSelectedMarketplace}
                disabled={!selectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose target marketplace" />
                </SelectTrigger>
                <SelectContent>
                  {marketplaces.map((marketplace) => {
                    const hasApiKey = isMarketplaceAvailable(marketplace.value);
                    const isDisabled = !marketplace.available || !hasApiKey;

                    return (
                      <SelectItem
                        key={marketplace.value}
                        value={marketplace.value}
                        disabled={isDisabled}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{marketplace.label}</span>
                          {!marketplace.available && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Coming Soon)
                            </span>
                          )}
                          {marketplace.available &&
                            !hasApiKey &&
                            selectedAccount && (
                              <span className="text-xs text-red-500 ml-2">
                                (No API Key)
                              </span>
                            )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Items will be marked for sale on this marketplace and current
                prices will be tracked.
              </p>
            </div>

            {selectedAccount && selectedMarketplace && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (Auto-filled)</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="apiKey"
                      type="password"
                      value={autoFilledApiKey}
                      readOnly
                      className="pl-10 bg-muted"
                      placeholder="API key will be auto-filled"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    API key automatically selected from account settings for{" "}
                    {selectedMarketplace}.
                  </p>
                </div>
              </>
            )}
          </div>

          <Button
            onClick={handleApiImport}
            disabled={
              loading ||
              !selectedAccount ||
              !selectedMarketplace ||
              !autoFilledApiKey ||
              !isMarketplaceAvailable(selectedMarketplace)
            }
            className="w-full gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {loading
              ? "Importing Inventory..."
              : `Import from ${selectedMarketplace || "Marketplace"}`}
          </Button>

          {selectedAccount && selectedMarketplace && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This will import inventory items from{" "}
                <strong>{selectedAccountData?.nickname}</strong> and mark them
                for sale on <strong>{selectedMarketplace}</strong>.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
