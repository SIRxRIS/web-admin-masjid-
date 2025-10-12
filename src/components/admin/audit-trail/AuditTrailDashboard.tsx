"use client";

import { useState, useEffect } from "react";
import { 
  AuditLogData, 
  getAuditLogs, 
  getAuditLogStats,
  deleteOldAuditLogs,
  getAuditedTables,
  AuditLogFilters
} from "@/actions/audit-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/badge/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Shield, 
  Search, 
  Filter,
  RefreshCw,
  Trash2,
  Eye,
  Calendar,
  User,
  Database,
  Activity,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface AuditTrailDashboardProps {
  initialLogs: AuditLogData[];
  stats: {
    totalLogs: number;
    todayLogs: number;
    weekLogs: number;
    monthLogs: number;
    actionBreakdown: { action: string; count: number }[];
    tableBreakdown: { tableName: string; count: number }[];
  };
}

export function AuditTrailDashboard({ initialLogs, stats: initialStats }: AuditTrailDashboardProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [stats, setStats] = useState({
    totalLogs: initialStats?.totalLogs || 0,
    todayLogs: initialStats?.todayLogs || 0,
    weekLogs: initialStats?.weekLogs || 0,
    monthLogs: initialStats?.monthLogs || 0,
    actionBreakdown: initialStats?.actionBreakdown || [],
    tableBreakdown: initialStats?.tableBreakdown || [],
  });
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const tableList = await getAuditedTables();
      setTables(tableList);
    } catch (error) {
      console.error("Error loading tables:", error);
    }
  };

  const loadLogs = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const currentFilters: AuditLogFilters = {
        search: search || undefined,
        action: actionFilter || undefined,
        tableName: tableFilter || undefined,
      };

      const newLogs = await getAuditLogs(currentPage, 50, currentFilters);
      
      if (resetPage) {
        setLogs(newLogs);
        setPage(1);
      } else {
        setLogs(prev => [...prev, ...newLogs]);
      }
      
      setHasMore(newLogs.length === 50);
      if (resetPage) setPage(2);
      else setPage(prev => prev + 1);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Gagal memuat audit logs");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const newStats = await getAuditLogStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSearch = () => {
    loadLogs(true);
  };

  const handleFilterChange = () => {
    loadLogs(true);
  };

  const handleCleanup = async () => {
    if (!confirm("Hapus audit logs yang lebih dari 90 hari? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    try {
      const result = await deleteOldAuditLogs(90);
      if (result.success) {
        toast.success(`Berhasil menghapus ${result.deletedCount} audit logs lama`);
        loadLogs(true);
        loadStats();
      } else {
        toast.error("Gagal menghapus audit logs lama");
      }
    } catch (error) {
      console.error("Error cleaning up logs:", error);
      toast.error("Gagal menghapus audit logs lama");
    }
  };

  const handleRefresh = () => {
    loadLogs(true);
    loadStats();
  };

  const getActionBadge = (action: string): "success" | "info" | "error" | "light" => {
    const colors = {
      CREATE: "success" as const,
      UPDATE: "info" as const,
      DELETE: "error" as const,
    };
    return colors[action as keyof typeof colors] || "light";
  };

  const formatJsonValue = (value: any) => {
    if (!value) return "N/A";
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const showLogDetail = (log: AuditLogData) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalLogs || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Logs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.todayLogs || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Logs</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.weekLogs || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Logs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.monthLogs || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.actionBreakdown.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Actions by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.actionBreakdown.map((stat) => (
                <div key={stat.action} className="flex items-center justify-between">
                  <Badge variant="light" color={getActionBadge(stat.action)}>
                    {stat.action}
                  </Badge>
                  <span className="font-medium">{stat.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Most Active Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.tableBreakdown.map((stat) => (
                <div key={stat.tableName} className="flex items-center justify-between">
                  <Badge variant="light" color="info">
                    {stat.tableName}
                  </Badge>
                  <span className="font-medium">{stat.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Audit Logs</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanup}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Cleanup Old Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={(value) => {
          setActionFilter(value);
          setTimeout(handleFilterChange, 100);
        }}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">CREATE</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tableFilter} onValueChange={(value) => {
          setTableFilter(value);
          setTimeout(handleFilterChange, 100);
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            {tables.map((table) => (
              <SelectItem key={table} value={table}>
                {table}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {log.userEmail || "System"}
                        </div>
                        {log.userId && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {log.userId.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="light" color={getActionBadge(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.tableName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.recordId ? `${log.recordId.slice(0, 8)}...` : "N/A"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.description || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showLogDetail(log)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadLogs(false)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Detail</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <div className="text-sm font-mono">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <div>
                    <Badge variant="light" color={getActionBadge(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">User Email</label>
                  <div className="text-sm">{selectedLog.userEmail || "N/A"}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Table</label>
                  <div className="text-sm font-medium">{selectedLog.tableName}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Record ID</label>
                  <div className="text-sm font-mono">{selectedLog.recordId || "N/A"}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <div className="text-sm font-mono">{selectedLog.ipAddress || "N/A"}</div>
                </div>
              </div>
              
              {selectedLog.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <div className="text-sm">{selectedLog.description}</div>
                </div>
              )}

              {selectedLog.oldValues && (
                <div>
                  <label className="text-sm font-medium">Old Values</label>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {formatJsonValue(selectedLog.oldValues)}
                  </pre>
                </div>
              )}

              {selectedLog.newValues && (
                <div>
                  <label className="text-sm font-medium">New Values</label>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {formatJsonValue(selectedLog.newValues)}
                  </pre>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <div className="text-xs text-muted-foreground break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}