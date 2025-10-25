/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag, updateTag } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const getCategories = async (
  orgId: string,
  { search }: { search?: string } = {}
) => {
  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Could not fetch categories.");
  }
  return data;
};

export async function createCategory(
  orgId: string,
  values: z.infer<typeof categorySchema>
) {
  const validatedValues = categorySchema.parse(values);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...validatedValues, org_id: orgId })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    throw new Error("Could not create category.");
  }

  updateTag(`categories-${orgId}`);
  return data;
}

export async function updateCategory(
  orgId: string,
  id: string,
  values: z.infer<typeof categorySchema>
) {
  const validatedValues = categorySchema.parse(values);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update(validatedValues)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    throw new Error("Could not update category.");
  }

  updateTag(`categories-${orgId}`);
  return data;
}

export async function deleteCategory(orgId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    console.error("Error deleting category:", error);
    throw new Error("Could not delete category.");
  }

  updateTag(`categories-${orgId}`);
  return data;
}
