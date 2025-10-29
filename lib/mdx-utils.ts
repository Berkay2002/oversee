/* eslint-disable @typescript-eslint/no-explicit-any */
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";

interface FaqItem {
  question: string;
  answer: string[];
}

export function parseFaqMdx(mdxContent: string): FaqItem[] {
  const faqItems: FaqItem[] = [];
  const tree = unified().use(remarkParse).parse(new VFile(mdxContent));

  let currentQuestion = "";
  let currentAnswer: string[] = [];

  visit(tree, (node) => {
    if (node.type === "heading" && node.depth === 4) {
      if (currentQuestion) {
        faqItems.push({ question: currentQuestion, answer: currentAnswer });
      }
      currentQuestion = (node.children[0] as any).value;
      currentAnswer = [];
    } else if (currentQuestion && node.type === "paragraph") {
      currentAnswer.push(
        (node.children as any[]).map((child) => child.value).join("")
      );
    }
  });

  if (currentQuestion) {
    faqItems.push({ question: currentQuestion, answer: currentAnswer });
  }

  return faqItems;
}
