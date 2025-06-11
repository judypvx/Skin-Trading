import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Skin } from "@/hooks/use-firebase-skins";

// Sample data to seed the Firebase database
const sampleSkins: Omit<Skin, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "AK-47 | Redline",
    wear: "Field-Tested",
    price: 45.23,
    priceFormatted: "$45.23",
    change: 2.5,
    changeFormatted: "+2.5%",
    volume: "1,234",
    trend: "up",
    statTrak: false,
    rarity: "Classified",
    collection: "Phoenix Collection",
    weaponType: "rifle",
    imageUrl: "",
  },
  {
    name: "AWP | Dragon Lore",
    wear: "Factory New",
    price: 8234.12,
    priceFormatted: "$8,234.12",
    change: -1.2,
    changeFormatted: "-1.2%",
    volume: "23",
    trend: "down",
    statTrak: false,
    rarity: "Covert",
    collection: "Cobblestone Collection",
    weaponType: "sniper",
    imageUrl: "",
  },
  {
    name: "M4A4 | Howl",
    wear: "Minimal Wear",
    price: 3456.78,
    priceFormatted: "$3,456.78",
    change: 0,
    changeFormatted: "0.0%",
    volume: "45",
    trend: "neutral",
    statTrak: true,
    rarity: "Contraband",
    collection: "Huntsman Collection",
    weaponType: "rifle",
    imageUrl: "",
  },
  {
    name: "Karambit | Fade",
    wear: "Factory New",
    price: 1234.56,
    priceFormatted: "$1,234.56",
    change: 5.7,
    changeFormatted: "+5.7%",
    volume: "67",
    trend: "up",
    statTrak: true,
    rarity: "Covert",
    collection: "Knife",
    weaponType: "knife",
    imageUrl: "",
  },
  {
    name: "Glock-18 | Water Elemental",
    wear: "Field-Tested",
    price: 12.34,
    priceFormatted: "$12.34",
    change: 0.8,
    changeFormatted: "+0.8%",
    volume: "456",
    trend: "up",
    statTrak: false,
    rarity: "Restricted",
    collection: "Chroma Collection",
    weaponType: "pistol",
    imageUrl: "",
  },
  {
    name: "USP-S | Kill Confirmed",
    wear: "Minimal Wear",
    price: 78.9,
    priceFormatted: "$78.90",
    change: -0.5,
    changeFormatted: "-0.5%",
    volume: "234",
    trend: "down",
    statTrak: true,
    rarity: "Covert",
    collection: "Gamma Collection",
    weaponType: "pistol",
    imageUrl: "",
  },
  {
    name: "M4A1-S | Hot Rod",
    wear: "Factory New",
    price: 156.78,
    priceFormatted: "$156.78",
    change: 3.2,
    changeFormatted: "+3.2%",
    volume: "89",
    trend: "up",
    statTrak: false,
    rarity: "Classified",
    collection: "Chroma 2 Collection",
    weaponType: "rifle",
    imageUrl: "",
  },
  {
    name: "MP7 | Skulls",
    wear: "Well-Worn",
    price: 4.56,
    priceFormatted: "$4.56",
    change: 1.1,
    changeFormatted: "+1.1%",
    volume: "678",
    trend: "up",
    statTrak: false,
    rarity: "Mil-Spec",
    collection: "Inferno Collection",
    weaponType: "smg",
    imageUrl: "",
  },
  {
    name: "Sport Gloves | Pandora's Box",
    wear: "Field-Tested",
    price: 2345.67,
    priceFormatted: "$2,345.67",
    change: -2.8,
    changeFormatted: "-2.8%",
    volume: "12",
    trend: "down",
    statTrak: false,
    rarity: "Covert",
    collection: "Glove Case",
    weaponType: "gloves",
    imageUrl: "",
  },
  {
    name: "Butterfly Knife | Tiger Tooth",
    wear: "Factory New",
    price: 987.65,
    priceFormatted: "$987.65",
    change: 4.5,
    changeFormatted: "+4.5%",
    volume: "34",
    trend: "up",
    statTrak: false,
    rarity: "Covert",
    collection: "Knife",
    weaponType: "knife",
    imageUrl: "",
  },
];

// Function to seed the database with sample data
export const seedSkinsDatabase = async () => {
  try {
    console.log("Starting to seed skins database...");

    for (const skin of sampleSkins) {
      const skinDoc = doc(collection(db, "skins"));
      const now = new Date();

      await setDoc(skinDoc, {
        ...skin,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`Added skin: ${skin.name}`);
    }

    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

// Function to clear all skins data (use with caution)
export const clearSkinsDatabase = async () => {
  try {
    console.log(
      "This function should be implemented with proper batch deletion",
    );
    // Implementation would require batch operations for efficiency
    console.log(
      "Please use Firebase console to clear data or implement batch deletion",
    );
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};
