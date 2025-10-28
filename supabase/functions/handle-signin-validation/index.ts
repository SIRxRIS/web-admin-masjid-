import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

interface SignInValidationRequest {
  userId: string;
  email: string;
  fullName?: string;
  provider?: string;
}

// Update interface sesuai Prisma schema
interface WhitelistEntry {
  id: string;
  nama: string;
  email: string;
  isActive: boolean;
  jabatan: string;
  role: string;
  addedBy: string | null;
  addedAt: string;
  updatedAt: string;
}

interface ProfileData {
  userId: string;
  nama: string;
  jabatan: string;
  role: string;
  is_profile_complete?: boolean;
}

async function checkEmailWhitelist(email: string): Promise<WhitelistEntry | null> {
  try {
    const emailLower = email.toLowerCase();
    console.log("🔍 [checkEmailWhitelist] Checking whitelist for email:", emailLower);
    
    console.log("🔍 [checkEmailWhitelist] About to query email_whitelist table");
    const { data, error } = await supabase
      .from("email_whitelist")
      .select("id, nama, email, isActive, jabatan, role, addedBy, addedAt, updatedAt")
      .eq("email", emailLower)
      .maybeSingle(); // Gunakan maybeSingle() untuk avoid error jika tidak ada data

    console.log("🔍 [checkEmailWhitelist] Query completed - error:", error ? JSON.stringify(error) : "null", "- data:", data ? "received" : "null");

    if (error) {
      console.error("❌ [checkEmailWhitelist] Whitelist query error:", error.message, error.code);
      return null;
    }

    if (!data) {
      console.warn("⚠️  [checkEmailWhitelist] Email not found in whitelist:", emailLower);
      return null;
    }

    console.log("✓ [checkEmailWhitelist] Whitelist entry found:", { 
      id: data.id, 
      email: data.email, 
      role: data.role,
      isActive: data.isActive 
    });

    // Check isActive dengan explicit comparison
    if (data.isActive !== true) {
      console.warn("⚠️  [checkEmailWhitelist] Email is whitelisted but inactive:", emailLower);
      return null;
    }

    console.log("✓ [checkEmailWhitelist] Returning valid whitelist entry");
    return data as WhitelistEntry;
  } catch (error) {
    console.error("❌ [checkEmailWhitelist] Exception caught:", {
      type: error instanceof Error ? "Error" : typeof error,
      message: error instanceof Error ? error.message : JSON.stringify(error),
      error: error
    });
    throw error;
  }
}

async function getProfileByUserId(userId: string) {
  try {
    console.log("🔍 [getProfileByUserId] Called for userId:", userId);
    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("userId", userId)
      .maybeSingle(); // Gunakan maybeSingle()

    console.log("🔍 [getProfileByUserId] Query completed - error:", error ? JSON.stringify(error) : "null", "- data:", data ? "found" : "null");

    if (error) {
      console.error("❌ [getProfileByUserId] Query error:", error.message, error.code);
      throw error;
    }

    if (!data) {
      console.log("ℹ️  [getProfileByUserId] No profile found (expected for new users)");
      return null;
    }

    console.log("✓ [getProfileByUserId] Profile found:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ [getProfileByUserId] Exception:", {
      type: error instanceof Error ? "Error" : typeof error,
      message: error instanceof Error ? error.message : JSON.stringify(error),
      error: error
    });
    throw error;
  }
}

async function createProfile(profileData: ProfileData) {
  try {
    console.log("📝 [createProfile] Creating profile with data:", profileData);
    
    // Generate UUID explicitly
    const profileId = crypto.randomUUID();
    const profileWithId = {
      id: profileId,
      ...profileData
    };
    
    const { data, error } = await supabase
      .from("profile")
      .insert([profileWithId])
      .select()
      .single();

    console.log("📝 [createProfile] Insert completed - error:", error ? JSON.stringify(error) : "null", "- data:", data ? "received" : "null");

    if (error) {
      console.error("❌ [createProfile] Insert error:", error.message, error.code, JSON.stringify(error));
      throw new Error(`Failed to insert profile: ${error.message}`);
    }

    console.log("✓ [createProfile] Profile created successfully");
    return data;
  } catch (error) {
    console.error("❌ [createProfile] Exception:", {
      type: error instanceof Error ? "Error" : typeof error,
      message: error instanceof Error ? error.message : JSON.stringify(error),
      error: error
    });
    throw error;
  }
}

