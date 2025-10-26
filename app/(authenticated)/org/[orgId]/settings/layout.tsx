"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface SettingsLayoutProps {
  children: React.ReactNode
  params: Promise<{
    orgId: string
  }>
}

export default function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const pathname = usePathname()
  const { orgId } = React.use(params)

  const navLinks = [
    { name: "Översikt", href: `/org/${orgId}/settings` },
    { name: "Medlemmar", href: `/org/${orgId}/settings/members` },
  ]

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Inställningar</h2>
        <p className="text-muted-foreground text-base">
          Hantera din organisations inställningar och medlemmar.
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="shrink-0">
          <nav className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/10 p-1 sm:flex-row sm:gap-2 sm:p-2 lg:flex-col lg:p-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.name}
                  {isActive && <span className="ml-2 hidden text-xs font-semibold uppercase tracking-wide sm:inline">Aktiv</span>}
                </Link>
              )
            })}
          </nav>
        </aside>

        <Separator orientation="vertical" className="hidden h-full lg:block" />

        <div className="flex-1">
          <div className="space-y-8 lg:max-w-4xl">{children}</div>
        </div>
      </div>
    </section>
  )
}
