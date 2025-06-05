import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowUpDown,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  SteamAccount,
  formatCurrency,
  formatDate,
  getStatusBadgeVariant,
} from "@/lib/account-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface AccountsTableProps {
  accounts: SteamAccount[];
  onUpdateAccount: (id: string, updates: Partial<SteamAccount>) => void;
}

type SortField = keyof SteamAccount;
type SortDirection = "asc" | "desc";

const AccountsTable = ({ accounts, onUpdateAccount }: AccountsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("lastActivity");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [show2FA, setShow2FA] = useState<{ [key: string]: boolean }>({});

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts.filter((account) => {
      const matchesSearch =
        account.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.profileUrl.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || account.status === statusFilter;

      let matchesState = true;
      if (stateFilter === "active") {
        matchesState = account.isActive && !account.isPaused;
      } else if (stateFilter === "paused") {
        matchesState = account.isPaused;
      } else if (stateFilter === "problematic") {
        matchesState = account.status !== "OK";
      }

      return matchesSearch && matchesStatus && matchesState;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    accounts,
    searchTerm,
    statusFilter,
    stateFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAccount = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts((prev) => [...prev, accountId]);
    } else {
      setSelectedAccounts((prev) => prev.filter((id) => id !== accountId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccounts(filteredAndSortedAccounts.map((acc) => acc.id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleBulkAction = (action: "activate" | "pause" | "manual") => {
    selectedAccounts.forEach((accountId) => {
      const updates: Partial<SteamAccount> = {};

      switch (action) {
        case "activate":
          updates.isActive = true;
          updates.isPaused = false;
          break;
        case "pause":
          updates.isPaused = true;
          break;
        case "manual":
          updates.isActive = false;
          updates.isPaused = false;
          break;
      }

      onUpdateAccount(accountId, updates);
    });

    toast.success(
      `${action === "activate" ? "Activated" : action === "pause" ? "Paused" : "Set to manual"} ${selectedAccounts.length} accounts`,
    );
    setSelectedAccounts([]);
  };

  const toggle2FA = (accountId: string) => {
    setShow2FA((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const getStatusIcon = (status: SteamAccount["status"]) => {
    switch (status) {
      case "OK":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "Error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "Needs Check":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStateDisplay = (account: SteamAccount) => {
    if (account.isPaused) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Pause className="h-3 w-3" />
          Paused
        </Badge>
      );
    }
    if (account.isActive) {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        >
          <Play className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        Manual
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Steam Accounts</span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredAndSortedAccounts.length} of {accounts.length} accounts
            </span>
          </CardTitle>

          {selectedAccounts.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("activate")}
                className="gap-1"
              >
                <Play className="h-3 w-3" />
                Activate ({selectedAccounts.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("pause")}
                className="gap-1"
              >
                <Pause className="h-3 w-3" />
                Pause ({selectedAccounts.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("manual")}
                className="gap-1"
              >
                Manual ({selectedAccounts.length})
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search accounts or profile URLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OK">OK</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
                <SelectItem value="Needs Check">Needs Check</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="paused">Paused Only</SelectItem>
                <SelectItem value="problematic">Problematic Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedAccounts.length ===
                        filteredAndSortedAccounts.length &&
                      filteredAndSortedAccounts.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("nickname")}
                >
                  <div className="flex items-center gap-1">
                    Account
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Proxy</TableHead>
                <TableHead>2FA Code</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("tradeConfirmations")}
                >
                  <div className="flex items-center gap-1">
                    Trade Confirms
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("steamBalance")}
                >
                  <div className="flex items-center gap-1">
                    Steam Balance
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("inventoryValue")}
                >
                  <div className="flex items-center gap-1">
                    Inventory Value
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("steamLevel")}
                >
                  <div className="flex items-center gap-1">
                    Level
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>State</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={(checked) =>
                        handleSelectAccount(account.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={account.avatarUrl}
                          alt={account.nickname}
                        />
                        <AvatarFallback>
                          {account.nickname.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{account.nickname}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(account.lastActivity)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {account.proxy}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {show2FA[account.id] ? account.twoFactorCode : "••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggle2FA(account.id)}
                      >
                        {show2FA[account.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {account.tradeConfirmations > 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      >
                        {account.tradeConfirmations}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(account.steamBalance)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(account.inventoryValue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(account.status)}
                      <Badge variant={getStatusBadgeVariant(account.status)}>
                        {account.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {account.steamLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStateDisplay(account)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(account.profileUrl, "_blank")
                          }
                          className="gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(account.profileUrl)
                          }
                        >
                          Copy Profile URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {account.isActive ? (
                          <DropdownMenuItem
                            onClick={() =>
                              onUpdateAccount(account.id, {
                                isPaused: !account.isPaused,
                              })
                            }
                            className="gap-2"
                          >
                            {account.isPaused ? (
                              <>
                                <Play className="h-3 w-3" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause className="h-3 w-3" />
                                Pause
                              </>
                            )}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              onUpdateAccount(account.id, {
                                isActive: true,
                                isPaused: false,
                              })
                            }
                            className="gap-2"
                          >
                            <Play className="h-3 w-3" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        {account.status === "Needs Check" && (
                          <DropdownMenuItem
                            onClick={() =>
                              onUpdateAccount(account.id, { status: "OK" })
                            }
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Mark as OK
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedAccounts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No accounts found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsTable;
