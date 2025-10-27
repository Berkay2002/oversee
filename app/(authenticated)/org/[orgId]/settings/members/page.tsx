import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveOrgForUser } from "@/lib/org/server";
import { getUser } from "@/lib/supabase/server";
import { getOrgMembers } from "./actions";
import { InviteMemberButton } from "./_components/invite-member-button";
import { MembersTable } from "./_components/members-table";
import { PendingInvitations } from "./_components/pending-invitations";

interface MembersPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { orgId } = await params;

  const user = await getUser();
  if (!user) {
    return redirect("/login");
  }

  const { role } = await getActiveOrgForUser(orgId, user.id);
  const members = await getOrgMembers(orgId);

  const canManage = role === "owner" || role === "admin";
  const totalMembers = members.length;
  const adminCount = members.filter((member) => member.role === "admin" || member.role === "owner").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Medlemmar</CardTitle>
            <CardDescription>Överblick av alla medlemmar med roller och behörigheter.</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit rounded-md border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">
            Totalt {totalMembers}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aktiva medlemmar</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{totalMembers}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Administratörer</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{adminCount}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roll hantering</p>
            <p className="mt-2 text-sm text-foreground">
              {canManage ? "Du kan bjuda in och uppdatera roller." : "Kontakta en administratör för ändringar."}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Snabbåtgärder</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/org/${orgId}/settings`}>Inställningar</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/org/${orgId}/settings/members`}>Uppdatera lista</Link>
              </Button>
            </div>
          </div>
        </CardContent>
        {canManage && (
          <CardFooter className="justify-between border-t border-border/60 bg-muted/20 px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Bjud in nya medlemmar och tilldela roller efter behov.
            </div>
            <InviteMemberButton orgId={orgId} />
          </CardFooter>
        )}
      </Card>

      {canManage && <PendingInvitations orgId={orgId} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Medlemslista</CardTitle>
          <CardDescription>Detaljerad lista över alla medlemmar i organisationen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MembersTable data={members} currentUserId={user.id} canManage={canManage} />
        </CardContent>
      </Card>

      {!canManage && (
        <div className="rounded-lg border border-border/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          Du har läsbehörighet i denna organisation. Kontakta en administratör om du behöver göra ändringar.
        </div>
      )}
    </div>
  );
}
