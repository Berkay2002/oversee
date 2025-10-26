"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrgRole } from "@/lib/org/server";
import { getUser } from "@/lib/supabase/server";

export async function createInvitation(orgId: string, email: string, role: "admin" | "member") {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");

  await requireOrgRole(orgId, user.id, "admin");

  const supabase = await createClient();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const { error } = await supabase.from("org_invitations").insert({
    org_id: orgId,
    email,
    role,
    token,
    expires_at: expiresAt.toISOString(),
    created_by: user.id,
  });

  if (error) {
    console.error("Error creating invitation:", error);
    throw new Error("Could not create invitation.");
  }

  revalidatePath(`/org/${orgId}/settings/members`);

  // In a real app, you'd send an email here.
  // For now, we'll just return the link for testing.
  const invitationLink = `/invite/${token}`;
  return { invitationLink };
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
