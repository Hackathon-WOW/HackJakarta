"use client";

import { useState } from "react";
import { Sparkles, ThumbsUp, ShieldAlert, HelpCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export function AiBrief({ umkmId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.ai.brief(umkmId);
      setData(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <Sparkles className="h-5 w-5 text-amber-500" /> AI Investor Brief
        </h3>
        {data && <Badge variant={data.aiGenerated ? "amber" : "sand"}>{data.aiGenerated ? "AI" : "Auto"}</Badge>}
      </div>

      {!data && !loading && (
        <>
          <p className="mt-1 text-sm text-ink-muted">
            Generate an AI summary of strengths, risks, and due-diligence questions from this business&apos;s financials.
          </p>
          <Button variant="amber" size="sm" className="mt-4" onClick={generate}>
            <Sparkles className="h-4 w-4" /> Generate brief
          </Button>
          {error && <p className="mt-2 text-sm text-wine">{error}</p>}
        </>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating brief…
        </div>
      )}

      {data && (
        <div className="mt-4 space-y-5">
          <p className="text-sm font-medium text-ink-soft">{data.summary}</p>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-leaf">
              <ThumbsUp className="h-3.5 w-3.5" /> Strengths
            </p>
            <ul className="space-y-1.5">
              {data.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-soft"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-leaf" /> {s}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-600">
              <ShieldAlert className="h-3.5 w-3.5" /> Risks
            </p>
            <ul className="space-y-1.5">
              {data.risks.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-soft"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" /> {s}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700">
              <HelpCircle className="h-3.5 w-3.5" /> Due-diligence questions
            </p>
            <ul className="space-y-1.5">
              {data.dueDiligence.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-soft"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600" /> {s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
