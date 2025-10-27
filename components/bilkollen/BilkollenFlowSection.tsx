"use client";

import { BilkollenCaseFlowSankey } from "./BilkollenCaseFlowSankey";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type BilkollenFlowSectionProps = {
  orgId: string;
};

export function BilkollenFlowSection({ orgId }: BilkollenFlowSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-6">
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <BilkollenCaseFlowSankey orgId={orgId} />
      </Suspense>
    </section>
  );
}
