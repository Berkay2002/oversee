import { getReports } from './actions';
import { AllaRapporter } from './alla-rapporter';

type SearchParams = {
  search?: string;
  technician?: string;
  category?: string;
  page?: string;
  pageSize?: string;
};

export default async function AllaRapporterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const { search, technician, category, page, pageSize } = resolvedSearchParams;

  const { data: reports, count } = await getReports({
    search,
    technician,
    category,
    page: parseInt(page || '1'),
    pageSize: parseInt(pageSize || '10'),
  });

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h3 className="text-lg font-medium">All Reports</h3>
        <p className="text-sm text-muted-foreground">
          Browse and manage all reports.
        </p>
      </div>
      <AllaRapporter reports={reports} count={count} />
    </div>
  );
}
