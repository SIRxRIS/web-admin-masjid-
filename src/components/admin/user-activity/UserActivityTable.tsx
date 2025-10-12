"use client";

import { useState, useEffect } from "react";
import { UserActivityData, getUserActivities, getActivityStats, deleteOldActivities } from "@/actions/user-activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/badge/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Activity, Users, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface UserActivityTableProps {
  initialData: {
    data: UserActivityData[];
    total: number;
    totalPages: number;
  };
}

export function UserActivityTable({ initialData }: UserActivityTableProps) {
  const [activities, setActivities] = useState(initialData.data);
  const [total, setTotal] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    uniqueUsers: 0,
    topActions: [] as { action: string; count: number }[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadActivities();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [search, actionFilter, currentPage]);

  const loadStats = async () => {
    try {
      const statsData = await getActivityStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      const result = await getUserActivities(
        currentPage,
        20,
        search || undefined,
        actionFilter || undefined
      );
      setActivities(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Gagal memuat data aktivitas");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOldActivities = async () => {
    if (!confirm("Hapus aktivitas yang lebih dari 90 hari? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    try {
      const result = await deleteOldActivities(90);
      if (result.success) {
        toast.success(`Berhasil menghapus ${result.deletedCount} aktivitas lama`);
        loadActivities();
        loadStats();
      } else {
        toast.error("Gagal menghapus aktivitas lama");
      }
    } catch (error) {
      console.error("Error deleting old activities:", error);
      toast.error("Gagal menghapus aktivitas lama");
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "login":
        return "success";
      case "logout":
        return "error";
      case "create":
      case "add":
        return "info";
      case "update":
      case "edit":
        return "warning";
      case "delete":
        return "error";
      default:
        return "light";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aktivitas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivitas Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayActivities.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Action</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topActions[0]?.action || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.topActions[0]?.count || 0} kali
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari berdasarkan nama, aksi, atau IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Action</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
            <SelectItem value="LOGOUT">Logout</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handleDeleteOldActivities}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Hapus Data Lama
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Pengguna
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Action
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  IP Address
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Waktu
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center text-muted-foreground">
                    Tidak ada data aktivitas
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="border-b">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{activity.profile.nama}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.profile.jabatan} • {activity.profile.role}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="light" color={getActionBadgeColor(activity.action)}>
                        {activity.action}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {activity.ipAddress || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground max-w-xs">
                      {activity.details ? (
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Menampilkan {activities.length} dari {total} aktivitas
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}