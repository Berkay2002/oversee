"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_cache, updateTag } from "next/cache";

export async function getUsers() {
  const supabase = await createClient();

  const getUsersFromDb = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Could not fetch users.");
    }
    return data;
  };

  const getCachedUsers = unstable_cache(getUsersFromDb, ["users"], {
    tags: ["users"],
  });

  return getCachedUsers();
}

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

export async function updateUserRole({
  userId,
  role,
}: {
  userId: string;
  role: "admin" | "user";
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    throw error;
  }

  updateTag("users");
  return data;
}
