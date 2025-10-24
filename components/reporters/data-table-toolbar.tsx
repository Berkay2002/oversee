"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { ReporterForm } from "./reporter-form"
import { createReporter } from "@/app/(authenticated)/reporter/actions"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Namn..."
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(event) => handleSearch(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Återställ
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        <ReporterForm onSave={createReporter}>
          <Button size="sm">Ny rapportör</Button>
        </ReporterForm>
      </div>
    </div>
  )
}
