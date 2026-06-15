import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[110px] w-full rounded-xl border border-sand bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60",
      "transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
