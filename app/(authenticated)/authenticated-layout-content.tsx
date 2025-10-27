import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { ActiveOrg } from "@/lib/org/server";
import { getUserProfile } from "@/lib/supabase/server";

interface AuthenticatedLayoutContentProps {
  children: ReactNode;
  user: User;
  activeOrg: ActiveOrg;
}

export default async function AuthenticatedLayoutContent({
  children,
  user,
  activeOrg,
}: AuthenticatedLayoutContentProps) {
  const userProfile = await getUserProfile(user.id);

  const userData = {
    name: user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
    role: userProfile?.role,
  };

  return (
    <SidebarProvider>
      <AppSidebar orgId={activeOrg.id} orgName={activeOrg.name} user={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
