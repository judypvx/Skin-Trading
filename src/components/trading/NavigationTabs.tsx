import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Settings,
  Moon,
  Sun,
  Search,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

// Language context for managing language state across components
import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

const NavigationTabs = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  const tabs = [
    {
      path: "/",
      label: "Trading Dashboard",
      icon: BarChart3,
      description: "Inventory & Profit Tracking",
    },
    {
      path: "/accounts",
      label: "Account Control",
      icon: Users,
      description: "Steam Account Management",
    },
    {
      path: "/explorer",
      label: "Explorer",
      icon: Search,
      description: "Skin Catalog & Market Data",
    },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Skin Trading Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Professional trading and account management
                </p>
              </div>
            </div>

            <nav className="flex items-center space-x-1 ml-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{tab.label}</span>
                      <span className="text-xs opacity-75">
                        {tab.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {language === "en" ? "EN" : "RU"}
              <span className="text-xs text-muted-foreground">
                {language === "en" ? "Switch to Russian" : "Switch to English"}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationTabs;
