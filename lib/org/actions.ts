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
import type { Database } from "@/types/database";

type JoinRequestRow =
  Database["public"]["Tables"]["organization_join_requests"]["Row"];
type JoinRequestInsert =
  Database["public"]["Tables"]["organization_join_requests"]["Insert"];
type JoinRequestUpdate =
  Database["public"]["Tables"]["organization_join_requests"]["Update"];
type OrganizationMemberInsert =
  Database["public"]["Tables"]["organization_members"]["Insert"];
type RequestStatus = Database["public"]["Enums"]["request_status"];
type JoinRequestSummary = Pick<
  JoinRequestRow,
  "id" | "org_id" | "user_id" | "status"
>;

const PENDING_STATUS: RequestStatus = "pending";
const ACCEPTED_STATUS: RequestStatus = "accepted";
const REJECTED_STATUS: RequestStatus = "rejected";

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
 * Get all organizations
 * Used for the onboarding page
 */
export async function getAllOrganizations(): Promise<{
  success: boolean;
  organizations?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name");

    if (error) {
      console.error("Error getting all organizations:", error);
      return { success: false, error: error.message };
    }

    return { success: true, organizations: data };
  } catch (error) {
    console.error("Error getting all organizations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get all organizations",
    };
  }
}

/**
 * Send a join request to an organization
 */
export async function sendJoinRequest(
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

    const {
      data: existingRequest,
      error: existingRequestError,
    } = await supabase
      .from("organization_join_requests")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .eq("status", PENDING_STATUS)
      .maybeSingle<Pick<JoinRequestRow, "id">>();

    if (existingRequestError) {
      console.error("Error checking existing join request:", existingRequestError);
      return { success: false, error: existingRequestError.message };
    }

    if (existingRequest) {
      return { success: true };
    }

    const insertPayload: JoinRequestInsert = {
      org_id: orgId,
      user_id: user.id,
      status: PENDING_STATUS,
    };

    const { error } = await supabase
      .from("organization_join_requests")
      .insert(insertPayload);

    if (error) {
      console.error("Error sending join request:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending join request:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send join request",
    };
  }
}

/**
 * Accept or reject a join request
 */
export async function manageJoinRequest(
  requestId: string,
  action: "accept" | "reject"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the request
    const { data: request, error: requestError } = await supabase
      .from("organization_join_requests")
      .select("id, org_id, user_id, status")
      .eq("id", requestId)
      .maybeSingle<JoinRequestSummary>();

    if (requestError || !request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== PENDING_STATUS) {
      return { success: false, error: "Request already processed" };
    }

    if (!request.org_id || !request.user_id) {
      return { success: false, error: "Request is missing required data" };
    }

    const orgIdForRequest = request.org_id;
    const userIdForRequest = request.user_id;

    // RLS will enforce that the user is an admin of the organization

    if (action === "accept") {
      const memberPayload: OrganizationMemberInsert = {
        org_id: orgIdForRequest,
        user_id: userIdForRequest,
        role: "member",
      };

      const { error: memberError } = await supabase
        .from("organization_members")
        .upsert(memberPayload, { onConflict: "org_id,user_id" });

      if (memberError) {
        console.error("Error adding member to organization:", memberError);
        return { success: false, error: memberError.message };
      }

      const acceptedUpdate: JoinRequestUpdate = { status: ACCEPTED_STATUS };

      const { error: statusError } = await supabase
        .from("organization_join_requests")
        .update(acceptedUpdate)
        .eq("id", requestId);

      if (statusError) {
        console.error("Error updating join request status:", statusError);
        return { success: false, error: statusError.message };
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ default_org_id: orgIdForRequest })
        .eq("user_id", userIdForRequest)
        .is("default_org_id", null);

      if (profileError) {
        console.error("Error updating user profile default org:", profileError);
      }
    } else {
      const rejectedUpdate: JoinRequestUpdate = { status: REJECTED_STATUS };

      const { error: statusError } = await supabase
        .from("organization_join_requests")
        .update(rejectedUpdate)
        .eq("id", requestId);

      if (statusError) {
        console.error("Error rejecting join request:", statusError);
        return { success: false, error: statusError.message };
      }
    }

    revalidatePath(`/org/${orgIdForRequest}/join-requests`);

    return { success: true };
  } catch (error) {
    console.error("Error managing join request:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to manage join request",
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
