import { getReports } from '@/lib/actions/report';
import { AllaRapporter } from './alla-rapporter';
import { Button } from '@/components/ui/button';

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
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Alla Rapporter</h1>
        <Button size="sm" asChild>
          <a href={`/org/${orgId}/ny-rapport`}>Ny rapport</a>
        </Button>
      </div>
      <AllaRapporter reports={reports} count={count} orgId={orgId} />
    </div>
  );
}
