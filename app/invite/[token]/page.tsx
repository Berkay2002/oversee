import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server";
import { acceptInvitation } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invitation } = await supabase
    .from("org_invitations")
    .select("*, organizations(name)")
    .eq("token", token)
    .single();

  // Invalid invitation
  if (!invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Ogiltig inbjudan</CardTitle>
            </div>
            <CardDescription>
              Denna inbjudan hittades inte i systemet.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Gå till startsidan</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Expired invitation
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Utgången inbjudan</CardTitle>
            </div>
            <CardDescription>
              Denna inbjudan gick ut {new Date(invitation.expires_at).toLocaleDateString("sv-SE")}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kontakta en administratör i organisationen för att få en ny inbjudan.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Gå till startsidan</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already accepted invitation
  if (invitation.accepted_at) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>Redan accepterad</CardTitle>
            </div>
            <CardDescription>
              Denna inbjudan har redan accepterats.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href={`/org/${invitation.org_id}/oversikt`}>
                Gå till organisationen
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const user = await getUser();

  // Not authenticated - redirect to signup with pre-filled email
  if (!user) {
    return redirect(`/sign-in?email=${encodeURIComponent(invitation.email)}&returnTo=/invite/${token}`);
  }

  // Check if email matches (security check)
  if (user.email !== invitation.email) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>E-post matchar inte</CardTitle>
            </div>
            <CardDescription>
              Denna inbjudan är avsedd för en annan e-postadress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Inbjudan skickad till:</strong> {invitation.email}
                <br />
                <strong>Du är inloggad som:</strong> {user.email}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Vänligen logga in med rätt e-postadress eller be om en ny inbjudan till din nuvarande e-postadress.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <a href="/login">Logga in med annan e-post</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const roleIcons = {
    owner: Shield,
    admin: Shield,
    member: Users,
  };

  const RoleIcon = roleIcons[invitation.role as keyof typeof roleIcons] || Users;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Du är inbjuden!</CardTitle>
          </div>
          <CardDescription>
            Du har blivit inbjuden att gå med i organisationen{" "}
            <strong>{invitation.organizations?.name}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <RoleIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Roll:</span>
            <Badge variant="secondary">
              {invitation.role === "admin" ? "Administratör" : "Medlem"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Genom att acceptera får du tillgång till organisationens data och verktyg.
          </p>
        </CardContent>

        <CardFooter className="flex gap-2">
          <form action={acceptInvitation.bind(null, token)} className="flex-1">
            <Button type="submit" className="w-full">
              Acceptera inbjudan
            </Button>
          </form>

          <Button variant="outline" asChild>
            <a href="/">Avböj</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
