import { getReporters } from "@/lib/actions/reporter";
import { columns } from "@/components/reporters/columns";
import { DataTable } from "@/components/reporters/data-table";
import { ReporterFormWrapper } from "@/lib/wrappers/reporter-form-wrapper";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function ReporterPage({
  params,
  searchParams,
}: PageProps) {
  const { orgId } = await params;
  const { search } = await searchParams;
  const data = await getReporters(orgId, { search });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Rapportörer</h1>
        <ReporterFormWrapper orgId={orgId}>
          <Button size="sm">Ny rapportör</Button>
        </ReporterFormWrapper>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
