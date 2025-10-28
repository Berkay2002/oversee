"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function HelpSection({
  id,
  title,
  children,
  defaultOpen = false,
}: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} className="mb-6 scroll-mt-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg bg-muted px-4 py-3 text-left transition-colors hover:bg-muted/80"
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        id={`${id}-content`}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "mt-4 max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-4 text-muted-foreground">{children}</div>
      </div>
    </section>
  );
}
