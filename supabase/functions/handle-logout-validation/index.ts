import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

interface LogoutValidationRequest {
  userId: string;
  email: string;
  provider?: string;
}

async function logUserLogout(
  profileId: string,
  metadata: Record<string, any>
) {
  try {
    const { error } = await supabase.from("user_activity_logs").insert([
      {
        profile_id: profileId,
        activity_type: "LOGOUT_SUCCESS",
        metadata,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn("Error logging logout activity:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in logUserLogout:", error);
    return false;
  }
}

async function getProfileByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.warn("Profile not found for user:", userId);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
}

async function updateLastLogout(userId: string) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        lastLogoutAt: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.warn("Error updating lastLogoutAt:", error);
    }
  } catch (error) {
    console.error("Error in updateLastLogout:", error);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body: LogoutValidationRequest = await req.json();
    const { userId, email, provider } = body;

    if (!userId || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: userId or email",
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      );
    }

    const profile = await getProfileByUserId(userId);

    if (!profile) {
      console.warn("Profile not found for logout logging:", userId);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Logout processed (profile not found, but continuing)",
          profileId: null,
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
      );
    }

    await logUserLogout(profile.id, {
      email,
      userId,
      provider: provider || "unknown",
      logoutTime: new Date().toISOString(),
    });

    await updateLastLogout(userId);

    console.log("User logged out successfully:", email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Logout logged successfully",
        profileId: profile.id,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    console.error("Error in handle-logout-validation:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  }
});
