import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server";
import { acceptInvitation } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const supabase = await createClient();
  const { data: invitation } = await supabase
    .from("org_invitations")
    .select("*, organizations(name)")
    .eq("token", params.token)
    .single();

  if (!invitation || new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ogiltig inbjudan</CardTitle>
            <CardDescription>
              Denna inbjudan är ogiltig eller har gått ut.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const user = await getUser();
  if (!user) {
    return redirect(`/login?returnTo=/invite/${params.token}`);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Du är inbjuden!</CardTitle>
          <CardDescription>
            Du har blivit inbjuden att gå med i organisationen{" "}
            <strong>{invitation.organizations?.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Klicka på knappen nedan för att acceptera inbjudan.</p>
        </CardContent>
        <CardFooter>
          <form action={acceptInvitation.bind(null, params.token)}>
            <Button type="submit">Acceptera inbjudan</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
