export interface ColumnSettings {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  width?: number;
}

export interface TradingTableSettings {
  columns: ColumnSettings[];
  showMarketLinks: boolean;
  showMarketIcons: boolean;
}

export const defaultTradingColumns: ColumnSettings[] = [
  { id: "itemName", label: "Item Name", visible: true, order: 1, width: 300 },
  { id: "buyPrice", label: "Buy Price", visible: true, order: 2, width: 120 },
  { id: "buyDate", label: "Buy Date", visible: true, order: 3, width: 120 },
  { id: "market", label: "Market", visible: true, order: 4, width: 140 },
  { id: "status", label: "Status", visible: true, order: 5, width: 120 },
  { id: "sellInfo", label: "Sell Info", visible: true, order: 6, width: 150 },
  { id: "profit", label: "Profit", visible: true, order: 7, width: 150 },
  {
    id: "stickersCharm",
    label: "Stickers & Charm",
    visible: true,
    order: 8,
    width: 120,
  },
  {
    id: "marketLinks",
    label: "Market Links",
    visible: true,
    order: 9,
    width: 120,
  },
];

export const defaultTradingTableSettings: TradingTableSettings = {
  columns: defaultTradingColumns,
  showMarketLinks: true,
  showMarketIcons: true,
};

// Local storage helpers
export const saveSettings = (settings: TradingTableSettings) => {
  localStorage.setItem("tradingTableSettings", JSON.stringify(settings));
};

export const loadSettings = (): TradingTableSettings => {
  const saved = localStorage.getItem("tradingTableSettings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Filter out assetId and itemImage columns if they exist in saved settings
      const filteredColumns = parsed.columns.filter(
        (col: ColumnSettings) => col.id !== "assetId" && col.id !== "itemImage",
      );

      // If we filtered out columns, save the clean settings back to localStorage
      if (filteredColumns.length !== parsed.columns.length) {
        const cleanSettings = { ...parsed, columns: filteredColumns };
        localStorage.setItem(
          "tradingTableSettings",
          JSON.stringify(cleanSettings),
        );
        return cleanSettings;
      }

      return { ...parsed, columns: filteredColumns };
    } catch {
      return defaultTradingTableSettings;
    }
  }
  return defaultTradingTableSettings;
};

export const resetSettings = (): TradingTableSettings => {
  localStorage.removeItem("tradingTableSettings");
  return defaultTradingTableSettings;
};
