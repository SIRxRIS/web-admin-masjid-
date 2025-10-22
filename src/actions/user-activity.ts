"use server";

import { supabaseAdmin } from "../lib/supabase/admin";
import { createAuditLog } from "./audit-log";
import { getProfileByUserIdAdmin } from "../lib/services/supabase/profile/profile";
import { revalidatePath } from "next/cache";

export interface UserActivityData {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  profile: {
    id: string;
    nama: string;
    jabatan: string;
    role: string;
  };
}

interface UserActivityRaw {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  profile: {
    id: string;
    nama: string;
    jabatan: string;
    role: string;
  };
}

export async function getUserActivityLogs(
  page: number = 1,
  limit: number = 20,
  search?: string,
  action?: string
): Promise<{
  data: UserActivityData[];
  total: number;
  totalPages: number;
}> {
  try {
    const supabase = supabaseAdmin;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from("UserActivity")
      .select(`
        id,
        action,
        details,
        ipAddress,
        userAgent,
        createdAt,
        profile:profile!inner (
          id,
          nama,
          jabatan,
          role
        )
      `, { count: "exact" })
      .order("createdAt", { ascending: false });

    // Add search filter
    if (search) {
      query = query.or(`action.ilike.%${search}%,ipAddress.ilike.%${search}%`);
    }

    // Add action filter
    if (action) {
      query = query.eq("action", action);
    }

    // Apply pagination at the end for better performance
    query = query.range(offset, offset + limit - 1);

    const { data: activitiesRaw, error, count } = await query;

    if (error) {
      console.error("Error fetching user activities:", error);
      return { data: [], total: 0, totalPages: 0 };
    }

    // Transform the data to match expected interface
    const activities: UserActivityData[] = (activitiesRaw as unknown as UserActivityRaw[] || []).map(activity => ({
      ...activity,
      profile: activity.profile || {
        id: '',
        nama: 'Unknown',
        jabatan: 'Unknown',
        role: 'Unknown'
      }
    }));

    return {
      data: activities,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return {
      data: [],
      total: 0,
      totalPages: 0,
    };
  }
}

export async function logUserActivity(
  profileId: string,
  action: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const supabase = supabaseAdmin;
    const timestamp = new Date().toISOString();

    const { error } = await supabase
      .from("UserActivity")
      .insert({
        profileId,
        action,
        details,
        ipAddress,
        userAgent,
        createdAt: timestamp,
      });

    if (error) {
      console.error("Error logging user activity:", error);
      return;
    }

    await createAuditLog({
      userId: profileId,
      action: "CREATE",
      tableName: "UserActivity",
      recordId: profileId,
      newValues: {
        action,
        details,
        ipAddress,
        userAgent,
        timestamp,
      },
      description: action === "LOGIN_SUCCESS"
        ? "User login activity recorded"
        : `User activity recorded: ${action}`,
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}

export async function getUserActivityStats(): Promise<{
  totalActivities: number;
  todayActivities: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
}> {
  try {
    const supabase = supabaseAdmin;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Use Promise.all for parallel execution to improve performance
    const [
      { count: totalActivities },
      { count: todayActivities },
      { data: recentData }
    ] = await Promise.all([
      // Use estimated count for total activities (faster for large tables)
      supabase.from("UserActivity").select("id", { count: "estimated", head: true }),
      
      // Use exact count for today's activities (smaller dataset)
      supabase.from("UserActivity").select("id", { count: "exact", head: true })
        .gte("createdAt", today.toISOString())
        .lt("createdAt", tomorrow.toISOString()),
      
      // Get recent data for stats (limit to last 1000 records for performance)
      supabase.from("UserActivity")
        .select("profileId, action")
        .order("createdAt", { ascending: false })
        .limit(1000)
    ]);

    // Calculate unique users from recent data
    const uniqueUsers = new Set(
      recentData?.filter(item => item.profileId).map(item => item.profileId) || []
    ).size;

    // Calculate action stats from recent data
    const actionCounts = recentData?.reduce((acc: Record<string, number>, item) => {
      if (!item.action) return acc;
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, {}) || {};

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalActivities: totalActivities || 0,
      todayActivities: todayActivities || 0,
      uniqueUsers,
      topActions,
    };
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    return {
      totalActivities: 0,
      todayActivities: 0,
      uniqueUsers: 0,
      topActions: [],
    };
  }
}

export async function deleteOldActivities(daysToKeep: number = 90) {
  try {
    const supabase = supabaseAdmin;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error, count } = await supabase
      .from("UserActivity")
      .delete()
      .lt("createdAt", cutoffDate.toISOString());

    if (error) {
      console.error("Error deleting old activities:", error);
      return { success: false, error: "Failed to delete old activities" };
    }

    revalidatePath("/admin/user-activity");
    return { success: true, deletedCount: count || 0 };
  } catch (error) {
    console.error("Error deleting old activities:", error);
    return { success: false, error: "Failed to delete old activities" };
  }
}

// Aliases to match component expectations
export const getUserActivities = getUserActivityLogs;
export const getActivityStats = getUserActivityStats;