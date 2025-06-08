import { useState, useEffect } from "react";
import { csgoApiService, EnhancedItemData } from "@/lib/csgo-api";

interface UseCSGOApiResult {
  itemsMap: Map<string, EnhancedItemData> | null;
  loading: boolean;
  error: string | null;
  getItemData: (itemName: string) => EnhancedItemData | null;
}

export function useCSGOApi(): UseCSGOApiResult {
  const [itemsMap, setItemsMap] = useState<Map<
    string,
    EnhancedItemData
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const items = await csgoApiService.getAllItems();

        if (isMounted) {
          setItemsMap(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load CS:GO API data",
          );
          console.error("Error loading CS:GO API data:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const getItemData = (itemName: string): EnhancedItemData | null => {
    if (!itemsMap) return null;

    // Since we can't use async in this context, we'll handle it synchronously
    // and the mock data fallback will be handled in the component
    const itemData = csgoApiService.findItemDataSync(itemName, itemsMap);
    return itemData;
  };

  return {
    itemsMap,
    loading,
    error,
    getItemData,
  };
}
