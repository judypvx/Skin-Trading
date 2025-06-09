import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6">CS:GO Trading Dashboard</h1>

      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Dashboard Status</CardTitle>
          <CardDescription className="text-gray-300">
            Testing component loading step by step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>✅ React is working</p>
            <p>✅ Tailwind CSS is working</p>
            <p>✅ Card component loaded</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button className="mr-4">Test Button</Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Total Items</h3>
              <p className="text-2xl font-bold text-green-400">16</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Total Profit</h3>
              <p className="text-2xl font-bold text-green-400">$1,234.56</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Active Markets</h3>
              <p className="text-2xl font-bold text-blue-400">3</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <div className="bg-gray-800 p-4 rounded-lg">
          <ul className="space-y-2">
            <li>✅ Basic components working</li>
            <li>🔄 Add navigation</li>
            <li>🔄 Add trading table</li>
            <li>🔄 Add charts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
