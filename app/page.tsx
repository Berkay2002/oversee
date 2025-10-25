import { redirect } from "next/navigation"
import { getSession, getUserProfile } from "@/lib/supabase/server"
import { getUserOrganizations } from "@/lib/org/server"

export default async function Home() {
  const session = await getSession()

  // Redirect non-authenticated users to login
  if (!session) {
    redirect("/login")
  }

  // Get user's profile to find default org
  const profile = await getUserProfile(session.user.id)

  if (profile?.default_org_id) {
    // Redirect to default org
    redirect(`/org/${profile.default_org_id}/oversikt`)
  }

  // Try to find any org the user is a member of
  const orgs = await getUserOrganizations(session.user.id)

  if (orgs.length > 0) {
    // Redirect to first org
    redirect(`/org/${orgs[0].org_id}/oversikt`)
  }

  // No org found, redirect to the onboarding page
  redirect("/onboarding")
}
