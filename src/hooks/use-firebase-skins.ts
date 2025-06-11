import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Skin {
  id: string;
  name: string;
  wear: string;
  price: number;
  priceFormatted: string;
  change: number;
  changeFormatted: string;
  volume: string;
  trend: "up" | "down" | "neutral";
  statTrak: boolean;
  rarity:
    | "Contraband"
    | "Covert"
    | "Classified"
    | "Restricted"
    | "Mil-Spec"
    | "Industrial Grade"
    | "Consumer Grade";
  collection: string;
  weaponType:
    | "rifle"
    | "pistol"
    | "smg"
    | "sniper"
    | "knife"
    | "gloves"
    | "other";
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkinsFilters {
  search?: string;
  weaponType?: string;
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  statTrak?: boolean;
}

// Hook to fetch all skins with optional filtering
export const useFirebaseSkins = (
  filters?: SkinsFilters,
  pageSize: number = 50,
) => {
  return useQuery({
    queryKey: ["skins", filters, pageSize],
    queryFn: async () => {
      let q = query(collection(db, "skins"));

      // Apply filters
      if (filters?.weaponType) {
        q = query(q, where("weaponType", "==", filters.weaponType));
      }
      if (filters?.rarity) {
        q = query(q, where("rarity", "==", filters.rarity));
      }
      if (filters?.statTrak !== undefined) {
        q = query(q, where("statTrak", "==", filters.statTrak));
      }
      if (filters?.minPrice) {
        q = query(q, where("price", ">=", filters.minPrice));
      }
      if (filters?.maxPrice) {
        q = query(q, where("price", "<=", filters.maxPrice));
      }

      // Order by price descending and limit
      q = query(q, orderBy("price", "desc"), limit(pageSize));

      const querySnapshot = await getDocs(q);
      const skins: Skin[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        skins.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Skin);
      });

      // Apply search filter on the client side (for simplicity)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return skins.filter((skin) =>
          skin.name.toLowerCase().includes(searchLower),
        );
      }

      return skins;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get skins statistics
export const useSkinsStats = () => {
  return useQuery({
    queryKey: ["skins-stats"],
    queryFn: async () => {
      const skinsSnapshot = await getDocs(collection(db, "skins"));

      let totalSkins = 0;
      let totalValue = 0;
      let totalVolume = 0;
      let priceChanges: number[] = [];

      skinsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalSkins++;
        totalValue += data.price || 0;
        totalVolume += parseInt(data.volume?.replace(/,/g, "") || "0");
        if (data.change) {
          priceChanges.push(data.change);
        }
      });

      const avgPrice = totalSkins > 0 ? totalValue / totalSkins : 0;
      const avgChange =
        priceChanges.length > 0
          ? priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length
          : 0;

      return {
        totalSkins,
        avgPrice,
        avgChange,
        totalVolume,
        formattedAvgPrice: `$${avgPrice.toFixed(2)}`,
        formattedAvgChange: `${avgChange > 0 ? "+" : ""}${avgChange.toFixed(1)}%`,
        formattedTotalVolume: `$${(totalVolume / 1000000).toFixed(1)}M`,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to add a new skin
export const useAddSkin = () => {
  const queryClient = useQueryClient();

  const addSkin = async (
    skinData: Omit<Skin, "id" | "createdAt" | "updatedAt">,
  ) => {
    const now = new Date();
    const skinDoc = doc(collection(db, "skins"));

    await setDoc(skinDoc, {
      ...skinData,
      createdAt: now,
      updatedAt: now,
    });

    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ["skins"] });
    queryClient.invalidateQueries({ queryKey: ["skins-stats"] });

    return skinDoc.id;
  };

  return { addSkin };
};

// Hook to update a skin
export const useUpdateSkin = () => {
  const queryClient = useQueryClient();

  const updateSkin = async (
    skinId: string,
    updates: Partial<Omit<Skin, "id" | "createdAt">>,
  ) => {
    const skinRef = doc(db, "skins", skinId);

    await updateDoc(skinRef, {
      ...updates,
      updatedAt: new Date(),
    });

    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ["skins"] });
    queryClient.invalidateQueries({ queryKey: ["skins-stats"] });
  };

  return { updateSkin };
};

// Hook to delete a skin
export const useDeleteSkin = () => {
  const queryClient = useQueryClient();

  const deleteSkin = async (skinId: string) => {
    const skinRef = doc(db, "skins", skinId);
    await deleteDoc(skinRef);

    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ["skins"] });
    queryClient.invalidateQueries({ queryKey: ["skins-stats"] });
  };

  return { deleteSkin };
};

// Hook for popular skins (trending, most traded)
export const usePopularSkins = (limit: number = 10) => {
  return useQuery({
    queryKey: ["popular-skins", limit],
    queryFn: async () => {
      // Get skins ordered by volume (most traded)
      const q = query(
        collection(db, "skins"),
        orderBy("volume", "desc"),
        orderBy("price", "desc"),
        limit(limit),
      );

      const querySnapshot = await getDocs(q);
      const skins: Skin[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        skins.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Skin);
      });

      return skins;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
