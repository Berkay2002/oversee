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
  searchParams: Promise<SearchParams>;
}) {
  const { search, technician, category, page } = await searchParams;

  const reports = await getReports({
    search,
    technician,
    category,
    page: parseInt(page || '1'),
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
