import { Suspense } from "react";
import AuthenticatedLayoutContent from "./authenticated-layout-content";
import { headers } from "next/headers";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") || "";
  const showSidebar = !pathname.startsWith("/onboarding") && !pathname.startsWith("/create-organization");

  if (showSidebar) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
      </Suspense>
    );
  }

  return <>{children}</>;
}
