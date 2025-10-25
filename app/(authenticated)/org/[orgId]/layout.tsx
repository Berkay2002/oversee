import { getActiveOrgForUser } from "@/lib/org/server";
import { getSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrgProvider } from "@/lib/org/context";
import { OrgSwitcherWrapper } from "@/components/org-switcher-wrapper";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgId } = await params;

  // Get session (faster than getUser and reuses session from parent layout)
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Validate org membership and get role
  let activeOrg;
  try {
    activeOrg = await getActiveOrgForUser(orgId, session.user.id);
  } catch (error) {
    console.error("Invalid org access:", error);
    // User is not a member of this org, redirect to root
    // The proxy will handle finding a valid org or showing create-organization
    redirect("/");
  }

  return (
    <OrgProvider activeOrg={activeOrg}>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
        <SidebarTrigger />
        <OrgSwitcherWrapper currentOrgId={orgId} userId={session.user.id} />
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
    </OrgProvider>
  );
}
