"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  FolderOpen,
  Wrench,
  UserCheck,
  Settings,
  HelpCircle,
  Car,
  MapPin,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Översikt",
      url: "/oversikt",
      icon: LayoutDashboard,
    },
    {
      title: "Bilkollen",
      url: "/bilkollen",
      icon: Car,
    },
    {
      title: "Ny Rapport",
      url: "/ny-rapport",
      icon: FilePlus,
    },
    {
      title: "Alla Rapporter",
      url: "/alla-rapporter",
      icon: FileText,
    },
  ],
  navManagement: [
    {
      title: "Användare",
      url: "/anvandare",
      icon: Users,
      adminOnly: true,
    },
    {
      title: "Join Requests",
      url: "/join-requests",
      icon: UserCheck,
      adminOnly: true,
    },
    {
      title: "Kategorier",
      url: "/kategorier",
      icon: FolderOpen,
    },
    {
      title: "Tekniker",
      url: "/tekniker",
      icon: Wrench,
    },
    {
      title: "Reporter",
      url: "/reporter",
      icon: UserCheck,
    },
    {
      title: "Platser",
      url: "/platser",
      icon: MapPin,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
}) {
  const pathname = usePathname()

  // Extract orgId from pathname (e.g., /org/[orgId]/page -> [orgId])
  const orgIdMatch = pathname.match(/^\/org\/([^\/]+)/)
  const orgId = orgIdMatch ? orgIdMatch[1] : null

  // Transform URLs to include orgId if we're in an org context
  const transformUrl = (url: string) => {
    if (orgId && !url.startsWith('/org/')) {
      return `/org/${orgId}${url}`
    }
    return url
  }

  const navManagement =
    user?.role === "admin"
      ? data.navManagement
      : data.navManagement.filter((item) => !item.adminOnly)

  // Transform all URLs
  const navMainWithOrgId = data.navMain.map(item => ({
    ...item,
    url: transformUrl(item.url)
  }))

  const navManagementWithOrgId = navManagement.map(item => ({
    ...item,
    url: transformUrl(item.url)
  }))

  const homeUrl = orgId ? `/org/${orgId}/oversikt` : "/oversikt"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href={homeUrl}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wrench className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Verkstads Insikt</span>
                  <span className="truncate text-xs">Workshop Reports</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithOrgId} label="Navigation" />
        <NavMain items={navManagementWithOrgId} label="Hantering" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
