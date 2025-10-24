/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag, updateTag, unstable_cache } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function getCategories() {
  const supabase = await createClient();

  const getCategoriesFromDb = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Could not fetch categories.");
    }
    return data;
  };

  const getCachedCategories = unstable_cache(
    getCategoriesFromDb,
    ["categories"],
    {
      tags: ["categories"],
    }
  );

  return getCachedCategories();
}

export async function createCategory(values: z.infer<typeof categorySchema>) {
  const validatedValues = categorySchema.parse(values);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(validatedValues)
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    throw new Error("Could not create category.");
  }

  updateTag("categories");
  return data;
}

export async function updateCategory(
  id: string,
  values: z.infer<typeof categorySchema>
) {
  const validatedValues = categorySchema.parse(values);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update(validatedValues)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    throw new Error("Could not update category.");
  }

  updateTag("categories");
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    throw new Error("Could not delete category.");
  }

  updateTag("categories");
  return data;
}
