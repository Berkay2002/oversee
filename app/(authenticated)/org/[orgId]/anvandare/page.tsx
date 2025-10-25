import { getUsersByOrg } from "@/lib/actions/user";
import { columns } from "@/components/users/columns";
import { DataTable } from "@/components/users/data-table";
import { UserForm } from "@/components/users/user-form";
import { inviteUser } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";

import { use } from "react";

export default function AnvandarePage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { orgId } = use(params);
  const { search } = use(searchParams);
  const users = use(getUsersByOrg(orgId, search));

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
