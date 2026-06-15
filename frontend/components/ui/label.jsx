import { cn } from "@/lib/utils";

export function Label({ className, ...props }) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-semibold text-ink-soft", className)}
      {...props}
    />
  );
}

export function Field({ label, hint, children, className }) {
  return (
    <div className={cn("w-full", className)}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
