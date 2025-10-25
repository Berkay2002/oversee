import { getReporters } from "./actions";
import { columns } from "@/components/reporters/columns";
import { DataTable } from "@/components/reporters/data-table";
import { ReporterForm } from "@/components/reporters/reporter-form";
import { createReporter } from "@/app/(authenticated)/reporter/actions";
import { Button } from "@/components/ui/button";

export default async function ReporterPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const data = await getReporters({ search });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Rapportörer</h1>
        <ReporterForm onSave={createReporter}>
          <Button size="sm">Ny rapportör</Button>
        </ReporterForm>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
