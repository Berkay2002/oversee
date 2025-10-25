import { columns } from "@/components/technicians/columns";
import { DataTable } from "@/components/technicians/data-table";
import { getTechnicians } from "@/lib/actions/technician";
import { TechnicianFormWrapper } from "@/lib/wrappers/technician-form-wrapper";
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
        <TechnicianFormWrapper orgId={orgId}>
          <Button size="sm">Ny tekniker</Button>
        </TechnicianFormWrapper>
      </div>
      <DataTable columns={columns} data={technicians}/>
    </div>
  );
}
