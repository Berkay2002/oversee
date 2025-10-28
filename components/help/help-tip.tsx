import { Info, Lightbulb, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpTipProps {
  children: React.ReactNode;
  variant?: "info" | "tip" | "warning";
}

export function HelpTip({ children, variant = "info" }: HelpTipProps) {
  const icons = {
    info: Info,
    tip: Lightbulb,
    warning: AlertCircle,
  };

  const styles = {
    info: "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10",
    tip: "border-green-500/30 bg-green-500/5 dark:bg-green-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-500/10",
  };

  const iconStyles = {
    info: "text-blue-600 dark:text-blue-400",
    tip: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "not-prose my-6 flex gap-4 rounded-xl border p-4",
        styles[variant]
      )}
    >
      <div className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg", iconStyles[variant])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}
