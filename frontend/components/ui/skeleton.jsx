import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-sand/60", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-paper-soft/70 to-transparent" />
    </div>
  );
}
