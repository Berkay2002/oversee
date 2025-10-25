import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/org/server";
import { OrgSwitcher } from "./org-switcher";

interface OrgSwitcherWrapperProps {
  currentOrgId: string;
}

export async function OrgSwitcherWrapper({
  currentOrgId,
}: OrgSwitcherWrapperProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const memberships = await getUserOrganizations(user.id);

  const organizations = memberships.map((m) => ({
    id: m.org_id,
    name: m.org_name,
  }));

  return (
    <OrgSwitcher currentOrgId={currentOrgId} organizations={organizations} />
  );
}
