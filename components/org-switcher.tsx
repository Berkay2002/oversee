"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { switchOrganization } from "@/lib/org/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
}

interface OrgSwitcherProps {
  currentOrgId: string;
  organizations: Organization[];
}

export function OrgSwitcher({ currentOrgId, organizations }: OrgSwitcherProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleOrgChange = async (newOrgId: string) => {
    if (newOrgId === currentOrgId) return;

    setIsLoading(true);

    try {
      const result = await switchOrganization(newOrgId);

      if (result.success) {
        // Navigate to the new org's overview page
        router.push(`/org/${newOrgId}/oversikt`);
        router.refresh();
      } else {
        console.error("Failed to switch organization:", result.error);
      }
    } catch (error) {
      console.error("Error switching organization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (organizations.length <= 1) {
    // Don't show switcher if user only has one org
    return null;
  }

  return (
    <Select
      value={currentOrgId}
      onValueChange={handleOrgChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[200px]">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
