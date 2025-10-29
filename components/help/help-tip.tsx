import { Info, Lightbulb, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HelpTipProps {
  children: React.ReactNode;
  variant?: "info" | "tip" | "warning";
  title?: string;
}

export function HelpTip({ children, variant = "info", title }: HelpTipProps) {
  const icons = {
    info: <Info className="h-5 w-5" />,
    tip: <Lightbulb className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
  };

  const defaultTitles = {
    info: "Info",
    tip: "Tip",
    warning: "Warning",
  };

  const Icon = icons[variant];
  const displayTitle = title || defaultTitles[variant];

  return (
    <Alert className="not-prose my-6">
      {Icon}
      <AlertTitle>{displayTitle}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
