import { getReports } from './actions';
import { columns } from '@/app/(authenticated)/alla-rapporter/columns';
import { DataTable } from '@/app/(authenticated)/alla-rapporter/data-table';

type SearchParams = {
  search?: string;
  technician?: string;
  category?: string;
  page?: string;
};

export default async function AllaRapporterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const reports = await getReports({
    search: searchParams.search,
    technician: searchParams.technician,
    category: searchParams.category,
    page: parseInt(searchParams.page || '1'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">All Reports</h3>
        <p className="text-sm text-muted-foreground">
          Browse and manage all reports.
        </p>
      </div>
      <DataTable columns={columns} data={reports} />
    </div>
  );
}
