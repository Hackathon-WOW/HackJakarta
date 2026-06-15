import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        emerald: "bg-emerald-800/10 text-emerald-700",
        amber: "bg-amber-100 text-amber-700",
        sand: "bg-sand-soft text-ink-soft border border-sand",
        leaf: "bg-leaf/15 text-emerald-700",
        wine: "bg-wine/10 text-wine",
        solid: "bg-emerald-800 text-paper-soft",
        ghost: "bg-paper text-ink-muted border border-sand",
      },
    },
    defaultVariants: { variant: "sand" },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
