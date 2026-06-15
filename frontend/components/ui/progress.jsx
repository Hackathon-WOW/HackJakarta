import { cn } from "@/lib/utils";

export function Progress({ value = 0, className, barClassName }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-sand", className)}>
      <div
        className={cn("h-full rounded-full bg-emerald-700 transition-all duration-700", barClassName)}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
