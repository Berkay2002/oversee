/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/types/database";
import { revalidatePath, updateTag } from "next/cache";

export const getReporters = async (
  orgId: string,
  { search }: { search?: string } = {}
) => {
  const supabase = await createClient();

  let query = supabase
    .from("reporters")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching reporters:", error);
    throw new Error("Could not fetch reporters.");
  }
  return data;
};

export async function createReporter(
  orgId: string,
  values: Pick<Tables<'reporters'>, "name" | "description">
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("reporters")
    .insert([{ ...values, user_id: user.id, org_id: orgId }])
    .select();

  if (error) {
    throw error;
  }
  updateTag(`reporters-${orgId}`);
  return data;
}

export async function updateReporter(
  orgId: string,
  id: string,
  values: Pick<Tables<'reporters'>, "name" | "description">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: reporter, error: fetchError } = await supabase
    .from("reporters")
    .select("user_id, org_id")
    .eq("id", id)
    .single();

  if (fetchError || !reporter) {
    throw new Error("Reporter not found.");
  }

  if (reporter.org_id !== orgId) {
    throw new Error("Reporter does not belong to this organization.");
  }

  if (reporter.user_id !== user.id) {
    throw new Error("You do not have permission to edit this reporter.");
  }

  const { data, error } = await supabase
    .from("reporters")
    .update(values)
    .eq("id", id)
    .eq("org_id", orgId)
    .select();

  if (error) {
    throw error;
  }
  updateTag(`reporters-${orgId}`);
  return data;
}

export async function deleteReporter(orgId: string, id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: reporter, error: fetchError } = await supabase
    .from("reporters")
    .select("user_id, org_id")
    .eq("id", id)
    .single();

  if (fetchError || !reporter) {
    throw new Error("Reporter not found.");
  }

  if (reporter.org_id !== orgId) {
    throw new Error("Reporter does not belong to this organization.");
  }

  if (reporter.user_id !== user.id) {
    throw new Error("You do not have permission to delete this reporter.");
  }

  const { data, error } = await supabase
    .from("reporters")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw error;
  }
  updateTag(`reporters-${orgId}`);
  return data;
}
