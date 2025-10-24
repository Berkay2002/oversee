import { getUsers } from "./actions";
import { columns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";

export default async function AnvandarePage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
