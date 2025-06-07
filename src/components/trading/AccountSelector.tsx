import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { mockSteamAccountsBasic } from "@/lib/trading-data";

interface AccountSelectorProps {
  selectedAccounts?: string[];
  onAccountsChange?: (accounts: string[]) => void;
}

const AccountSelector = ({
  selectedAccounts = [],
  onAccountsChange = () => {},
}: AccountSelectorProps) => {
  const [accountFilters, setAccountFilters] =
    useState<string[]>(selectedAccounts);

  const handleAccountChange = (accountId: string, checked: boolean) => {
    let newAccountFilters;
    if (checked) {
      newAccountFilters = [...accountFilters, accountId];
    } else {
      newAccountFilters = accountFilters.filter((id) => id !== accountId);
    }
    setAccountFilters(newAccountFilters);
    onAccountsChange(newAccountFilters);
  };

  const clearAllAccounts = () => {
    setAccountFilters([]);
    onAccountsChange([]);
  };

  const selectAllAccounts = () => {
    const allAccountIds = mockSteamAccountsBasic
      .filter((account) => account.id !== "all")
      .map((account) => account.id);
    setAccountFilters(allAccountIds);
    onAccountsChange(allAccountIds);
  };

  const getSelectedAccountsText = () => {
    if (accountFilters.length === 0) {
      return "All Accounts";
    }
    if (accountFilters.length === 1) {
      const account = mockSteamAccountsBasic.find(
        (acc) => acc.id === accountFilters[0],
      );
      return account?.nickname || "1 Account";
    }
    return `${accountFilters.length} Accounts`;
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Account Filter</h3>
              <p className="text-xs text-muted-foreground">
                View data for specific trading accounts
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                {getSelectedAccountsText()}
                {accountFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {accountFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Accounts</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Select All / Clear All */}
              <div className="px-2 py-1 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={selectAllAccounts}
                >
                  <Check className="h-3 w-3 mr-2" />
                  Select All Accounts
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-red-600"
                  onClick={clearAllAccounts}
                >
                  Clear All
                </Button>
              </div>

              <DropdownMenuSeparator />

              {/* Account list */}
              {mockSteamAccountsBasic
                .filter((account) => account.id !== "all")
                .map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    className="flex items-center space-x-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={accountFilters.includes(account.id)}
                      onCheckedChange={(checked) =>
                        handleAccountChange(account.id, !!checked)
                      }
                    />
                    <span className="flex-1">{account.nickname}</span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSelector;
