"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSystemHealthWarning } from "./notifications";

export interface SystemHealthMetrics {
  database: {
    status: "healthy" | "warning" | "error";
    connectionTime: number;
    totalTables: number;
    totalRecords: number;
  };
  application: {
    uptime: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    nodeVersion: string;
    environment: string;
  };
  statistics: {
    totalUsers: number;
    totalActivities: number;
    todayActivities: number;
    totalEmailWhitelist: number;
    totalInventaris: number;
    totalDonatur: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
  };
}

export async function getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
  try {
    const supabase = supabaseAdmin;
    const startTime = Date.now();
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from("profile")
      .select("id")
      .limit(1);
    
    const dbConnectionTime = Date.now() - startTime;

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    // Get database statistics with optimized queries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use estimated counts for better performance on large tables
    const [
      { count: totalUsers },
      { count: totalActivities },
      { count: todayActivities },
      { count: totalEmailWhitelist },
      { count: totalInventaris },
      { count: totalDonatur },
    ] = await Promise.all([
      supabase.from("profile").select("id", { count: "estimated", head: true }),
      supabase.from("UserActivity").select("id", { count: "estimated", head: true }),
      supabase.from("UserActivity").select("id", { count: "exact", head: true })
        .gte("createdAt", today.toISOString()),
      supabase.from("EmailWhitelist").select("id", { count: "estimated", head: true }),
      supabase.from("Inventaris").select("id", { count: "estimated", head: true }),
      supabase.from("Donatur").select("id", { count: "estimated", head: true }),
    ]);

    // Calculate total records across main tables
    const totalRecords = (totalUsers || 0) + (totalActivities || 0) + (totalEmailWhitelist || 0) + (totalInventaris || 0) + (totalDonatur || 0);

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // Get uptime
    const uptime = process.uptime();

    // Determine database status
    let dbStatus: "healthy" | "warning" | "error" = "healthy";
    if (dbConnectionTime > 1000) {
      dbStatus = "warning";
    }
    if (dbConnectionTime > 5000) {
      dbStatus = "error";
    }

    return {
      database: {
        status: dbStatus,
        connectionTime: dbConnectionTime,
        totalTables: 15, // Approximate number of tables
        totalRecords,
      },
      application: {
        uptime,
        memoryUsage: {
          used: Math.round(usedMemory / 1024 / 1024), // Convert to MB
          total: Math.round(totalMemory / 1024 / 1024), // Convert to MB
          percentage: Math.round(memoryPercentage),
        },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
      statistics: {
        totalUsers: totalUsers || 0,
        totalActivities: totalActivities || 0,
        todayActivities: todayActivities || 0,
        totalEmailWhitelist: totalEmailWhitelist || 0,
        totalInventaris: totalInventaris || 0,
        totalDonatur: totalDonatur || 0,
      },
      performance: {
        avgResponseTime: dbConnectionTime, // Using DB connection time as proxy
        errorRate: 0, // Would need proper error tracking
        requestsPerMinute: Math.round((todayActivities || 0) / 24 / 60) || 0, // Rough estimate
      },
    };
  } catch (error) {
    console.error("Error fetching system health metrics:", error);
    
    // Return error state
    return {
      database: {
        status: "error",
        connectionTime: 0,
        totalTables: 0,
        totalRecords: 0,
      },
      application: {
        uptime: process.uptime(),
        memoryUsage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
      statistics: {
        totalUsers: 0,
        totalActivities: 0,
        todayActivities: 0,
        totalEmailWhitelist: 0,
        totalInventaris: 0,
        totalDonatur: 0,
      },
      performance: {
        avgResponseTime: 0,
        errorRate: 100,
        requestsPerMinute: 0,
      },
    };
  }
}

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  responseTime: number;
  error?: string;
}> {
  try {
    const supabase = supabaseAdmin;
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from("profile")
      .select("id")
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        success: false,
        responseTime,
        error: error.message,
      };
    }
    
    return {
      success: true,
      responseTime,
    };
  } catch (error) {
    return {
      success: false,
      responseTime: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSystemInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    memoryUsage: process.memoryUsage(),
  };
}

export async function checkSystemHealthAndNotify(): Promise<void> {
  try {
    const metrics = await getSystemHealthMetrics();
    
    // Check for various health issues
    const issues: string[] = [];
    
    // Database health check
    if (metrics.database.status === "error") {
      issues.push("Database connection failed");
    } else if (metrics.database.status === "warning") {
      issues.push(`Database response time is slow (${metrics.database.connectionTime}ms)`);
    }
    
    // Memory usage check
    if (metrics.application.memoryUsage.percentage > 90) {
      issues.push(`High memory usage (${metrics.application.memoryUsage.percentage}%)`);
    }
    
    // Performance check
    if (metrics.performance.errorRate > 10) {
      issues.push(`High error rate (${metrics.performance.errorRate}%)`);
    }
    
    // If there are issues, send notification to admin
    if (issues.length > 0) {
      const issueDescription = issues.join(", ");
      await createSystemHealthWarning(
        issueDescription,
        metrics.database.status === "error" ? "critical" : "medium"
      );
    }
  } catch (error) {
    console.error("Error checking system health:", error);
    // Send critical notification if health check itself fails
    try {
      await createSystemHealthWarning(
        "System health monitoring failed",
        "critical"
      );
    } catch (notifError) {
      console.error("Failed to send system health notification:", notifError);
    }
  }
}