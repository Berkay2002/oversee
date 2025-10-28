import fs from "fs";
import path from "path";
import { parseFaqMdx } from "@/lib/mdx-utils";
import HelpClientPage from "./help-client-page";

export default function HelpPage() {
  const faqMdxPath = path.join(
    process.cwd(),
    "app/(authenticated)/org/[orgId]/help/content/faq.mdx"
  );
  const faqMdxContent = fs.readFileSync(faqMdxPath, "utf-8");
  const faqItems = parseFaqMdx(faqMdxContent);

  return <HelpClientPage faqItems={faqItems} />;
}
