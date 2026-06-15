import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({ icon: Icon, label, value, delta, hint, className, accent = "emerald" }) {
  const positive = typeof delta === "number" ? delta >= 0 : null;
  const accentBg = accent === "amber" ? "bg-amber-100 text-amber-600" : "bg-emerald-800/10 text-emerald-700";

  return (
    <div className={cn("rounded-3xl border border-sand bg-paper-soft p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        {Icon && (
          <span className={cn("grid h-9 w-9 place-items-center rounded-xl", accentBg)}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-2xl font-semibold text-ink tabular">{value}</div>
      <div className="mt-1 flex items-center gap-2">
        {positive !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              positive ? "text-leaf" : "text-wine",
            )}
          >
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </div>
    </div>
  );
}
