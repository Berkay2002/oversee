"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type OrgMember = {
  userId: string;
  name: string;
  email: string;
  role: Database["public"]["Enums"]["org_role"];
};

export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  const supabase = await createClient();

  // Step 1: Get member user IDs and roles
  const { data: members, error: membersError } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("org_id", orgId);

  if (membersError) {
    console.error("Error fetching org member IDs:", membersError);
    return [];
  }
  if (!members) {
    return [];
  }

  const userIds = members.map((m) => m.user_id);
  if (userIds.length === 0) {
    return [];
  }

  // Step 2: Get profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, name")
    .in("user_id", userIds);

  if (profilesError) {
    console.error("Error fetching member profiles:", profilesError);
    return [];
  }

  // Step 3: Get emails from auth.users via RPC function
  const { data: users, error: usersError } = await supabase
    .rpc("get_users_emails", { user_ids: userIds });

  if (usersError) {
    console.error("Error fetching user emails:", usersError);
    return [];
  }

  // Step 4: Combine member, profile, and email data
  const orgMembers = members.map((member) => {
    const profile = profiles?.find((p) => p.user_id === member.user_id);
    const user = (users as { id: string; email: string }[] | null)?.find((u) => u.id === member.user_id);
    return {
      userId: member.user_id,
      name: profile?.name ?? "No name",
      email: user?.email ?? "No email",
      role: member.role,
    };
  });

  return orgMembers;
}
