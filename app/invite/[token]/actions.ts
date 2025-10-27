"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server";

export async function acceptInvitation(token: string) {
  const user = await getUser();

  if (!user) {
    // Redirect to login with return URL to come back after auth
    return redirect(`/login?returnTo=/invite/${token}`);
  }

  const supabase = await createClient();

  // Call our database function to accept the invitation
  // This handles: adding to org, setting default_org_id if first org, and marking as accepted
  const { data, error } = await supabase.rpc("accept_org_invitation", {
    p_token: token,
    p_user_id: user.id,
  });

  // Handle errors
  if (error) {
    console.error("Error accepting invitation:", error);
    return redirect("/?error=invitation_failed");
  }

  // Check if function returned an error
  if (data && typeof data === "object" && "error" in data) {
    console.error("Invitation error:", data.error);

    // Specific error handling
    if (data.error === "Invalid or expired invitation") {
      return redirect("/?error=invitation_expired");
    }

    return redirect("/?error=invitation_failed");
  }

  // Success! Extract result
  const result = data as { success: boolean; org_id: string; is_default_org: boolean };

  // Create success message
  const message = result.is_default_org
    ? "Invitation accepted! This is now your default organization."
    : "Invitation accepted!";

  // Redirect to organization dashboard with success message
  redirect(`/org/${result.org_id}/oversikt?success=${encodeURIComponent(message)}`);
}
