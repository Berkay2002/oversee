"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  label,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    adminOnly?: boolean
  }[]
  label?: string
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const [sidebarWidth, setSidebarWidth] = useState(256)

  // Track sidebar width changes
  useEffect(() => {
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

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Calculate dynamic sizes based on sidebar width (200-400px range)
  // Normalize to 0-1 scale where 0 = min width (200px), 1 = max width (400px)
  const widthScale = Math.max(0, Math.min(1, (sidebarWidth - 200) / 200))

  // Dynamic icon size: 16px (size-4) to 20px (size-5)
  const iconSize = state === "collapsed" ? 16 : Math.round(16 + widthScale * 4)

  // Dynamic text size class
  const textSize = state === "collapsed" ? "text-sm" : widthScale > 0.5 ? "text-base" : "text-sm"

  // Dynamic label text size
  const labelSize = state === "collapsed" ? "text-xs" : widthScale > 0.6 ? "text-sm" : "text-xs"

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className={cn("transition-all duration-200", labelSize)}>
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url} onClick={handleClick}>
                    {item.icon && (
                      <item.icon
                        className="transition-all duration-200"
                        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                      />
                    )}
                    <span className={cn("transition-all duration-200", textSize)}>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
