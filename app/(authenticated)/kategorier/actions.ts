"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_cache as cache, revalidateTag } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function getCategories() {
  const supabase = await createClient();
  const fetchCategories = async () => {
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

  return cache(fetchCategories, ["categories"], {
    tags: ["categories"],
  })();
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

  revalidateTag("categories", 'max');
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

  revalidateTag("categories", 'max');
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

  revalidateTag("categories", 'max');
  return data;
}
