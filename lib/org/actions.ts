"use server";

/**
 * Server actions for organization management
 *
 * These actions are called from client components to manage
 * organization state, switching, and cookies.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgForUser, getUserDefaultOrg } from "./server";
import { revalidatePath } from "next/cache";

/**
 * Set the active organization cookie
 * This is called when user switches organizations
 */
export async function setActiveOrg(orgId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("activeOrgId", orgId, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Switch to a different organization
 * Validates membership, sets cookie, and redirects
 */
export async function switchOrganization(
  orgId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate membership
    await getActiveOrgForUser(orgId, user.id);

    // Set cookie
    await setActiveOrg(orgId);

    // Revalidate paths to refresh data
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error switching organization:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to switch organization",
    };
  }
}

/**
 * Get the active organization ID from cookie or user's default
 * Used in proxy.ts and layouts
 */
export async function getActiveOrgId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Try cookie first
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("activeOrgId")?.value;

  if (activeOrgId) {
    // Validate that user is still a member
    try {
      await getActiveOrgForUser(activeOrgId, user.id);
      return activeOrgId;
    } catch {
      // Cookie org is invalid, clear it
      cookieStore.delete("activeOrgId");
    }
  }

  // Fall back to default org
  return await getUserDefaultOrg(user.id);
}

/**
 * Create a new organization
 * Uses Supabase RPC function
 */
export async function createOrganization(
  name: string
): Promise<{ success: boolean; orgId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Call the RPC function
    const { data, error } = await supabase.rpc("create_org", {
      p_name: name,
    });

    if (error) {
      console.error("Error creating organization:", error);
      return { success: false, error: error.message };
    }

    const orgId = data as string;

    // Set as active org
    await setActiveOrg(orgId);

    // Update profile default_org_id
    await supabase
      .from("profiles")
      .update({ default_org_id: orgId })
      .eq("user_id", user.id);

    return { success: true, orgId };
  } catch (error) {
    console.error("Error creating organization:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create organization",
    };
  }
}

/**
 * Update organization name
 * Requires admin or owner role
 */
export async function updateOrganizationName(
  orgId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Update organization (RLS will enforce permissions)
    const { error } = await supabase
      .from("organizations")
      .update({ name })
      .eq("id", orgId);

    if (error) {
      console.error("Error updating organization:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/org/${orgId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update organization",
    };
  }
}

/**
 * Delete organization
 * Requires owner role
 */
export async function deleteOrganization(
  orgId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Delete organization (RLS will enforce ownership)
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (error) {
      console.error("Error deleting organization:", error);
      return { success: false, error: error.message };
    }

    // Clear cookie if this was the active org
    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get("activeOrgId")?.value;
    if (activeOrgId === orgId) {
      cookieStore.delete("activeOrgId");
    }

    // Redirect to home (will pick a new org)
    redirect("/");
  } catch (error) {
    console.error("Error deleting organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
    };
  }
}
