import NavigationTabs from "@/components/trading/NavigationTabs";
import CS2SkinsTable from "@/components/trading/CS2SkinsTable";

const Explorer = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationTabs />
      <CS2SkinsTable />
    </div>
  );
};

export default Explorer;
