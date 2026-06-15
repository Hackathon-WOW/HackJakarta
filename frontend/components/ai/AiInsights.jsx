"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const TONE = {
  positive: { icon: TrendingUp, cls: "text-leaf", dot: "bg-leaf" },
  warning: { icon: AlertTriangle, cls: "text-amber-600", dot: "bg-amber-500" },
  neutral: { icon: Lightbulb, cls: "text-emerald-700", dot: "bg-emerald-600" },
};

export function AiInsights({ umkmId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!umkmId) return;
    api.ai.insights(umkmId).then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, [umkmId]);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <Sparkles className="h-5 w-5 text-amber-500" /> AI Insights
        </h3>
        {data && <Badge variant={data.aiGenerated ? "amber" : "sand"}>{data.aiGenerated ? "AI" : "Auto"}</Badge>}
      </div>

      {error ? (
        <p className="text-sm text-ink-muted">Couldn&apos;t load insights.</p>
      ) : !data ? (
        <div className="flex items-center gap-2 py-6 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your business…
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm font-medium text-ink-soft">{data.summary}</p>
          <div className="space-y-3">
            {data.insights.map((ins, i) => {
              const tone = TONE[ins.tone] || TONE.neutral;
              const Icon = tone.icon;
              return (
                <div key={i} className="flex gap-3 rounded-2xl border border-sand bg-paper p-3.5">
                  <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", tone.cls)} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{ins.title}</p>
                    <p className="text-sm text-ink-muted">{ins.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {data.recommendations?.length > 0 && (
            <div className="mt-4 rounded-2xl bg-emerald-800/[0.05] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700">Recommended next steps</p>
              <ul className="space-y-1.5">
                {data.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
