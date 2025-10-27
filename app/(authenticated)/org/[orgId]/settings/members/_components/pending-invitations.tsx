import { listPendingInvitations, cancelInvitation, resendInvitation } from "../invite/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MailIcon, XIcon, RefreshCwIcon } from "lucide-react";

interface PendingInvitationsProps {
  orgId: string;
}

export async function PendingInvitations({ orgId }: PendingInvitationsProps) {
  const invitations = await listPendingInvitations(orgId);

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MailIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Väntande inbjudningar</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{invitation.email}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {invitation.role === "admin" ? "Administratör" : "Medlem"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Utgår {new Date(invitation.expires_at).toLocaleDateString("sv-SE")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <form action={resendInvitation.bind(null, invitation.id, orgId)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    title="Skicka inbjudan igen"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </form>

                <form action={cancelInvitation.bind(null, invitation.id, orgId)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    title="Avbryt inbjudan"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
