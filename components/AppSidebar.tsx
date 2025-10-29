"use client"

import * as React from "react"
import {
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
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  navReports: [
    {
      title: "Översikt",
      url: "/oversikt",
      icon: BarChart3,
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
  navBilkollen: [
    {
      title: "Översikt",
      url: "/bilkollen-oversikt",
      icon: BarChart3,
    },
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
      title: "Hjälp",
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
  const [sidebarWidth, setSidebarWidth] = React.useState(256)

  // Track sidebar width changes
  React.useEffect(() => {
    const updateWidth = () => {
      const sidebarWrapper = document.querySelector('[data-slot="sidebar-wrapper"]') as HTMLElement
      if (sidebarWrapper) {
        const width = getComputedStyle(sidebarWrapper).getPropertyValue('--sidebar-width')
        const numericWidth = parseInt(width)
        if (!isNaN(numericWidth)) {
          setSidebarWidth(numericWidth)
        }
      }
    }

    updateWidth()
    const observer = new MutationObserver(updateWidth)
    const sidebarWrapper = document.querySelector('[data-slot="sidebar-wrapper"]')
    if (sidebarWrapper) {
      observer.observe(sidebarWrapper, { attributes: true, attributeFilter: ['style'] })
    }

    return () => observer.disconnect()
  }, [state])

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
    url: transformUrl(item.url)
  }))

  const homeUrl = orgId ? `/org/${orgId}/oversikt` : "/oversikt"

  const isAdmin = user?.role === "admin"

  // Calculate dynamic sizes based on sidebar width (200-400px range)
  // Normalize to 0-1 scale where 0 = min width (200px), 1 = max width (400px)
  const widthScale = Math.max(0, Math.min(1, (sidebarWidth - 200) / 200))

  // Dynamic icon size: 16px to 20px for secondary navigation
  const iconSize = state === "collapsed" ? 16 : Math.round(16 + widthScale * 4)

  // Dynamic text size class for secondary navigation
  const headerTextSize = state === "collapsed" ? "text-sm" : widthScale > 0.5 ? "text-base" : "text-sm"

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
        <NavMain items={navReportsWithOrgId} label="Rapporter" />
        <NavMain items={navBilkollenWithOrgId} label="Bilkollen" />
        <NavMain items={navManagementWithOrgId} label="Hantering" />
        {isAdmin && <NavMain items={navAdminWithOrgId} label="Administration" />}
        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="sm"
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                  >
                    <Sun
                      className="rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0"
                      style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                    />
                    <Moon
                      className="absolute rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100"
                      style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                    />
                    <span className={cn("transition-all duration-200", headerTextSize)}>Theme</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {navSecondaryWithOrgId.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="sm">
                      <Link href={item.url} onClick={handleHeaderClick}>
                        <item.icon
                          className="transition-all duration-200"
                          style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                        />
                        <span className={cn("transition-all duration-200", headerTextSize)}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <NavUser user={user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
