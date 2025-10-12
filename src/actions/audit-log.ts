"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { headers } from "next/headers";

export interface AuditLogData {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  tableName: string;
  recordId: string | null;
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  description: string | null;
}

export interface CreateAuditLogParams {
  userId?: string;
  userEmail?: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  tableName: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  description?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  tableName?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// Create audit log entry
export async function createAuditLog(params: CreateAuditLogParams): Promise<{ success: boolean; error?: string }> {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const supabase = supabaseAdmin;
    
    const auditLogData = {
      userId: params.userId || null,
      userEmail: params.userEmail || null,
      action: params.action,
      tableName: params.tableName,
      recordId: params.recordId || null,
      oldValues: params.oldValues || null,
      newValues: params.newValues || null,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      description: params.description || null,
    };

    const { error } = await supabase
      .from("audit_log")
      .insert(auditLogData);

    if (error) {
      console.error("Error creating audit log:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating audit log:", error);
    return { success: false, error: "Failed to create audit log" };
  }
}

// Get audit logs with filters
export async function getAuditLogs(
  page: number = 1,
  limit: number = 50,
  filters: AuditLogFilters = {}
): Promise<AuditLogData[]> {
  try {
    const supabase = supabaseAdmin;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("audit_log")
      .select("*", { count: "exact" })
      .order("timestamp", { ascending: false });

    // Apply filters
    if (filters.userId) {
      query = query.eq("userId", filters.userId);
    }
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    if (filters.tableName) {
      query = query.eq("tableName", filters.tableName);
    }
    if (filters.startDate) {
      query = query.gte("timestamp", filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte("timestamp", filters.endDate.toISOString());
    }
    if (filters.search) {
      query = query.or(`description.ilike.%${filters.search}%,userEmail.ilike.%${filters.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }

    return logs || [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}

// Get audit log by ID
export async function getAuditLogById(id: string): Promise<AuditLogData | null> {
  try {
    const supabase = supabaseAdmin;
    
    const { data: log, error } = await supabase
      .from("audit_log")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching audit log:", error);
      return null;
    }

    return log;
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return null;
  }
}

// Get audit log statistics
export async function getAuditLogStats(): Promise<{
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
  actionBreakdown: { action: string; count: number }[];
  tableBreakdown: { tableName: string; count: number }[];
}> {
  try {
    const supabase = supabaseAdmin;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total count
    const [totalResult, todayResult, weekResult, monthResult] = await Promise.all([
      supabase.from("audit_log").select("id", { count: "estimated", head: true }),
      supabase.from("audit_log").select("id", { count: "exact", head: true })
        .gte("timestamp", today.toISOString()),
      supabase.from("audit_log").select("id", { count: "exact", head: true })
        .gte("timestamp", weekAgo.toISOString()),
      supabase.from("audit_log")
        .select("id", { count: "exact", head: true })
        .gte("timestamp", monthAgo.toISOString()),
    ]);

    // Get action breakdown
    const { data: actionData } = await supabase
      .from("audit_log")
      .select("action")
      .gte("timestamp", monthAgo.toISOString());

    // Get table breakdown
    const { data: tableData } = await supabase
      .from("audit_log")
      .select("tableName")
      .gte("timestamp", monthAgo.toISOString());

    // Calculate action breakdown
    const actionBreakdown = actionData?.reduce((acc: any[], item) => {
      if (!item.action) return acc;
      const existing = acc.find(a => a.action === item.action);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ action: item.action, count: 1 });
      }
      return acc;
    }, []) || [];

    // Calculate table breakdown
    const tableBreakdown = tableData?.reduce((acc: any[], item) => {
      if (!item.tableName) return acc;
      const existing = acc.find(t => t.tableName === item.tableName);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ tableName: item.tableName, count: 1 });
      }
      return acc;
    }, []) || [];

    return {
      totalLogs: totalResult.count || 0,
      todayLogs: todayResult.count || 0,
      weekLogs: weekResult.count || 0,
      monthLogs: monthResult.count || 0,
      actionBreakdown,
      tableBreakdown,
    };
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    return {
      totalLogs: 0,
      todayLogs: 0,
      weekLogs: 0,
      monthLogs: 0,
      actionBreakdown: [],
      tableBreakdown: [],
    };
  }
}

// Delete old audit logs (cleanup)
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const supabase = supabaseAdmin;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data: logsToDelete, error: selectError } = await supabase
      .from("audit_log")
      .select("id")
      .lt("timestamp", cutoffDate.toISOString());

    if (selectError) {
      console.error("Error selecting old audit logs:", selectError);
      return { success: false, deletedCount: 0, error: selectError.message };
    }

    const deletedCount = logsToDelete?.length || 0;

    if (deletedCount > 0) {
      const { error: deleteError } = await supabase
        .from("audit_log")
        .delete()
        .lt("timestamp", cutoffDate.toISOString());

      if (deleteError) {
        console.error("Error deleting old audit logs:", deleteError);
        return { success: false, deletedCount: 0, error: deleteError.message };
      }
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error cleaning up old audit logs:", error);
    return { success: false, deletedCount: 0, error: "Failed to cleanup old audit logs" };
  }
}

// Alias for cleanupOldAuditLogs to match component expectations
export async function deleteOldAuditLogs(daysToKeep: number = 90): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  return await cleanupOldAuditLogs(daysToKeep);
}

// Get list of tables that have audit logs
export async function getAuditedTables(): Promise<string[]> {
  try {
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from("audit_log")
      .select("tableName")
      .not("tableName", "is", null);

    if (error) {
      console.error("Error fetching audited tables:", error);
      return [];
    }

    // Get unique table names
    const uniqueTables = [...new Set(data?.map(item => item.tableName) || [])];
    return uniqueTables.sort();
  } catch (error) {
    console.error("Error fetching audited tables:", error);
    return [];
  }
}

// Helper function to log common actions
export async function logUserAction(
  userId: string,
  userEmail: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  tableName: string,
  recordId?: string,
  description?: string,
  oldValues?: any,
  newValues?: any
): Promise<void> {
  await createAuditLog({
    userId,
    userEmail,
    action,
    tableName,
    recordId,
    description,
    oldValues,
    newValues,
  });
}