"use client";

import { ReporterForm } from "@/components/reporters/reporter-form";
import { createReporter } from "@/lib/actions/reporter";

interface ReporterFormWrapperProps {
  orgId: string;
  children: React.ReactNode;
}

export function ReporterFormWrapper({ orgId, children }: ReporterFormWrapperProps) {
  return (
    <ReporterForm onSave={(values) => createReporter(orgId, values)}>
      {children}
    </ReporterForm>
  );
}
