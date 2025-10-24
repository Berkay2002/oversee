"use server";

import { createClient } from "@/lib/supabase/server";
import { unstable_cache as cache, revalidateTag } from "next/cache";
import { z } from "zod";

const technicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function getTechnicians() {
  const supabase = await createClient();
  const fetchTechnicians = async () => {
    const { data, error } = await supabase
      .from("technicians")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching technicians:", error);
      throw new Error("Could not fetch technicians.");
    }
    return data;
  };

  return cache(fetchTechnicians, ["technicians"], {
    tags: ["technicians"],
  })();
}

export async function createTechnician(values: z.infer<typeof technicianSchema>) {
  const validatedValues = technicianSchema.parse(values);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technicians")
    .insert(validatedValues)
    .select()
    .single();

  if (error) {
    console.error("Error creating technician:", error);
    throw new Error("Could not create technician.");
  }

  revalidateTag("technicians", 'max');
  return data;
}

export async function updateTechnician(
  id: string,
  values: z.infer<typeof technicianSchema>
) {
  const validatedValues = technicianSchema.parse(values);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technicians")
    .update(validatedValues)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating technician:", error);
    throw new Error("Could not update technician.");
  }

  revalidateTag("technicians", 'max');
  return data;
}

export async function deleteTechnician(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technicians")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting technician:", error);
    throw new Error("Could not delete technician.");
  }

  revalidateTag("technicians", 'max');
  return data;
}
