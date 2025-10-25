/**
 * Server-side organization utilities
 *
 * These functions are used in Server Components and Server Actions
 * to validate organization membership and retrieve organization data.
 */

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

type OrgRole = Database["public"]["Enums"]["org_role"];

export interface ActiveOrg {
  id: string;
  name: string;
  role: OrgRole;
  created_at: string;
}

export interface OrgMembership {
  org_id: string;
  role: OrgRole;
  org_name: string;
}

/**
 * Get the active organization for a user, validating membership
 * @throws Error if user is not a member of the organization
 */
export async function getActiveOrgForUser(
  orgId: string,
  userId: string
): Promise<ActiveOrg> {
  const supabase = await createClient();

  // Check membership and get role
  const { data: membership, error: memberError } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .single();

  if (memberError || !membership) {
    throw new Error("Not a member of this organization");
  }

  // Get organization details
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, created_at")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    throw new Error("Organization not found");
  }

  return {
    id: org.id,
    name: org.name,
    role: membership.role,
    created_at: org.created_at,
  };
}

/**
 * Get user's default organization from their profile
 * @returns Default org ID or null if not set
 */
export async function getUserDefaultOrg(
  userId: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_org_id")
    .eq("user_id", userId)
    .single();

  return profile?.default_org_id ?? null;
}

/**
 * Get all organizations a user belongs to
 */
export async function getUserOrganizations(
  userId: string
): Promise<OrgMembership[]> {
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select(`
      org_id,
      role,
      organizations:org_id (
        name
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user organizations:", error);
    return [];
  }

  return (
    memberships?.map((m) => ({
      org_id: m.org_id,
      role: m.role,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      org_name: (m.organizations as any)?.name ?? "Unknown",
    })) ?? []
  );
}

/**
 * Check if user has admin or owner role in organization
 */
export async function isOrgAdmin(
  orgId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .single();

  return data?.role === "admin" || data?.role === "owner";
}

/**
 * Check if user is owner of organization
 */
export async function isOrgOwner(
  orgId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .single();

  return data?.role === "owner";
}

/**
 * Validate that a user has the required role in an organization
 * @throws Error if user doesn't have the required role
 */
export async function requireOrgRole(
  orgId: string,
  userId: string,
  requiredRole: "member" | "admin" | "owner"
): Promise<void> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .single();

  if (!data) {
    throw new Error("Not a member of this organization");
  }

  const roleHierarchy: Record<OrgRole, number> = {
    member: 1,
    admin: 2,
    owner: 3,
  };

  const userRole = data.role as OrgRole;
  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    throw new Error(`Requires ${requiredRole} role or higher`);
  }
}

/**
 * Get all join requests for an organization
 */
export async function getJoinRequests(
  orgId: string
): Promise<{ id: string; user_name: string }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_join_requests")
    .select(
      `
      id,
      profiles (
        name
      )
    `
    )
    .eq("org_id", orgId)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching join requests:", error);
    return [];
  }

  return (
    data?.map((r) => ({
      id: r.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user_name: (r.profiles as any)?.name ?? "Unknown",
    })) ?? []
  );
}
