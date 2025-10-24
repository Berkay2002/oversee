import { getReporters } from "./actions";
import { columns } from "@/components/reporters/columns";
import { DataTable } from "@/components/reporters/data-table";

export default async function ReporterPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const data = await getReporters({ search });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Reporters</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
