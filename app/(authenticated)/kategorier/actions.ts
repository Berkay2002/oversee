"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_cache as cache } from "next/cache";

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
