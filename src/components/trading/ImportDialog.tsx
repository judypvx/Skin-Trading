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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Loader2,
  User,
  Users,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { getImportFunction, validateApiKey } from "@/lib/api";
import { mockSteamAccounts, SteamAccount } from "@/lib/account-data";
import { formatCurrency } from "@/lib/trading-data";

interface ImportDialogProps {
  onImportSuccess: () => void;
}

const ImportDialog = ({ onImportSuccess }: ImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [allAccountsSelected, setAllAccountsSelected] = useState(false);
  const [sourceMarketplace, setSourceMarketplace] = useState("");
  const [targetMarketplace, setTargetMarketplace] = useState("");

  const marketplaces = [
    { value: "Lis-Skins", label: "Lis-Skins", available: true },
    { value: "Market.CSGO", label: "Market.CSGO", available: true },
    { value: "Steam Market", label: "Steam Market", available: true }, // Enabled as requested
  ];

  // Filter active accounts only
  const availableAccounts = mockSteamAccounts.filter(
    (account) => account.isActive && account.status === "OK",
  );

  // Handle account selection
  const handleAccountToggle = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts((prev) => [...prev, accountId]);
    } else {
      setSelectedAccounts((prev) => prev.filter((id) => id !== accountId));
      if (allAccountsSelected) {
        setAllAccountsSelected(false);
      }
    }
  };

  const handleAllAccountsToggle = (checked: boolean) => {
    setAllAccountsSelected(checked);
    if (checked) {
      setSelectedAccounts(availableAccounts.map((acc) => acc.id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const clearAllAccounts = () => {
    setSelectedAccounts([]);
    setAllAccountsSelected(false);
  };

  // Check if marketplace is available for selected accounts
  const isMarketplaceAvailable = (
    marketplace: string,
    accounts: SteamAccount[],
  ) => {
    return accounts.some((account) => {
      switch (marketplace) {
        case "Lis-Skins":
          return !!account.lisSkinApiKey;
        case "Market.CSGO":
          return !!account.marketCSGOApiKey;
        case "Steam Market":
          return !!account.steamApiKey;
        default:
          return false;
      }
    });
  };

  const getAccountsWithApiKey = (marketplace: string) => {
    return availableAccounts.filter((account) => {
      switch (marketplace) {
        case "Lis-Skins":
          return !!account.lisSkinApiKey;
        case "Market.CSGO":
          return !!account.marketCSGOApiKey;
        case "Steam Market":
          return !!account.steamApiKey;
        default:
          return false;
      }
    });
  };

  const handleImport = async () => {
    const accountsToImport = allAccountsSelected
      ? availableAccounts
      : availableAccounts.filter((acc) => selectedAccounts.includes(acc.id));

    if (
      accountsToImport.length === 0 ||
      !sourceMarketplace ||
      !targetMarketplace
    ) {
      toast.error("Please select accounts and both marketplaces");
      return;
    }

    // Check if selected accounts have API keys for source marketplace
    const accountsWithKeys = getAccountsWithApiKey(sourceMarketplace);
    const validAccounts = accountsToImport.filter((acc) =>
      accountsWithKeys.some((validAcc) => validAcc.id === acc.id),
    );

    if (validAccounts.length === 0) {
      toast.error(
        `No selected accounts have API keys for ${sourceMarketplace}`,
      );
      return;
    }

    setLoading(true);
    let totalImported = 0;
    let successfulAccounts = 0;
    let failedAccounts = 0;

    try {
      const importFunction = getImportFunction(sourceMarketplace);

      // Import from each account sequentially
      for (const account of validAccounts) {
        let apiKey = "";
        switch (sourceMarketplace) {
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

        if (!apiKey) continue;

        try {
          const result = await importFunction(
            apiKey,
            account.id,
            targetMarketplace,
          );
          if (result.success) {
            totalImported += result.itemCount || 0;
            successfulAccounts++;
          } else {
            failedAccounts++;
          }
        } catch (error) {
          failedAccounts++;
        }
      }

      if (successfulAccounts > 0) {
        toast.success(
          `Successfully imported ${totalImported} items from ${successfulAccounts} account(s) via ${sourceMarketplace}. Items marked for sale on ${targetMarketplace}.`,
        );
        onImportSuccess();
        setOpen(false);
        resetForm();
      } else {
        toast.error("Import failed for all selected accounts");
      }

      if (failedAccounts > 0) {
        toast.warning(`Import failed for ${failedAccounts} account(s)`);
      }
    } catch (error) {
      toast.error("Import process failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAccounts([]);
    setAllAccountsSelected(false);
    setSourceMarketplace("");
    setTargetMarketplace("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  // Generate summary text
  const getSummaryText = () => {
    if (!sourceMarketplace || !targetMarketplace) return "";

    const accountText = allAccountsSelected
      ? "All Accounts"
      : selectedAccounts.length > 0
        ? selectedAccounts.length === 1
          ? availableAccounts.find((acc) => acc.id === selectedAccounts[0])
              ?.nickname || "Selected Account"
          : `${selectedAccounts.length} Selected Accounts`
        : "Selected Account(s)";

    return `This will import inventory items from ${accountText} on ${sourceMarketplace}, and mark them for sale on ${targetMarketplace}.`;
  };

  const selectedAccountsData = availableAccounts.filter(
    (acc) => allAccountsSelected || selectedAccounts.includes(acc.id),
  );

  const canImport =
    (allAccountsSelected || selectedAccounts.length > 0) &&
    sourceMarketplace &&
    targetMarketplace &&
    !loading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            Import trading inventory from one marketplace and mark items for
            sale on another.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label>Select Steam Accounts</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {allAccountsSelected
                      ? "All Accounts"
                      : selectedAccounts.length > 0
                        ? `${selectedAccounts.length} Account${selectedAccounts.length > 1 ? "s" : ""} Selected`
                        : "Choose accounts"}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[560px] max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Select Accounts</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* All Accounts Option */}
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Checkbox
                    checked={allAccountsSelected}
                    onCheckedChange={handleAllAccountsToggle}
                  />
                  <div className="flex-1 font-medium">All Accounts</div>
                  <Badge variant="secondary" className="text-xs">
                    {availableAccounts.length} accounts
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Individual Accounts */}
                {availableAccounts.map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    className="flex items-center gap-2 cursor-pointer py-3"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={
                        allAccountsSelected ||
                        selectedAccounts.includes(account.id)
                      }
                      onCheckedChange={(checked) =>
                        handleAccountToggle(account.id, checked as boolean)
                      }
                      disabled={allAccountsSelected}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <User className="h-4 w-4" />
                        {account.nickname}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Steam Balance: {formatCurrency(account.steamBalance)} |
                        Inventory: {formatCurrency(account.inventoryValue)}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}

                {selectedAccounts.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={clearAllAccounts}
                      className="text-red-600 cursor-pointer"
                    >
                      <X className="h-3 w-3 mr-2" />
                      Clear Selection
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedAccountsData.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedAccountsData.slice(0, 3).map((account) => (
                  <Badge
                    key={account.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {account.nickname}
                  </Badge>
                ))}
                {selectedAccountsData.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedAccountsData.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Source Marketplace */}
          <div className="space-y-2">
            <Label htmlFor="source-marketplace">Source Marketplace</Label>
            <Select
              value={sourceMarketplace}
              onValueChange={setSourceMarketplace}
            >
              <SelectTrigger>
                <SelectValue placeholder="Import inventory from..." />
              </SelectTrigger>
              <SelectContent>
                {marketplaces.map((marketplace) => {
                  const selectedAccountsList = allAccountsSelected
                    ? availableAccounts
                    : availableAccounts.filter((acc) =>
                        selectedAccounts.includes(acc.id),
                      );
                  const hasApiKeys =
                    selectedAccountsList.length > 0 &&
                    isMarketplaceAvailable(
                      marketplace.value,
                      selectedAccountsList,
                    );

                  return (
                    <SelectItem
                      key={marketplace.value}
                      value={marketplace.value}
                      disabled={selectedAccountsList.length > 0 && !hasApiKeys}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{marketplace.label}</span>
                        {selectedAccountsList.length > 0 && !hasApiKeys && (
                          <span className="text-xs text-red-500 ml-2">
                            (No API Keys)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Marketplace to import existing inventory items from.
            </p>
          </div>

          {/* Target Marketplace */}
          <div className="space-y-2">
            <Label htmlFor="target-marketplace">
              Target Selling Marketplace
            </Label>
            <Select
              value={targetMarketplace}
              onValueChange={setTargetMarketplace}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mark items for sale on..." />
              </SelectTrigger>
              <SelectContent>
                {marketplaces.map((marketplace) => (
                  <SelectItem key={marketplace.value} value={marketplace.value}>
                    {marketplace.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Marketplace where imported items will be marked for sale and price
              tracking.
            </p>
          </div>

          {/* Summary */}
          {getSummaryText() && (
            <>
              <Separator />
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Import Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {getSummaryText()}
                </p>
              </div>
            </>
          )}

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={!canImport}
            className="w-full gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {loading ? "Importing Inventory..." : "Import Inventory"}
          </Button>

          {/* Additional Info */}
          {selectedAccountsData.length > 0 && sourceMarketplace && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Import will process {selectedAccountsData.length} account
                {selectedAccountsData.length > 1 ? "s" : ""} sequentially. Only
                accounts with valid API keys for {sourceMarketplace} will be
                processed.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
