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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Save, X, Plus } from "lucide-react";
import { SteamAccount } from "@/lib/account-data";
import { toast } from "sonner";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (account: Partial<SteamAccount>) => void;
}

const AddAccountModal = ({
  open,
  onOpenChange,
  onAdd,
}: AddAccountModalProps) => {
  const [formData, setFormData] = useState<Partial<SteamAccount>>({
    nickname: "", // This will be the alias
    login: "",
    password: "",
    proxyFull: "",
    maFile: undefined,
    autoConfirmTrades: false,
  });
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

  // Validate proxy format (ip:port:login:pass)
  const validateProxyFormat = (proxy: string): boolean => {
    if (!proxy.trim()) return false;
    const parts = proxy.split(":");
    return parts.length === 4 && parts.every((part) => part.trim().length > 0);
  };

  const handleAdd = () => {
    // Validate required fields
    if (!formData.nickname || !formData.login || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate proxy format
    if (!formData.proxyFull || !validateProxyFormat(formData.proxyFull)) {
      toast.error(
        "Proxy field is required and must be in format: ip:port:login:pass",
      );
      return;
    }

    // Generate a new account object
    const newAccount: Partial<SteamAccount> = {
      ...formData,
      id: Date.now().toString(),
      proxy: formData.proxyFull
        ? formData.proxyFull.split(":")[0] + ".***"
        : "Not set",
      twoFactorCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      tradeConfirmations: 0,
      steamBalance: 0,
      marketCSGOBalance: 0,
      lisSkinBalance: 0,
      inventoryValue: 0,
      inventoryValueMarket: "Lis-Skins",
      status: "OK",
      steamLevel: Math.floor(Math.random() * 50) + 1,
      isActive: false,
      isPaused: false,
      lastActivity: new Date().toISOString(),
      profileUrl: `https://steamcommunity.com/id/${formData.login}`,
      avatarUrl: "/placeholder.svg",
    };

    onAdd(newAccount);
    toast.success(`Account "${formData.nickname}" added successfully`);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nickname: "",
      login: "",
      password: "",
      proxyFull: "",
      maFile: undefined,
      autoConfirmTrades: false,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Account
            </DialogTitle>
            <DialogDescription>
              Add a new Steam account to your trading bot network
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alias">
                    Alias <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="alias"
                    type="text"
                    placeholder="Enter a name for this account (e.g., Trader 2)"
                    value={formData.nickname}
                    onChange={(e) =>
                      handleInputChange("nickname", e.target.value)
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    This name will be displayed throughout the UI
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login">
                    Steam Login <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="login"
                    type="text"
                    placeholder="Steam username"
                    value={formData.login}
                    onChange={(e) => handleInputChange("login", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Steam Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Steam password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Proxy Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Proxy Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proxy">
                    Proxy <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="proxy"
                    type="text"
                    placeholder="ip:port:login:pass"
                    value={formData.proxyFull}
                    onChange={(e) =>
                      handleInputChange("proxyFull", e.target.value)
                    }
                    className={
                      formData.proxyFull &&
                      !validateProxyFormat(formData.proxyFull)
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Required format: ip:port:login:pass
                  </p>
                  {formData.proxyFull &&
                    !validateProxyFormat(formData.proxyFull) && (
                      <p className="text-sm text-red-500">
                        Invalid format. Please use: ip:port:login:pass
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* 2FA File Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-confirm trades</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically confirm trade offers for this account
                    </p>
                  </div>
                  <Switch
                    checked={formData.autoConfirmTrades || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("autoConfirmTrades", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleAdd} className="gap-2">
              <Save className="h-4 w-4" />
              Add Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddAccountModal;
