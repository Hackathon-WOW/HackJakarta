import { cn } from "@/lib/utils";

export function prospectTone(score) {
  if (score >= 80) return { label: "High Prospect", color: "#EE9412", text: "text-amber-600" };
  if (score >= 60) return { label: "Promising", color: "#1A6B45", text: "text-emerald-600" };
  if (score >= 40) return { label: "Developing", color: "#2E8B5C", text: "text-emerald-500" };
  return { label: "Early Stage", color: "#9B7B3A", text: "text-ink-muted" };
}

export function ProspectRing({ score = 0, size = 96, stroke = 9, className, showLabel = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const tone = prospectTone(score);

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E7DECB" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold leading-none text-ink tabular">{score}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">/100</span>
        </div>
      </div>
      {showLabel && <span className={cn("mt-2 text-xs font-semibold", tone.text)}>{tone.label}</span>}
    </div>
  );
}
