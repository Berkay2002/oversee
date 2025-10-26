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
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök reg.nr..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Funding Source Filter */}
          <Select value={fundingSourceFilter} onValueChange={onFundingSourceChange}>
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[160px]">
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
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Rensa filter
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Add Vehicle Button */}
        <Button onClick={onAddVehicle} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Lägg till bil
        </Button>
      </div>
    </div>
  );
}
