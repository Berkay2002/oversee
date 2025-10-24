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
} from "lucide-react"

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
  const navManagement =
    user?.role === "admin"
      ? data.navManagement
      : data.navManagement.filter((item) => !item.adminOnly)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/oversikt">
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
        <NavMain items={data.navMain} label="Navigation" />
        <NavMain items={navManagement} label="Hantering" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
