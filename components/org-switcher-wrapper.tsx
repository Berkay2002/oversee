import { getUserOrganizations } from "@/lib/org/server";
import { OrgSwitcher } from "./org-switcher";

interface OrgSwitcherWrapperProps {
  currentOrgId: string;
  userId: string;
}

export async function OrgSwitcherWrapper({
  currentOrgId,
  userId,
}: OrgSwitcherWrapperProps) {
  // Use the passed userId to avoid another auth request
  const memberships = await getUserOrganizations(userId);

  const organizations = memberships.map((m) => ({
    id: m.org_id,
    name: m.org_name,
  }));

  return (
    <OrgSwitcher currentOrgId={currentOrgId} organizations={organizations} />
  );
}
