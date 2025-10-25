import { getActiveOrgForUser } from "@/lib/org/server";
import { getSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrgProvider } from "@/lib/org/context";

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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
    </OrgProvider>
  );
}
