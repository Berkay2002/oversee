import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpImagePlaceholderProps {
  caption?: string;
  className?: string;
}

export function HelpImagePlaceholder({
  caption,
  className,
}: HelpImagePlaceholderProps) {
  return (
    <figure className={cn("not-prose my-8", className)}>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 p-16">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
          </div>
          {caption && (
            <p className="text-sm font-medium text-muted-foreground">{caption}</p>
          )}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm italic text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
