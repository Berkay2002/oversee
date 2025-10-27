"use server";

import { createClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import { Database } from "@/types/database";

export async function inviteUser({ email }: { email: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    console.error("Error inviting user:", error);
    throw error;
  }

  updateTag("users");
  return data;
}

export const getUsersByOrg = async (
  orgId: string,
  search?: string,
): Promise<(Omit<Database["public"]["Tables"]["profiles"]["Row"], "role"> & { role: Database["public"]["Enums"]["org_role"] })[]> => {
  if (!orgId) {
    return [];
  }
  const supabase = await createClient();

  let query = supabase.from("organization_members").select(
    `
    role,
    profiles (
      *
    )
  `,
  )
    .eq("org_id", orgId);

  if (search) {
    query = query.ilike("profiles.name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching org members:", error);
    throw new Error("Could not fetch org members.");
  }

  return data.map((member) => {
    if (!member.profiles || Array.isArray(member.profiles)) {
      throw new Error("Invalid profile data structure");
    }
    const profile = member.profiles as Database["public"]["Tables"]["profiles"]["Row"];
    const { role: _profileRole, ...profileWithoutRole } = profile;
    return {
      ...profileWithoutRole,
      role: member.role,
    };
  });
};

export async function updateUserRole({
  userId,
  orgId,
  role,
}: {
  userId: string;
  orgId: string;
  role: "admin" | "member" | "owner";
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .update({ role })
    .eq("user_id", userId)
    .eq("org_id", orgId);

  if (error) {
    console.error("Error updating user role:", error);
    throw error;
  }

  updateTag("users");
  return data;
}
