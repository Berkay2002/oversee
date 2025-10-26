import { createClient, getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AnvandareRedirectPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_org_id")
    .eq("user_id", user.id)
    .single();

  if (profile?.default_org_id) {
    redirect(`/org/${profile.default_org_id}/anvandare`);
  } else {
    redirect("/onboarding");
  }

  return null;
}
