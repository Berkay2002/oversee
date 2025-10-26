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
  Sun,
  Moon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Översikt",
      url: "/oversikt",
      icon: LayoutDashboard,
    },
  ],
  navReports: [
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
  navBilkollen: [
    {
      title: "Fordon",
      url: "/bilkollen",
      icon: Car,
    },
    {
      title: "Platser",
      url: "/platser",
      icon: MapPin,
    },
  ],
  navManagement: [
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
  ],
  navAdmin: [
    {
      title: "Användare",
      url: "/anvandare",
      icon: Users,
    },
    {
      title: "Join Requests",
      url: "/join-requests",
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

type SidebarProps = React.ComponentProps<typeof Sidebar>

type AppSidebarProps = SidebarProps & {
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  orgId?: string
  orgName?: string
}

export function AppSidebar({
  user,
  orgId: orgIdProp,
  orgName,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const { setTheme, theme } = useTheme()

  // Extract orgId from pathname (e.g., /org/[orgId]/page -> [orgId])
  const orgIdMatch = pathname.match(/^\/org\/([^\/]+)/)
  const orgId = orgIdProp ?? (orgIdMatch ? orgIdMatch[1] : null)

  // Transform URLs to include orgId if we're in an org context
  const transformUrl = (url: string) => {
    if (orgId && !url.startsWith('/org/')) {
      return `/org/${orgId}${url}`
    }
    return url
  }

  const handleHeaderClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Transform all URLs
  const navMainWithOrgId = data.navMain.map(item => ({
    ...item,
    url: transformUrl(item.url)
  }))

  const navReportsWithOrgId = data.navReports.map(item => ({
    ...item,
    url: transformUrl(item.url)
  }))

  const navBilkollenWithOrgId = data.navBilkollen.map(item => ({
    ...item,
    url: transformUrl(item.url)
  }))

  const navManagementWithOrgId = data.navManagement.map(item => ({
    ...item,
    url: transformUrl(item.url)
  }))

  const navAdminWithOrgId = data.navAdmin.map(item => ({
    ...item,
    url: transformUrl(item.url)
  }))

  const navSecondaryWithOrgId = data.navSecondary.map(item => ({
    ...item,
    url: item.url === "/settings" ? transformUrl(item.url) : item.url
  }))

  const homeUrl = orgId ? `/org/${orgId}/oversikt` : "/oversikt"

  const isAdmin = user?.role === "admin"

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
              <a href={homeUrl} onClick={handleHeaderClick}>
                <div
                  className={cn(
                    "-ml-1 flex aspect-square items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all",
                    state === "collapsed" ? "size-6" : "size-8"
                  )}
                >
                  <Wrench
                    className={cn(
                      "transition-all",
                      state === "collapsed" ? "size-4" : "size-5"
                    )}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {orgName ?? "Verkstads Insikt"}
                  </span>
                  <span className="truncate text-xs">
                    {orgName ? "Organisation" : "Workshop Reports"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithOrgId} />
        <NavMain items={navReportsWithOrgId} label="Rapporter" />
        <NavMain items={navBilkollenWithOrgId} label="Bilkollen" />
        <NavMain items={navManagementWithOrgId} label="Hantering" />
        {isAdmin && <NavMain items={navAdminWithOrgId} label="Administration" />}
        <NavSecondary items={navSecondaryWithOrgId} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <NavUser user={user} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
