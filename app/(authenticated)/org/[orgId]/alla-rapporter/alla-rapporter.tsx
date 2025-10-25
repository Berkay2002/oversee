"use client"

import { useSearchParams } from "next/navigation"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Report } from "@/lib/schemas/report"

export function AllaRapporter({
  reports,
  count,
  orgId
}: {
  reports: Report[]
  count: number
  orgId: string
}) {
  const searchParams = useSearchParams()
  const key = searchParams.toString()

  return (
    <DataTable
      key={key}
      columns={columns}
      data={reports}
      pageCount={count}
      orgId={orgId}
    />
  )
}
