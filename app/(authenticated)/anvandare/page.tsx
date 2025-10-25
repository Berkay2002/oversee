import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AnvandareRedirectPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_org_id")
    .eq("user_id", session.user.id)
    .single();

  if (profile?.default_org_id) {
    redirect(`/org/${profile.default_org_id}/anvandare`);
  } else {
    redirect("/onboarding");
  }

  return null;
}
