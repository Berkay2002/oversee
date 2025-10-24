"use client"

import { useSearchParams } from "next/navigation"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Report } from "@/lib/schemas/report"

export function AllaRapporter({ reports, count }: { reports: Report[], count: number }) {
  const searchParams = useSearchParams()
  const key = searchParams.toString()

  return (
    <DataTable
      key={key}
      columns={columns}
      data={reports}
      pageCount={count}
    />
  )
}
