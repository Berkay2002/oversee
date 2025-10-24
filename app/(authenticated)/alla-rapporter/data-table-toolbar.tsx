"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { getTechnicians } from "@/app/(authenticated)/tekniker/actions"
import { getCategories } from "@/app/(authenticated)/kategorier/actions"
import { useEffect, useState } from "react"
import { Tables } from "@/types/database"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [technicians, setTechnicians] = useState<Tables<'technicians'>[]>([]);
  const [categories, setCategories] = useState<Tables<'categories'>[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [techniciansData, categoriesData] = await Promise.all([
        getTechnicians(),
        getCategories(),
      ]);
      setTechnicians(techniciansData);
      setCategories(categoriesData);
    }
    fetchData();
  }, []);

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const isFiltered = searchParams.has("search") || searchParams.has("technician") || searchParams.has("category");

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Problem..."
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(event) => handleSearch(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Select onValueChange={(value) => handleFilterChange('technician', value)} defaultValue={searchParams.get('technician') || ''}>
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Tekniker" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla tekniker</SelectItem>
            {technicians.map((technician) => (
              <SelectItem key={technician.id} value={technician.name}>
                {technician.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('category', value)} defaultValue={searchParams.get('category') || ''}>
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla kategorier</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.replace(pathname)}
          >
            Återställ
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
