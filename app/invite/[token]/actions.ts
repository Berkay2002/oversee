"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server";

export async function acceptInvitation(token: string) {
  const user = await getUser();
  if (!user) {
    return redirect(`/login?returnTo=/invite/${token}`);
  }

  const supabase = await createClient();

  // 1. Fetch invitation
  const { data: invitation, error: inviteError } = await supabase
    .from("org_invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteError || !invitation) {
    // Handle error in UI
    return redirect("/?error=invalid_invitation");
  }

  // 2. Check if expired or already accepted
  if (new Date(invitation.expires_at) < new Date() || invitation.accepted_at) {
    return redirect("/?error=invitation_expired");
  }

  // 3. Add user to organization
  const { error: addMemberError } = await supabase
    .from("organization_members")
    .insert({
      org_id: invitation.org_id,
      user_id: user.id,
      role: invitation.role,
    });

  if (addMemberError) {
    console.error("Error adding member:", addMemberError);
    return redirect("/?error=failed_to_join");
  }

  // 4. Mark invitation as accepted
  const { error: updateInviteError } = await supabase
    .from("org_invitations")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq("id", invitation.id);

  if (updateInviteError) {
    console.error("Error updating invitation:", updateInviteError);
    // Non-critical, proceed with redirect
  }

  // 5. Redirect to the organization's dashboard
  redirect(`/org/${invitation.org_id}/oversikt`);
}
