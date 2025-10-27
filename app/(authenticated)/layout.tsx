import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
