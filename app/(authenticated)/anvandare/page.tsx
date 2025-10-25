import { getUsers } from "./actions";
import { columns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";
import { UserForm } from "@/components/users/user-form";
import { inviteUser } from "@/app/(authenticated)/anvandare/actions";
import { Button } from "@/components/ui/button";

export default async function AnvandarePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const users = await getUsers({ search });

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Användarhantering</h1>
        <UserForm onSave={inviteUser}>
          <Button size="sm">Bjud in användare</Button>
        </UserForm>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
