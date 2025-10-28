import { cn } from '@/lib/utils';

interface HelpSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function HelpSection({ children, className }: HelpSectionProps) {
  return (
    <div
      className={cn(
        'prose prose-sm prose-headings:font-semibold prose-h3:text-2xl prose-h3:mb-6 prose-h4:text-xl prose-h4:mt-10 prose-h4:mb-4 prose-p:leading-7 prose-p:mb-4 prose-ul:my-4 prose-ul:space-y-3 prose-li:leading-7 prose-li:space-y-1 prose-strong:block prose-strong:font-semibold prose-strong:text-foreground prose-a:font-medium prose-a:text-primary hover:prose-a:underline max-w-none',
        className
      )}
    >
      {children}
    </div>
  );
}
