"use client";

import { useState, useEffect } from "react";
import { SystemHealthMetrics, getSystemHealthMetrics, testDatabaseConnection } from "@/actions/system-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge/Badge";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Server, 
  Activity, 
  Users, 
  Clock, 
  MemoryStick, 
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  HardDrive
} from "lucide-react";
import { toast } from "sonner";

interface SystemHealthDashboardProps {
  initialData: SystemHealthMetrics;
}

export function SystemHealthDashboard({ initialData }: SystemHealthDashboardProps) {
  const [metrics, setMetrics] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Auto-refresh every 60 seconds to reduce performance impact
    const interval = setInterval(() => {
      refreshMetrics();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const refreshMetrics = async () => {
    setLoading(true);
    try {
      const newMetrics = await getSystemHealthMetrics();
      setMetrics(newMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing metrics:", error);
      toast.error("Gagal memperbarui metrics");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await testDatabaseConnection();
      if (result.success) {
        toast.success(`Database connection OK (${result.responseTime}ms)`);
      } else {
        toast.error(`Database connection failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("Gagal test koneksi database");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="light" color="success">Healthy</Badge>;
      case "warning":
        return <Badge variant="light" color="warning">Warning</Badge>;
      case "error":
        return <Badge variant="light" color="error">Error</Badge>;
      default:
        return <Badge variant="light" color="light">Unknown</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    return `${bytes} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Overview</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Test DB
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            {getStatusIcon(metrics.database.status)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getStatusBadge(metrics.database.status)}
              <div className="text-xs text-muted-foreground">
                Response: {metrics.database.connectionTime}ms
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Application</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="light" color="info">
                {metrics.application.environment}
              </Badge>
              <div className="text-xs text-muted-foreground">
                Node {metrics.application.nodeVersion}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUptime(metrics.application.uptime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.application.memoryUsage.percentage}%
              </div>
              <Progress value={metrics.application.memoryUsage.percentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {formatBytes(metrics.application.memoryUsage.used)} / {formatBytes(metrics.application.memoryUsage.total)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Tables</div>
              <div className="text-2xl font-bold">{metrics.database.totalTables}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Total Records</div>
              <div className="text-2xl font-bold">{metrics.database.totalRecords.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Connection Time</div>
              <div className="text-2xl font-bold">{metrics.database.connectionTime}ms</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Application Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                Users
              </div>
              <div className="text-xl font-bold">{metrics.statistics.totalUsers}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Activity className="h-4 w-4" />
                Activities
              </div>
              <div className="text-xl font-bold">{metrics.statistics.totalActivities.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Today</div>
              <div className="text-xl font-bold">{metrics.statistics.todayActivities}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Whitelist</div>
              <div className="text-xl font-bold">{metrics.statistics.totalEmailWhitelist}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                Inventaris
              </div>
              <div className="text-xl font-bold">{metrics.statistics.totalInventaris}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Donatur</div>
              <div className="text-xl font-bold">{metrics.statistics.totalDonatur}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Avg Response Time</div>
              <div className="text-2xl font-bold">{metrics.performance.avgResponseTime}ms</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Error Rate</div>
              <div className="text-2xl font-bold">{metrics.performance.errorRate}%</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Requests/Min</div>
              <div className="text-2xl font-bold">{metrics.performance.requestsPerMinute}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}