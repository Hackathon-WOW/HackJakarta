import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-sand bg-paper px-4 text-sm text-ink placeholder:text-ink-muted/60",
      "transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
