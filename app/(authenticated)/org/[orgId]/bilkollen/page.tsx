'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { VehicleCasesTable } from '@/components/vehicle-cases/vehicle-cases-table';
import { VehicleCasesToolbar } from '@/components/vehicle-cases/vehicle-cases-toolbar';
import { AddVehicleDialog } from '@/components/vehicle-cases/add-vehicle-dialog';
import { MarkKlarDialog } from '@/components/vehicle-cases/mark-klar-dialog';
import { VehicleCaseDrawer } from '@/components/vehicle-cases/vehicle-case-drawer';
import { EmptyState } from '@/components/vehicle-cases/empty-state';
import { createColumns, type VehicleCaseColumnMeta } from '@/components/vehicle-cases/columns';
import {
  getVehicleCases,
  getOrgLocations,
  getOrgMembers,
  createVehicleCase,
  updateVehicleCase,
  markVehicleCaseKlar,
  deleteVehicleCase,
  getVehicleCaseAudits,
  getVehicleCaseAnalytics,
  type VehicleCaseView,
  type VehicleCaseFilters,
} from '@/lib/actions/vehicle';
import { useOrg, useIsOrgAdmin } from '@/lib/org/context';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function BilkollenPage() {
  const { activeOrg } = useOrg();
  const orgId = activeOrg.id;
  const isOrgAdmin = useIsOrgAdmin();

  // State for tabs
  const [activeTab, setActiveTab] = React.useState<'ongoing' | 'archive'>('ongoing');

  // State for filters
  const [searchValue, setSearchValue] = React.useState('');
  const [fundingSourceFilter, setFundingSourceFilter] = React.useState('all');
  const [insuranceStatusFilter, setInsuranceStatusFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');

  // State for pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // State for data
  const [ongoingCases, setOngoingCases] = React.useState<VehicleCaseView[]>([]);
  const [archivedCases, setArchivedCases] = React.useState<VehicleCaseView[]>([]);
  const [ongoingCount, setOngoingCount] = React.useState(0);
  const [archivedCount, setArchivedCount] = React.useState(0);
  const [locations, setLocations] = React.useState<Array<{ id: string; name: string; is_default: boolean | null }>>([]);
  const [members, setMembers] = React.useState<Array<{ user_id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // State for dialogs
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [klarDialogOpen, setKlarDialogOpen] = React.useState(false);
  const [selectedCaseForKlar, setSelectedCaseForKlar] = React.useState<VehicleCaseView | null>(null);

  // State for drawer (archive details)
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedCaseForDrawer, setSelectedCaseForDrawer] = React.useState<VehicleCaseView | null>(null);
  const [audits, setAudits] = React.useState<Array<{
    id: string;
    case_id: string;
    changed_by: string;
    field: string;
    old_value: string | null;
    new_value: string | null;
    changed_at: string;
    snapshot: unknown;
    profiles: { name: string } | null;
  }> | null>(null);
  const [analytics, setAnalytics] = React.useState<{
    case_id: string;
    insurance_approved_at: string | null;
    photo_done_at: string | null;
    klar_at: string | null;
  } | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = React.useState(false);

  // Compute filters
  const filters: VehicleCaseFilters = React.useMemo(() => {
    const f: VehicleCaseFilters = {
      page: currentPage,
      pageSize,
    };
    if (searchValue) f.search = searchValue;
    if (fundingSourceFilter !== 'all') f.funding_source = fundingSourceFilter as 'insurance' | 'internal' | 'customer';
    if (insuranceStatusFilter !== 'all') f.insurance_status = insuranceStatusFilter as 'pending' | 'approved' | 'rejected';
    if (locationFilter !== 'all') f.location = locationFilter;
    return f;
  }, [searchValue, fundingSourceFilter, insuranceStatusFilter, locationFilter, currentPage, pageSize]);

  // Fetch initial data
  React.useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [locsData, membersData] = await Promise.all([
          getOrgLocations(orgId),
          getOrgMembers(orgId),
        ]);
        setLocations(locsData);
        setMembers(membersData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Kunde inte hämta data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [orgId]);

  // Fetch cases based on active tab and filters
  React.useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'ongoing') {
          const { data, count } = await getVehicleCases(orgId, false, filters);
          setOngoingCases(data);
          setOngoingCount(count);
        } else {
          const { data, count } = await getVehicleCases(orgId, true, filters);
          setArchivedCases(data);
          setArchivedCount(count);
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
        toast.error('Kunde inte hämta fordon');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [orgId, activeTab, filters]);

  // Handlers
  const handleAddVehicle = async (registrationNumber: string) => {
    const result = await createVehicleCase(orgId, registrationNumber);
    if (result.error) {
      throw new Error(result.error);
    }
    toast.success('Fordon tillagt');
    // Refresh ongoing cases
    const { data, count } = await getVehicleCases(orgId, false, filters);
    setOngoingCases(data);
    setOngoingCount(count);
  };

  const handleUpdateCase = React.useCallback(async (
    caseId: string,
    field: string,
    value: string | boolean | null,
    oldValue: string | boolean | null
  ) => {
    // Build update object
    const updates: Partial<VehicleCaseView> = { [field]: value } as Partial<VehicleCaseView>;

    // Convert values to strings for audit log
    const oldValueStr = oldValue === null ? 'null' : String(oldValue);
    const newValueStr = value === null ? 'null' : String(value);

    // Optimistically update the UI
    const updateCaseInList = (cases: VehicleCaseView[]) =>
      cases.map((c) => (c.id === caseId ? { ...c, [field]: value } : c));

    if (activeTab === 'ongoing') {
      setOngoingCases((prev) => updateCaseInList(prev));
    }

    try {
      const result = await updateVehicleCase(orgId, caseId, updates, field, oldValueStr, newValueStr);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Ändring sparad');
    } catch (error) {
      // Revert optimistic update on error
      const { data } = await getVehicleCases(orgId, activeTab === 'archive', filters);
      if (activeTab === 'ongoing') {
        setOngoingCases(data);
      } else {
        setArchivedCases(data);
      }
      console.error('Error updating case:', error);
      toast.error('Kunde inte spara ändring');
    }
  }, [orgId, activeTab, filters]);

  const handleMarkKlar = React.useCallback((caseId: string) => {
    const caseToMark = ongoingCases.find((c) => c.id === caseId);
    if (caseToMark) {
      setSelectedCaseForKlar(caseToMark);
      setKlarDialogOpen(true);
    }
  }, [ongoingCases]);

  const handleConfirmMarkKlar = async () => {
    if (!selectedCaseForKlar) return;

    const result = await markVehicleCaseKlar(orgId, selectedCaseForKlar.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Fordon markerat som klart och arkiverat');

    // Refresh both views
    const [ongoing, archived] = await Promise.all([
      getVehicleCases(orgId, false, filters),
      getVehicleCases(orgId, true, filters),
    ]);
    setOngoingCases(ongoing.data);
    setOngoingCount(ongoing.count);
    setArchivedCases(archived.data);
    setArchivedCount(archived.count);
  };

  const handleDeleteCase = React.useCallback(async (caseId: string) => {
    const caseToDelete =
      ongoingCases.find((c) => c.id === caseId) ||
      archivedCases.find((c) => c.id === caseId);

    if (!caseToDelete) return;

    const confirmed = window.confirm(
      `Är du säker på att du vill ta bort ärendet för ${caseToDelete.registration_number}?`
    );

    if (!confirmed) return;

    const result = await deleteVehicleCase(orgId, caseId);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Fordonet har tagits bort');

    // Refresh both views
    const [ongoing, archived] = await Promise.all([
      getVehicleCases(orgId, false, filters),
      getVehicleCases(orgId, true, filters),
    ]);
    setOngoingCases(ongoing.data);
    setOngoingCount(ongoing.count);
    setArchivedCases(archived.data);
    setArchivedCount(archived.count);
  }, [orgId, ongoingCases, archivedCases, filters]);

  const handleViewDetails = React.useCallback(async (caseId: string) => {
    const caseToView = archivedCases.find((c) => c.id === caseId);
    if (!caseToView) return;

    setSelectedCaseForDrawer(caseToView);
    setDrawerOpen(true);
    setIsDrawerLoading(true);

    try {
      const [auditsData, analyticsData] = await Promise.all([
        getVehicleCaseAudits(caseId),
        getVehicleCaseAnalytics(caseId),
      ]);
      setAudits(auditsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching case details:', error);
      toast.error('Kunde inte hämta detaljer');
    } finally {
      setIsDrawerLoading(false);
    }
  }, [archivedCases]);

  const handleClearFilters = () => {
    setSearchValue('');
    setFundingSourceFilter('all');
    setInsuranceStatusFilter('all');
    setLocationFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchValue ||
    fundingSourceFilter !== 'all' ||
    insuranceStatusFilter !== 'all' ||
    locationFilter !== 'all'
  );

  // Column definitions with memoization
  const ongoingColumns = React.useMemo(() => {
    const meta: VehicleCaseColumnMeta = {
      orgId,
      locations,
      members,
      onUpdate: handleUpdateCase,
      onMarkKlar: handleMarkKlar,
      onViewDetails: () => {},
      onDelete: handleDeleteCase,
      isArchive: false,
      isOrgAdmin,
    };
    return createColumns(meta);
  }, [orgId, locations, members, handleUpdateCase, handleMarkKlar, handleDeleteCase, isOrgAdmin]);

  const archiveColumns = React.useMemo(() => {
    const meta: VehicleCaseColumnMeta = {
      orgId,
      locations,
      members,
      onUpdate: () => Promise.resolve(),
      onMarkKlar: () => {},
      onViewDetails: handleViewDetails,
      onDelete: handleDeleteCase,
      isArchive: true,
      isOrgAdmin,
    };
    return createColumns(meta);
  }, [orgId, locations, members, handleViewDetails, handleDeleteCase, isOrgAdmin]);

  const ongoingPageCount = Math.ceil(ongoingCount / pageSize);
  const archivePageCount = Math.ceil(archivedCount / pageSize);

  if (isLoading && locations.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-0">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-10 md:px-0">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Bilkollen</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Hantera och spåra fordon genom hela arbetsflödet
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as 'ongoing' | 'archive');
          setCurrentPage(1);
        }}>
          <TabsList>
            <TabsTrigger value="ongoing">
              Pågående ({ongoingCount})
            </TabsTrigger>
            <TabsTrigger value="archive">
              Arkiv ({archivedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <VehicleCasesToolbar
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  fundingSourceFilter={fundingSourceFilter}
                  onFundingSourceChange={setFundingSourceFilter}
                  insuranceStatusFilter={insuranceStatusFilter}
                  onInsuranceStatusChange={setInsuranceStatusFilter}
                  locationFilter={locationFilter}
                  onLocationChange={setLocationFilter}
                  locations={locations}
                  onAddVehicle={() => setAddDialogOpen(true)}
                  onClearFilters={handleClearFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </CardContent>
            </Card>

            {locations.length === 0 ? (
              <EmptyState
                type="no-locations"
              />
            ) : ongoingCount === 0 && !isLoading ? (
              <EmptyState
                type={hasActiveFilters ? 'no-results' : 'no-vehicles'}
                onAction={hasActiveFilters ? handleClearFilters : () => setAddDialogOpen(true)}
              />
            ) : (
              <VehicleCasesTable
                columns={ongoingColumns}
                data={ongoingCases}
                pageCount={ongoingPageCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="archive" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <VehicleCasesToolbar
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  fundingSourceFilter={fundingSourceFilter}
                  onFundingSourceChange={setFundingSourceFilter}
                  insuranceStatusFilter={insuranceStatusFilter}
                  onInsuranceStatusChange={setInsuranceStatusFilter}
                  locationFilter={locationFilter}
                  onLocationChange={setLocationFilter}
                  locations={locations}
                  onAddVehicle={() => setAddDialogOpen(true)}
                  onClearFilters={handleClearFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </CardContent>
            </Card>

            {archivedCount === 0 && !isLoading ? (
              <EmptyState
                type={hasActiveFilters ? 'no-results' : 'no-vehicles'}
                onAction={hasActiveFilters ? handleClearFilters : undefined}
                actionLabel={hasActiveFilters ? 'Rensa filter' : undefined}
              />
            ) : (
              <VehicleCasesTable
                columns={archiveColumns}
                data={archivedCases}
                pageCount={archivePageCount}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddVehicleDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddVehicle}
      />

      <MarkKlarDialog
        open={klarDialogOpen}
        onOpenChange={setKlarDialogOpen}
        vehicleCase={selectedCaseForKlar}
        onConfirm={handleConfirmMarkKlar}
      />

      <VehicleCaseDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        vehicleCase={selectedCaseForDrawer}
        audits={audits}
        analytics={analytics}
        isLoading={isDrawerLoading}
      />
    </div>
  );
}
