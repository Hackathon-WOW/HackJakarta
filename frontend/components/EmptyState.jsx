import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-sand-dark bg-paper-soft/60 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-800/8 text-emerald-700">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
