import { columns } from "@/components/technicians/columns";
import { DataTable } from "@/components/technicians/data-table";
import { getTechnicians, createTechnician } from "./actions";
import { TechnicianForm } from "@/components/technicians/technician-form";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function TechniciansPage({
  params,
  searchParams,
}: PageProps) {
  const { orgId } = await params;
  const { search } = await searchParams;
  const technicians = await getTechnicians(orgId, { search });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tekniker</h1>
        <TechnicianForm onSave={(values) => createTechnician(orgId, values)}>
          <Button size="sm">Ny tekniker</Button>
        </TechnicianForm>
      </div>
      <DataTable columns={columns} data={technicians} orgId={orgId} />
    </div>
  );
}
