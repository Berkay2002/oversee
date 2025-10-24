import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getSession } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const userData = {
    name: session.user.email?.split("@")[0] || "User",
    email: session.user.email || "",
    avatar: session.user.user_metadata?.avatar_url,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
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
