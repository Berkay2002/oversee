"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireOrgRole } from "@/lib/org/server";
import { getUser } from "@/lib/supabase/server";

export async function createInvitation(orgId: string, email: string, role: "admin" | "member") {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  await requireOrgRole(orgId, user.id, "admin");

  const supabase = await createClient();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Get organization name for email
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();

  // Store invitation in custom table
  const { error: dbError } = await supabase.from("org_invitations").insert({
    org_id: orgId,
    email,
    role,
    token,
    expires_at: expiresAt.toISOString(),
    created_by: user.id,
  });

  if (dbError) {
    console.error("Error creating invitation:", dbError);
    throw new Error("Could not create invitation.");
  }

  // Send invitation email using Supabase Admin API
  try {
    const supabaseAdmin = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // The redirectTo should go through auth callback which verifies the token
    // and then redirects to the actual invitation page
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/invite/${token}`,
    });
  } catch (emailError) {
    console.error("Failed to send invitation email:", emailError);
    // Don't throw - invitation is saved and can be resent
  }

  revalidatePath(`/org/${orgId}/settings/members`);

  const invitationLink = `/invite/${token}`;
  return { success: true, invitationLink };
}

export async function resendInvitation(invitationId: string, orgId: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  await requireOrgRole(orgId, user.id, "admin");

  const supabase = await createClient();

  // Get invitation details
  const { data: invitation, error: fetchError } = await supabase
    .from("org_invitations")
    .select("*, organizations(name)")
    .eq("id", invitationId)
    .single();

  if (fetchError || !invitation) {
    throw new Error("Invitation not found");
  }

  // Check if still valid
  if (new Date(invitation.expires_at) < new Date() || invitation.accepted_at) {
    throw new Error("Invitation is expired or already accepted");
  }

  // Resend using Supabase Admin API
  try {
    const supabaseAdmin = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // The redirectTo should go through auth callback which verifies the token
    // and then redirects to the actual invitation page
    await supabaseAdmin.auth.admin.inviteUserByEmail(invitation.email, {
      redirectTo: `${siteUrl}/auth/callback?next=/invite/${invitation.token}`,
    });
  } catch (emailError) {
    console.error("Failed to resend invitation email:", emailError);
    throw new Error("Failed to resend invitation email");
  }

  revalidatePath(`/org/${orgId}/settings/members`);
}

export async function listPendingInvitations(orgId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_invitations")
    .select("*")
    .eq("org_id", orgId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing invitations:", error);
    return [];
  }
  return data;
}

export async function cancelInvitation(invitationId: string, orgId: string) {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  await requireOrgRole(orgId, user.id, "admin");

  const supabase = await createClient();
  const { error } = await supabase
    .from("org_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) {
    console.error("Error canceling invitation:", error);
    throw new Error("Could not cancel invitation.");
  }

  revalidatePath(`/org/${orgId}/settings/members`);
}
