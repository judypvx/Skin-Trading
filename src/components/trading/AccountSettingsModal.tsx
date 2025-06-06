import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload, HelpCircle, Save, X } from "lucide-react";
import { SteamAccount } from "@/lib/account-data";
import { toast } from "sonner";

interface AccountSettingsModalProps {
  account: SteamAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (accountId: string, updates: Partial<SteamAccount>) => void;
}

const AccountSettingsModal = ({
  account,
  open,
  onOpenChange,
  onSave,
}: AccountSettingsModalProps) => {
  const [formData, setFormData] = useState<Partial<SteamAccount>>({});
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (
    field: keyof SteamAccount,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".maFile")) {
      toast.error("Please upload a .maFile file");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      maFile: file,
    }));
    toast.success(`Uploaded ${file.name}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSave = () => {
    if (!account) return;

    onSave(account.id, formData);
    toast.success("Account settings saved successfully");
    onOpenChange(false);
    setFormData({});
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({});
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Account Settings - {account.nickname}
          </DialogTitle>
          <DialogDescription>
            Configure login credentials and API keys for this account
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Steam username"
                  defaultValue={account.login}
                  onChange={(e) => handleInputChange("login", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Steam password"
                  defaultValue={account.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxy">Proxy</Label>
                <Input
                  id="proxy"
                  type="text"
                  placeholder="ip:port:login:pass"
                  defaultValue={account.proxyFull}
                  onChange={(e) =>
                    handleInputChange("proxyFull", e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Format: ip:port:login:pass
                </p>
              </div>

              <div className="space-y-2">
                <Label>.maFile Upload</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/25"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <Label htmlFor="maFile" className="cursor-pointer">
                    <span className="font-medium">Upload .maFile</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click to browse or drag and drop your .maFile here
                    </p>
                  </Label>
                  <Input
                    id="maFile"
                    type="file"
                    accept=".maFile"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {formData.maFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {formData.maFile.name}
                    </p>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Trade Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-confirm trades</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically confirm trade offers
                      </p>
                    </div>
                    <Switch
                      checked={
                        formData.autoConfirmTrades ?? account.autoConfirmTrades
                      }
                      onCheckedChange={(checked) =>
                        handleInputChange("autoConfirmTrades", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="apikeys" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="steamApiKey">Steam API Key</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Get your Steam API key from:
                          https://steamcommunity.com/dev/apikey
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="steamApiKey"
                  type="password"
                  placeholder="Steam API Key"
                  defaultValue={account.steamApiKey}
                  onChange={(e) =>
                    handleInputChange("steamApiKey", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="marketCSGOApiKey">Market.CSGO API Key</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Get your Market.CSGO API key from your account
                          settings
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="marketCSGOApiKey"
                  type="password"
                  placeholder="Market.CSGO API Key"
                  defaultValue={account.marketCSGOApiKey}
                  onChange={(e) =>
                    handleInputChange("marketCSGOApiKey", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="lisSkinApiKey">Lis-Skins API Key</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Get your Lis-Skins API key from your profile settings
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="lisSkinApiKey"
                  type="password"
                  placeholder="Lis-Skins API Key"
                  defaultValue={account.lisSkinApiKey}
                  onChange={(e) =>
                    handleInputChange("lisSkinApiKey", e.target.value)
                  }
                />
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Steam API</span>
                      <span
                        className={
                          account.steamApiKey
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {account.steamApiKey
                          ? "✓ Connected"
                          : "✗ Not configured"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market.CSGO API</span>
                      <span
                        className={
                          account.marketCSGOApiKey
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {account.marketCSGOApiKey
                          ? "✓ Connected"
                          : "✗ Not configured"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lis-Skins API</span>
                      <span
                        className={
                          account.lisSkinApiKey
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {account.lisSkinApiKey
                          ? "✓ Connected"
                          : "✗ Not configured"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsModal;
