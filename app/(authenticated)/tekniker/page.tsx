import { columns } from "@/components/technicians/columns";
import { DataTable } from "@/components/technicians/data-table";
import { getTechnicians } from "./actions";
import { TechnicianForm } from "@/components/technicians/technician-form";
import { createTechnician } from "@/app/(authenticated)/tekniker/actions";
import { Button } from "@/components/ui/button";

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const technicians = await getTechnicians({ search });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tekniker</h1>
        <TechnicianForm onSave={createTechnician}>
          <Button size="sm">Ny tekniker</Button>
        </TechnicianForm>
      </div>
      <DataTable columns={columns} data={technicians} />
    </div>
  );
}
