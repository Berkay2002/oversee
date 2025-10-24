/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidateTag, updateTag } from "next/cache";
import { z } from "zod";

const technicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color code"),
});

export const getTechnicians = async ({
  search,
}: { search?: string } = {}) => {
  const supabase = await createClient();

  let query = supabase
    .from("technicians")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching technicians:", error);
    throw new Error("Could not fetch technicians.");
  }
  return data;
};

export async function createTechnician(values: z.infer<typeof technicianSchema>) {
  const validatedValues = technicianSchema.parse(values);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("technicians")
    .insert({ ...validatedValues, created_by_user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating technician:", error);
    throw new Error("Could not create technician.");
  }

  updateTag("technicians");
  return data;
}

export async function updateTechnician(
  id: string,
  values: z.infer<typeof technicianSchema>
) {
  const validatedValues = technicianSchema.parse(values);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: technician, error: fetchError } = await supabase
    .from("technicians")
    .select("created_by_user_id")
    .eq("id", id)
    .single();

  if (fetchError || !technician) {
    throw new Error("Technician not found.");
  }

  if (technician.created_by_user_id !== user.id) {
    throw new Error("You do not have permission to edit this technician.");
  }

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

  updateTag("technicians");
  return data;
}

export async function deleteTechnician(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: technician, error: fetchError } = await supabase
    .from("technicians")
    .select("created_by_user_id")
    .eq("id", id)
    .single();

  if (fetchError || !technician) {
    throw new Error("Technician not found.");
  }

  if (technician.created_by_user_id !== user.id) {
    throw new Error("You do not have permission to delete this technician.");
  }

  const { data, error } = await supabase
    .from("technicians")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting technician:", error);
    throw new Error("Could not delete technician.");
  }

  updateTag("technicians");
  return data;
}
