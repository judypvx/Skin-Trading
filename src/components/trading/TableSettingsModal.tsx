import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  TradingTableSettings,
  ColumnSettings,
  defaultTradingTableSettings,
} from "@/lib/settings";
import { toast } from "sonner";

interface TableSettingsModalProps {
  settings: TradingTableSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: TradingTableSettings) => void;
}

const TableSettingsModal = ({
  settings,
  open,
  onOpenChange,
  onSave,
}: TableSettingsModalProps) => {
  const [localSettings, setLocalSettings] =
    useState<TradingTableSettings>(settings);

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, visible } : col,
      ),
    }));
  };

  const handleColumnWidthChange = (columnId: string, width: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, width } : col,
      ),
    }));
  };

  const moveColumn = (columnId: string, direction: "up" | "down") => {
    const columns = [...localSettings.columns].sort(
      (a, b) => a.order - b.order,
    );
    const currentIndex = columns.findIndex((col) => col.id === columnId);

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === columns.length - 1)
    ) {
      return; // Can't move further
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Swap the columns
    [columns[currentIndex], columns[newIndex]] = [
      columns[newIndex],
      columns[currentIndex],
    ];

    // Update order values
    const updatedColumns = columns.map((col, index) => ({
      ...col,
      order: index + 1,
    }));

    setLocalSettings((prev) => ({
      ...prev,
      columns: updatedColumns,
    }));
  };

  const handleReset = () => {
    setLocalSettings(defaultTradingTableSettings);
    toast.success("Settings reset to default");
  };

  const handleSave = () => {
    onSave(localSettings);
    toast.success("Table settings saved");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  const sortedColumns = localSettings.columns.sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Table Settings</DialogTitle>
          <DialogDescription>
            Customize column visibility, order, and appearance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Market Links Column</Label>
                  <p className="text-sm text-muted-foreground">
                    Display the market links column in the table
                  </p>
                </div>
                <Switch
                  checked={localSettings.showMarketLinks}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      showMarketLinks: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Market Icons</Label>
                  <p className="text-sm text-muted-foreground">
                    Show clickable market icons in the market links column
                  </p>
                </div>
                <Switch
                  checked={localSettings.showMarketIcons}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      showMarketIcons: checked,
                    }))
                  }
                  disabled={!localSettings.showMarketLinks}
                />
              </div>
            </CardContent>
          </Card>

          {/* Column Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Column Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use arrows to reorder, toggle visibility, and adjust column
                widths
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedColumns.map((column, index) => (
                  <div
                    key={column.id}
                    className="border rounded-lg p-4 bg-background"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveColumn(column.id, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveColumn(column.id, "down")}
                          disabled={index === sortedColumns.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between flex-1">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={column.visible}
                            onCheckedChange={(checked) =>
                              handleColumnVisibilityChange(column.id, checked)
                            }
                          />
                          <div className="flex items-center gap-2">
                            {column.visible ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{column.label}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Width:</Label>
                            <div className="w-24">
                              <Slider
                                value={[column.width || 120]}
                                onValueChange={([value]) =>
                                  handleColumnWidthChange(column.id, value)
                                }
                                max={400}
                                min={80}
                                step={10}
                                disabled={!column.visible}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                              {column.width}px
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableSettingsModal;
