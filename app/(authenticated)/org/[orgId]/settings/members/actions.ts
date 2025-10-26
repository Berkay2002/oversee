"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

export type OrgMember = {
  userId: string;
  name: string;
  email: string;
  role: Database["public"]["Enums"]["org_role"];
};

export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
      role,
      profiles (
        user_id,
        name
      )
    `
    )
    .eq("org_id", orgId);

  if (error) {
    console.error("Error fetching org members:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((member: any) => ({
    userId: member.profiles.user_id,
    name: member.profiles.name,
    email: member.profiles.email,
    role: member.role,
  }));
}
