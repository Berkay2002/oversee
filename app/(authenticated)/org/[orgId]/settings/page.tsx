import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveOrgForUser, type ActiveOrg } from "@/lib/org/server";
import { getUser } from "@/lib/supabase/server";
import { OrgNameForm } from "./_components/org-name-form";
import { DeleteOrgForm } from "./_components/delete-org-form";

interface SettingsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

const roleLabels: Record<ActiveOrg["role"], string> = {
  owner: "Ägare",
  admin: "Administratör",
  member: "Medlem",
};

const roleDescriptions: Record<ActiveOrg["role"], string> = {
  owner: "Fullständig åtkomst till alla organisationsinställningar.",
  admin: "Kan hantera organisationen och medlemmar.",
  member: "Har begränsad åtkomst till administrativa funktioner.",
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId } = await params;

  const user = await getUser();
  if (!user) {
    return redirect("/login");
  }

  const activeOrg = await getActiveOrgForUser(orgId, user.id);

  if (!activeOrg) {
    return redirect("/");
  }

  const canEdit = activeOrg.role === "owner" || activeOrg.role === "admin";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canDelete = activeOrg.role === "owner";
  const createdAt = new Date(activeOrg.created_at);
  const formattedCreatedAt = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(createdAt);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Inställningar</h1>
          <p className="text-muted-foreground">
            Hantera inställningarna för <span className="font-medium text-foreground">{activeOrg.name}</span>.
          </p>
        </div>
      </header>

      <div className="grid gap-8">
        <OrgNameForm orgId={activeOrg.id} orgName={activeOrg.name} disabled={!canEdit} />

        <Card>
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Organisation</CardTitle>
              <CardDescription>
                Samlad information om organisationen och din åtkomstnivå.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="w-fit rounded-md border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
            >
              {roleLabels[activeOrg.role]}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Organisationens ID
              </p>
              <p className="mt-1 font-mono text-sm text-foreground">{activeOrg.id}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skapad</p>
              <p className="mt-1 text-sm text-foreground">{formattedCreatedAt}</p>
            </div>
            <div className="sm:col-span-2 rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Din roll</p>
              <p className="mt-1 text-sm text-foreground">{roleDescriptions[activeOrg.role]}</p>
            </div>
          </CardContent>
        </Card>

        <DeleteOrgForm orgId={activeOrg.id} orgName={activeOrg.name} />
      </div>
    </div>
  );
}
