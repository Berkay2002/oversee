"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    {
      name: "Översikt",
      href: `/org/${orgId}/settings`,
      value: "settings",
    },
    {
      name: "Medlemmar",
      href: `/org/${orgId}/settings/members`,
      value: "members",
    },
  ]

  const currentTab =
    navLinks.find((link) => pathname === link.href)?.value ?? "settings"

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">

      <div className="flex flex-col gap-6">
        <Tabs value={currentTab} className="w-full">
          <TabsList>
            {navLinks.map((link) => (
              <TabsTrigger key={link.href} value={link.value} asChild>
                <Link href={link.href}>{link.name}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex-1">
          <div className="space-y-8 lg:max-w-4xl">{children}</div>
        </div>
      </div>
    </section>
  )
}
