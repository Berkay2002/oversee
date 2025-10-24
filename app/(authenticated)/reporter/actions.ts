/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

"use server";

import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/types/database";
import { revalidatePath, updateTag, cacheTag } from "next/cache";
import { cache } from "react";

export const getReporters = cache(async () => {
  cacheTag("reporters");
  const supabase = await createClient();
  const { data, error } = await supabase.from("reporters").select("*");
  if (error) {
    throw error;
  }
  return data;
});

export async function createReporter(
  values: Pick<Tables<'reporters'>, "name" | "description">
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("reporters")
    .insert([{ ...values, user_id: user.id }])
    .select();

  if (error) {
    throw error;
  }
  updateTag("reporters");
  return data;
}

export async function updateReporter(
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
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !reporter) {
    throw new Error("Reporter not found.");
  }

  if (reporter.user_id !== user.id) {
    throw new Error("You do not have permission to edit this reporter.");
  }

  const { data, error } = await supabase
    .from("reporters")
    .update(values)
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }
  updateTag("reporters");
  return data;
}

export async function deleteReporter(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: reporter, error: fetchError } = await supabase
    .from("reporters")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !reporter) {
    throw new Error("Reporter not found.");
  }

  if (reporter.user_id !== user.id) {
    throw new Error("You do not have permission to delete this reporter.");
  }

  const { data, error } = await supabase
    .from("reporters")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
  updateTag("reporters");
  return data;
}