async function updateProfile(userId: string, updates: Record<string, any>) {
  try {
    console.log("📝 [updateProfile] Updating profile for userId:", userId, "with:", updates);
    const { data, error } = await supabase
      .from("profile")
      .update(updates)
      .eq("userId", userId)
      .select();

    console.log("📝 [updateProfile] Update completed - error:", error ? JSON.stringify(error) : "null", "- data:", data ? "received" : "null");

    if (error) {
      console.error("❌ [updateProfile] Update error:", error.message, error.code);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    console.log("✓ [updateProfile] Profile updated successfully");
    return data;
  } catch (error) {
    console.error("❌ [updateProfile] Exception:", {
      type: error instanceof Error ? "Error" : typeof error,
      message: error instanceof Error ? error.message : JSON.stringify(error),
      error: error
    });
    throw error;
  }
}

async function logUserActivity(
  profileId: string,
  action: string,
  details: Record<string, any>
) {
  try {
    console.log("📊 [logUserActivity] Logging activity for profileId:", profileId, "action:", action);
    const { error } = await supabase.from("UserActivity").insert([
      {
        profileId: profileId,
        action: action,
        details: details,
        createdAt: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn("⚠️  [logUserActivity] Error logging activity:", error.message);
      return;
    }
    console.log("✓ [logUserActivity] Activity logged successfully");
  } catch (error) {
    console.error("❌ [logUserActivity] Exception:", {
      type: error instanceof Error ? "Error" : typeof error,
      message: error instanceof Error ? error.message : JSON.stringify(error),
      error: error
    });
  }
}

function getJabatanFromRole(role: string): string {
  const roleMapping: Record<string, string> = {
    ADMIN: "DEVELOPER",
    KETUA: "KETUA",
    SEKRETARIS: "SEKRETARIS",
    BENDAHARA: "BENDAHARA",
    HUMAS_MEDIA: "HUMAS",
    REMAS_ADMIN: "REMAS",
    MAJLIS_TALIM_ADMIN: "MAJLIS_TALIM",
  };
  return roleMapping[role] || "PENGURUS";
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
    console.log("=== handle-signin-validation START ===");
    const body: SignInValidationRequest = await req.json();
    const { userId, email, fullName, provider } = body;

    console.log("Request body:", { userId, email, fullName: fullName?.substring(0, 20), provider });

    if (!userId || !email) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: userId or email",
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 400 }
      );
    }

    console.log("📋 [handler] Step 1: Calling checkEmailWhitelist...");
    let whitelistEntry: WhitelistEntry | null = null;
    try {
      whitelistEntry = await checkEmailWhitelist(email);
    } catch (checkError) {
      console.error("❌ [handler] checkEmailWhitelist threw error:", checkError);
      throw new Error(`Whitelist check exception: ${checkError instanceof Error ? checkError.message : JSON.stringify(checkError)}`);
    }

    if (!whitelistEntry) {
      console.error("❌ [handler] Whitelist check returned null for email:", email);
      return new Response(
        JSON.stringify({
          success: false,
          error: "not_whitelisted",
          message: "Email not whitelisted or account is inactive",
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 403 }
      );
    }

    console.log("✓ [handler] Step 1 passed: Whitelist check successful");

    console.log("📋 [handler] Step 2: Calling getProfileByUserId...");
    let profile = null;
    try {
      profile = await getProfileByUserId(userId);
    } catch (profileError) {
      console.error("❌ [handler] getProfileByUserId threw error:", profileError);
      throw new Error(`Profile retrieval exception: ${profileError instanceof Error ? profileError.message : JSON.stringify(profileError)}`);
    }

    if (!profile) {
      console.log("📋 [handler] Step 3a: No profile found, creating new profile...");
      const jabatan = getJabatanFromRole(whitelistEntry.role);
      const profileData: ProfileData = {
        userId,
        nama: fullName || whitelistEntry.nama || email.split("@")[0],
        jabatan,
        role: whitelistEntry.role,
        is_profile_complete: false,
      };

      try {
        await createProfile(profileData);
        console.log("✓ [handler] Profile creation completed");
        profile = await getProfileByUserId(userId);
        console.log("✓ [handler] Step 3a passed: Profile created and retrieved for:", email);
      } catch (createError) {
        console.error("❌ [handler] Profile creation failed:", createError);
        throw new Error(`Profile creation exception: ${createError instanceof Error ? createError.message : JSON.stringify(createError)}`);
      }
    } else {
      console.log("📋 [handler] Step 3b: Profile found, updating...");
      try {
        await updateProfile(userId, {
          updatedAt: new Date().toISOString(),
        });
        console.log("✓ [handler] Step 3b passed: Profile updated for:", email);
      } catch (updateError) {
        console.error("❌ [handler] Profile update failed:", updateError);
        throw new Error(`Profile update exception: ${updateError instanceof Error ? updateError.message : JSON.stringify(updateError)}`);
      }
    }

    if (profile) {
      console.log("📋 [handler] Step 4: Logging user activity...");
      try {
        await logUserActivity(profile.id, "LOGIN_SUCCESS", {
          email,
          userId,
          fullName: fullName || whitelistEntry.nama || email.split("@")[0],
          provider: provider || "unknown",
        });
        console.log("✓ [handler] Step 4 passed: Activity logged");
      } catch (activityError) {
        console.warn("⚠️  [handler] Activity logging failed (non-critical):", activityError);
      }
    }

    const adminRoles = ["ADMIN"];
    const managementRoles = [
      "KETUA",
      "SEKRETARIS",
      "BENDAHARA",
      "HUMAS_MEDIA",
      "REMAS_ADMIN",
      "MAJLIS_TALIM_ADMIN",
    ];

    let redirectPath = "/";
    if (
      adminRoles.includes(whitelistEntry.role) ||
      managementRoles.includes(whitelistEntry.role)
    ) {
      redirectPath = "/admin";
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sign-in validation successful",
        profile,
        redirectPath,
        role: whitelistEntry.role,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorStack = "";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || "";
    } else if (typeof error === "object" && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("=== CRITICAL ERROR in handle-signin-validation ===");
    console.error("Message:", errorMessage);
    console.error("Stack:", errorStack);
    console.error("Full error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "validation_error",
        message: errorMessage,
        _debug: errorStack?.split('\n')[0] || ""
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  }
});