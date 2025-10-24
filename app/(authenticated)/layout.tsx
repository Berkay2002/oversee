import { Suspense } from "react";
import AuthenticatedLayoutContent from "./authenticated-layout-content";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </Suspense>
  );
}
