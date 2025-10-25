import { getReports } from '@/lib/actions/report';
import { AllaRapporter } from './alla-rapporter';

type SearchParams = {
  search?: string;
  technician?: string;
  category?: string;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function AllaRapporterPage({
  params,
  searchParams,
}: PageProps) {
  const { orgId } = await params;
  const resolvedSearchParams = await searchParams;
  const { search, technician, category, page, pageSize } = resolvedSearchParams;

  const { data: reports, count } = await getReports(orgId, {
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
      <AllaRapporter reports={reports} count={count} orgId={orgId} />
    </div>
  );
}
