import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CS2Skin {
  id: string;
  name_en: string;
  name_ru: string;
  image: string;
  type: string;
  rarity: string;
  category: string;
  weapon: string;
}

// Hook to fetch all CS2 skins from Firestore
export const useCS2Skins = () => {
  return useQuery({
    queryKey: ["cs2-skins"],
    queryFn: async () => {
      try {
        const skinsCollection = collection(db, "skins");
        const q = query(skinsCollection, orderBy("name_en", "asc"));
        const querySnapshot = await getDocs(q);

        const skins: CS2Skin[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          skins.push({
            id: doc.id,
            name_en: data.name_en || "",
            name_ru: data.name_ru || "",
            image: data.image || "",
            type: data.type || "",
            rarity: data.rarity || "",
            category: data.category || "",
            weapon: data.weapon || "",
          });
        });

        return skins;
      } catch (error) {
        console.error("Error fetching CS2 skins:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
