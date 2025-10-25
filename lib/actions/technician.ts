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

export const getTechnicians = async (
  orgId: string,
  { search }: { search?: string } = {}
) => {
  const supabase = await createClient();

  let query = supabase
    .from("technicians")
    .select("*")
    .eq("org_id", orgId)
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

export async function createTechnician(
  orgId: string,
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

  const { data, error } = await supabase
    .from("technicians")
    .insert({ ...validatedValues, org_id: orgId })
    .select()
    .single();

  if (error) {
    console.error("Error creating technician:", error);
    throw new Error("Could not create technician.");
  }

  updateTag(`technicians-${orgId}`);
  return data;
}

export async function updateTechnician(
  orgId: string,
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
    .select("org_id")
    .eq("id", id)
    .single();

  if (fetchError || !technician) {
    throw new Error("Technician not found.");
  }

  if (technician.org_id !== orgId) {
    throw new Error("Technician does not belong to this organization.");
  }


  const { data, error } = await supabase
    .from("technicians")
    .update(validatedValues)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) {
    console.error("Error updating technician:", error);
    throw new Error("Could not update technician.");
  }

  updateTag(`technicians-${orgId}`);
  return data;
}

export async function deleteTechnician(orgId: string, id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: technician, error: fetchError } = await supabase
    .from("technicians")
    .select("org_id")
    .eq("id", id)
    .single();

  if (fetchError || !technician) {
    throw new Error("Technician not found.");
  }

  if (technician.org_id !== orgId) {
    throw new Error("Technician does not belong to this organization.");
  }


  const { data, error } = await supabase
    .from("technicians")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    console.error("Error deleting technician:", error);
    throw new Error("Could not delete technician.");
  }

  updateTag(`technicians-${orgId}`);
  return data;
}
