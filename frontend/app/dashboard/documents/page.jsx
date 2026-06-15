"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FileText, FileBarChart, Presentation, Loader2, Eye, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { DocumentViewer } from "@/components/DocumentViewer";
import { Markdown } from "@/components/Markdown";
import { ModelBadge } from "@/components/ai/ModelBadge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

const TYPES = [
  { id: "BUSINESS_PROFILE", label: "Business Profile", icon: FileText, desc: "Company summary, category & highlights." },
  { id: "FINANCIAL_STATEMENT", label: "Financial Statement", icon: FileBarChart, desc: "Revenue, profit, margins & monthly trends." },
  { id: "PITCH_SUMMARY", label: "Pitch Summary", icon: Presentation, desc: "Investment narrative ready to share with investors." },
];

const STAGES = ["Reading your financials", "Computing metrics", "Writing with AI"];

export default function DocumentsPage() {
  const [umkmId, setUmkmId] = useState(null);
  const [company, setCompany] = useState("");
  const [docs, setDocs] = useState(null);
  const [busy, setBusy] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stream, setStream] = useState(null); // { type, label, text, stage }
  const streamRef = useRef(null);

  const load = (id) => api.finance.documents(id).then((r) => setDocs(r.data));
  useEffect(() => {
    api.umkm.mine().then((r) => {
      setUmkmId(r.data.id);
      setCompany(r.data.name);
      load(r.data.id);
    });
  }, []);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight });
  }, [stream?.text]);

  const generate = async (type) => {
    const meta = TYPES.find((t) => t.id === type);
    setBusy(type);
    setStream({ type, label: meta.label, text: "", stage: 0 });

    // brief staged hints before the first token arrives
    const s1 = setTimeout(() => setStream((p) => (p && !p.text ? { ...p, stage: 1 } : p)), 500);
    const s2 = setTimeout(() => setStream((p) => (p && !p.text ? { ...p, stage: 2 } : p)), 1100);

    try {
      await api.ai.documentStream(type, (full) =>
        setStream((p) => (p ? { ...p, text: full, stage: 2 } : p)),
      );
      toast.success("Document generated");
      await load(umkmId);
    } catch (e) {
      toast.error(e.message);
    } finally {
      clearTimeout(s1);
      clearTimeout(s2);
      setBusy(null);
      setStream(null);
    }
  };

  return (
    <RoleGate allow={["MSME"]}>
      <PageHeader
        title="Investor Documents"
        subtitle="AI generates professional, investor-ready documents from your data."
        action={<ModelBadge />}
      />

      <div className="grid gap-5 md:grid-cols-3">
        {TYPES.map((t) => (
          <Card key={t.id} className="flex flex-col p-6">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800 text-amber-300">
              <t.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">{t.label}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-muted">{t.desc}</p>
            <Button variant="amber" size="sm" className="mt-4" disabled={!!busy} onClick={() => generate(t.id)}>
              {busy === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4" /> Generate with AI</>}
            </Button>
          </Card>
        ))}
      </div>

      {/* live generation panel */}
      {stream && (
        <Card className="mt-6 p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Sparkles className="h-5 w-5 animate-pulse text-amber-500" /> Generating {stream.label}…
            </h3>
            <ModelBadge />
          </div>

          {/* stage stepper */}
          <div className="mb-4 flex flex-wrap gap-2">
            {STAGES.map((s, i) => (
              <span
                key={s}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold " +
                  (i < stream.stage || (i === 2 && stream.text)
                    ? "bg-leaf/15 text-emerald-700"
                    : i === stream.stage
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sand-soft text-ink-muted")
                }
              >
                {i < stream.stage || (i === 2 && stream.text) ? "✓" : i === stream.stage ? "•" : "○"} {s}
              </span>
            ))}
          </div>

          <div ref={streamRef} className="max-h-[360px] overflow-auto rounded-2xl border border-sand bg-white p-6">
            {stream.text ? (
              <Markdown content={stream.text} />
            ) : (
              <p className="text-sm text-ink-muted">Asking the model…</p>
            )}
          </div>
        </Card>
      )}

      <h3 className="mb-4 mt-8 font-display text-lg font-semibold text-ink">Saved Documents</h3>
      {docs === null ? null : docs.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Create your first document from the cards above." />
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <Card key={d.id} className="flex items-center gap-4 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-800/8 text-emerald-700">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{d.title}</p>
                <p className="text-xs text-ink-muted">Created {formatDate(d.createdAt)}</p>
              </div>
              {d.generatedContent?.aiGenerated && <Badge variant="amber"><Sparkles className="h-3 w-3" /> AI</Badge>}
              <Button variant="outline" size="sm" onClick={() => setPreview(d)}>
                <Eye className="h-4 w-4" /> View
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onClose={() => setPreview(null)} title={preview?.title} className="max-w-3xl">
        <DocumentViewer doc={preview} company={company} />
      </Dialog>
    </RoleGate>
  );
}
