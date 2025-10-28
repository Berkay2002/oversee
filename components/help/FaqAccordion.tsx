"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpTip } from "@/components/help/help-tip";

interface FaqItem {
  question: string;
  answer: string[];
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-left font-semibold text-base hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-base">
              {item.answer.map((paragraph, pIndex) => (
                <p key={pIndex} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-6">
        <HelpTip variant="info">
          Har du en fråga som inte besvaras här? Kontakta din organisations
          administratör för hjälp.
        </HelpTip>
      </div>
    </div>
  );
}
