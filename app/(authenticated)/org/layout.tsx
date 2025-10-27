import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";

import AuthenticatedLayoutContent from "../authenticated-layout-content";
import { getActiveOrgId } from "@/lib/org/actions";
import { getActiveOrgForUser } from "@/lib/org/server";
import { getUser } from "@/lib/supabase/server";

export default async function OrgLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const orgId = await getActiveOrgId();

  if (!orgId) {
    redirect("/create-organization");
  }

  const activeOrg = await getActiveOrgForUser(orgId, user.id).catch((error) => {
    console.error("Error loading active organization", error);
    return null;
  });

  if (!activeOrg) {
    redirect("/create-organization");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthenticatedLayoutContent activeOrg={activeOrg} user={user}>
        {children}
      </AuthenticatedLayoutContent>
    </Suspense>
  );
}
