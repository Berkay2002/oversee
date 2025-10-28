/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { TableOfContents } from "@/components/help/table-of-contents";
import { MobileToc } from "@/components/help/mobile-toc";
import { MDXProvider } from "@mdx-js/react";
import { HelpTip } from "@/components/help/help-tip";
import { HelpImagePlaceholder } from "@/components/help/help-image-placeholder";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { HelpSection } from "@/components/help/help-section";

// Import MDX content
import KomIgang, { metadata as komIgangMeta } from "./content/kom-igang.mdx";
import SkapaRapporter, { metadata as skapaRapporterMeta } from "./content/skapa-rapporter.mdx";
import VisaRapporter, { metadata as visaRapporterMeta } from "./content/visa-rapporter.mdx";
import Bilkollen, { metadata as bilkollenMeta } from "./content/bilkollen.mdx";
import Oversikt, { metadata as oversiktMeta } from "./content/oversikt.mdx";
import BilkollenOversikt, { metadata as bilkollenOversiktMeta } from "./content/bilkollen-oversikt.mdx";
import Tabeller, { metadata as tabellerMeta } from "./content/tabeller.mdx";
import { metadata as faqMeta } from "./content/faq.mdx";

interface FaqItem {
  question: string;
  answer: string[];
}

interface HelpClientPageProps {
  faqItems: FaqItem[];
}

export default function HelpClientPage({ faqItems }: HelpClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    { Component: KomIgang, metadata: komIgangMeta },
    { Component: SkapaRapporter, metadata: skapaRapporterMeta },
    { Component: VisaRapporter, metadata: visaRapporterMeta },
    { Component: Bilkollen, metadata: bilkollenMeta },
    { Component: Oversikt, metadata: oversiktMeta },
    { Component: BilkollenOversikt, metadata: bilkollenOversiktMeta },
    { Component: Tabeller, metadata: tabellerMeta },
    // { Component: () => <FaqAccordion items={faqItems} />, metadata: faqMeta },
  ];

  const tocItems = sections.map((section) => ({
    id: section.metadata.id,
    title: section.metadata.title,
  }));

  const mdxComponents = {
    HelpTip,
    HelpImagePlaceholder,
  };

  const filterSection = (keywords: string) => {
    if (!searchQuery) return true;
    return keywords.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Hjälp & Vägledning</h1>
        </div>
        <p className="text-base text-muted-foreground max-w-3xl">
          Välkommen till hjälpsidan för Oversee. Här hittar du information om
          hur du använder systemet för att skapa rapporter, hantera ärenden och
          analysera data.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        
      </div>

      {/* Mobile TOC */}
      <MobileToc items={tocItems} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        {/* Content Area */}
        <div className="min-w-0">
          <MDXProvider components={mdxComponents}>
            {sections.map(({ Component, metadata }) => {
              if (!filterSection(metadata.keywords)) return null;

              return (
                <section
                  key={metadata.id}
                  id={metadata.id}
                  className="mb-16 scroll-mt-24 last:mb-0"
                >
                  {/* Section Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                      {metadata.title}
                    </h2>
                    <div className="h-1 w-12 bg-primary rounded-full" />
                  </div>

                  {/* Section Content */}
                  <HelpSection>
                    <Component />
                  </HelpSection>
                </section>
              );
            })}
          </MDXProvider>

          {/* No Results */}
          {searchQuery &&
            !sections.some((s) => filterSection(s.metadata.keywords)) && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Inga resultat hittades
                </p>
                <p className="text-sm text-muted-foreground">
                  Försök med andra sökord än &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}
        </div>

        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <TableOfContents items={tocItems} onSearch={setSearchQuery} />
        </aside>
      </div>
    </div>
  );
}
