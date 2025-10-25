import { redirect } from "next/navigation";

interface OrgPageProps {
  params: Promise<{ orgId: string }>;
}

/**
 * Organization root page
 * Redirects to the oversikt (overview) page
 */
export default async function OrgPage({ params }: OrgPageProps) {
  const { orgId } = await params;
  redirect(`/org/${orgId}/oversikt`);
}
