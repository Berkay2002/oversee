import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUser, getUserProfile } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") || "";

  if (!user) {
    redirect("/login");
  }

  // Pass userId to avoid redundant getUser() call
  const userProfile = await getUserProfile(user.id);

  const userData = {
    name: user.email?.split("@")[0] || "User",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url,
    role: userProfile?.role,
  };

  const showSidebar = !pathname.startsWith("/onboarding") && !pathname.startsWith("/create-organization");

  return (
    <SidebarProvider>
      {showSidebar && <AppSidebar user={userData} />}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          {showSidebar && <SidebarTrigger />}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
