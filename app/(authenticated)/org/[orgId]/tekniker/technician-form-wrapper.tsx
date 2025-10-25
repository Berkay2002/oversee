"use client";

import { TechnicianForm } from "@/components/technicians/technician-form";
import { createTechnician } from "@/lib/actions/technician";

interface TechnicianFormWrapperProps {
  orgId: string;
  children: React.ReactNode;
}

export function TechnicianFormWrapper({ orgId, children }: TechnicianFormWrapperProps) {
  return (
    <TechnicianForm onSave={(values) => createTechnician(orgId, values)}>
      {children}
    </TechnicianForm>
  );
}
