"use client";

/**
 * Organization Context Provider
 *
 * Provides active organization data to all components within
 * the /org/[orgId] route hierarchy.
 */

import { createContext, useContext } from "react";
import type { ActiveOrg } from "./server";

interface OrgContextValue {
  activeOrg: ActiveOrg;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({
  activeOrg,
  children,
}: {
  activeOrg: ActiveOrg;
  children: React.ReactNode;
}) {
  return (
    <OrgContext.Provider value={{ activeOrg }}>
      {children}
    </OrgContext.Provider>
  );
}

/**
 * Hook to access active organization data
 * Must be used within OrgProvider (inside /org/[orgId] routes)
 */
export function useOrg(): OrgContextValue {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within OrgProvider");
  }
  return context;
}

/**
 * Hook to check if user has admin or owner role
 */
export function useIsOrgAdmin(): boolean {
  const { activeOrg } = useOrg();
  return activeOrg.role === "admin" || activeOrg.role === "owner";
}

/**
 * Hook to check if user is owner
 */
export function useIsOrgOwner(): boolean {
  const { activeOrg } = useOrg();
  return activeOrg.role === "owner";
}
