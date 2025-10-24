import { columns } from "@/components/technicians/columns";
import { DataTable } from "@/components/technicians/data-table";
import { getTechnicians } from "./actions";

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const technicians = await getTechnicians({ search });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Technicians</h1>
      <DataTable columns={columns} data={technicians} />
    </div>
  );
}
