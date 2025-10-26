'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, X } from 'lucide-react';

type VehicleCasesToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  fundingSourceFilter: string;
  onFundingSourceChange: (value: string) => void;
  insuranceStatusFilter: string;
  onInsuranceStatusChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  locations: Array<{ id: string; name: string }>;
  onAddVehicle: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

export function VehicleCasesToolbar({
  searchValue,
  onSearchChange,
  fundingSourceFilter,
  onFundingSourceChange,
  insuranceStatusFilter,
  onInsuranceStatusChange,
  locationFilter,
  onLocationChange,
  locations,
  onAddVehicle,
  onClearFilters,
  hasActiveFilters,
}: VehicleCasesToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Add Vehicle Button - Top on mobile */}
      <Button onClick={onAddVehicle} size="lg" className="w-full md:hidden">
        <Plus className="mr-2 h-4 w-4" />
        Lägg till bil
      </Button>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Sök reg.nr..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 pl-9 md:h-10"
        />
      </div>

      {/* Filters - Stacked on mobile, row on desktop */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
        {/* Funding Source Filter */}
        <Select value={fundingSourceFilter} onValueChange={onFundingSourceChange}>
          <SelectTrigger className="h-11 w-full md:h-10 md:w-[160px]">
            <SelectValue placeholder="Kostnadstyp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla kostnadstyper</SelectItem>
            <SelectItem value="insurance">Försäkring</SelectItem>
            <SelectItem value="internal">Intern</SelectItem>
            <SelectItem value="customer">Kund</SelectItem>
          </SelectContent>
        </Select>

        {/* Insurance Status Filter */}
        <Select
          value={insuranceStatusFilter}
          onValueChange={onInsuranceStatusChange}
        >
          <SelectTrigger className="h-11 w-full md:h-10 md:w-[180px]">
            <SelectValue placeholder="Försäkringsstatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla statusar</SelectItem>
            <SelectItem value="pending">Väntar försäkring</SelectItem>
            <SelectItem value="approved">Godkänd</SelectItem>
            <SelectItem value="rejected">Avslagen</SelectItem>
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select value={locationFilter} onValueChange={onLocationChange}>
          <SelectTrigger className="h-11 w-full md:h-10 md:w-[160px]">
            <SelectValue placeholder="Plats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla platser</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="lg"
            onClick={onClearFilters}
            className="w-full gap-2 md:h-10 md:w-auto md:gap-1 md:px-3"
          >
            Rensa filter
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Add Vehicle Button - Desktop only */}
        <Button onClick={onAddVehicle} size="sm" className="ml-auto hidden md:flex">
          <Plus className="mr-2 h-4 w-4" />
          Lägg till bil
        </Button>
      </div>
    </div>
  );
}
