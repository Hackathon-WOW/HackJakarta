import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-11 w-full appearance-none rounded-xl border border-sand bg-paper px-4 pr-10 text-sm font-medium text-ink",
        "transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
  </div>
));
Select.displayName = "Select";
