/**
 * Permission helper functions
 *
 * Use these to check role-based permissions both server-side and client-side.
 */

import type { Database } from "@/types/database";

type OrgRole = Database["public"]["Enums"]["org_role"];

/**
 * Check if role can manage organization members
 * Admin and owner roles can manage members
 */
export function canManageMembers(role: OrgRole): boolean {
  return role === "admin" || role === "owner";
}

/**
 * Check if role can delete data (reports, categories, etc.)
 * Admin and owner roles can delete
 */
export function canDeleteData(role: OrgRole): boolean {
  return role === "admin" || role === "owner";
}

/**
 * Check if role can edit organization settings
 * Admin and owner roles can edit settings
 */
export function canEditOrgSettings(role: OrgRole): boolean {
  return role === "admin" || role === "owner";
}

/**
 * Check if role can transfer organization ownership
 * Only owner can transfer ownership
 */
export function canTransferOwnership(role: OrgRole): boolean {
  return role === "owner";
}

/**
 * Check if role can delete the organization
 * Only owner can delete
 */
export function canDeleteOrg(role: OrgRole): boolean {
  return role === "owner";
}

/**
 * Check if role can invite new members
 * Admin and owner roles can invite
 */
export function canInviteMembers(role: OrgRole): boolean {
  return role === "admin" || role === "owner";
}

/**
 * Check if role can change member roles
 * Only owner can change roles
 */
export function canChangeMemberRoles(role: OrgRole): boolean {
  return role === "owner";
}
