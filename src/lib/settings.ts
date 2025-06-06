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
  { id: "itemImage", label: "Image", visible: true, order: 1, width: 100 },
  { id: "itemName", label: "Item Name", visible: true, order: 2, width: 300 },
  { id: "buyPrice", label: "Buy Price", visible: true, order: 3, width: 120 },
  { id: "buyDate", label: "Buy Date", visible: true, order: 4, width: 120 },
  { id: "market", label: "Market", visible: true, order: 5, width: 140 },
  { id: "assetId", label: "Asset ID", visible: true, order: 6, width: 140 },
  { id: "status", label: "Status", visible: true, order: 7, width: 120 },
  { id: "sellInfo", label: "Sell Info", visible: true, order: 8, width: 150 },
  { id: "profit", label: "Profit", visible: true, order: 9, width: 150 },
  {
    id: "stickersCharm",
    label: "Stickers & Charm",
    visible: true,
    order: 10,
    width: 120,
  },
  {
    id: "marketLinks",
    label: "Market Links",
    visible: true,
    order: 11,
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
      return JSON.parse(saved);
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
