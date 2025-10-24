"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalReports: number
}

export function DataTablePagination<TData>({
  table,
  totalReports,
}: DataTablePaginationProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-2 sm:justify-between">
      <div className="text-muted-foreground text-sm">
        {table.getFilteredSelectedRowModel().rows.length} / {totalReports}{" "}
        valda.
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rader</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const params = new URLSearchParams(searchParams.toString())
              params.set("pageSize", value)
              params.set("page", "1")
              router.push(`${pathname}?${params.toString()}`)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Sida {table.getState().pagination.pageIndex + 1} av{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() =>
              router.push(`${pathname}?${createQueryString("page", "1")}`)
            }
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Gå till första sidan</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() =>
              router.push(
                `${pathname}?${createQueryString(
                  "page",
                  `${table.getState().pagination.pageIndex}`
                )}`
              )
            }
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Gå till föregående sida</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() =>
              router.push(
                `${pathname}?${createQueryString(
                  "page",
                  `${table.getState().pagination.pageIndex + 2}`
                )}`
              )
            }
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Gå till nästa sida</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() =>
              router.push(
                `${pathname}?${createQueryString(
                  "page",
                  `${table.getPageCount()}`
                )}`
              )
            }
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Gå till sista sidan</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
