"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  FileText,
  Heart,
  Mail,
  MapPin,
  Plug,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import { ProspectRing } from "@/components/ProspectScore";
import { RevenueTrendChart, RevenueExpenseBars, MarginChart } from "@/components/charts/FinanceChart";
import { AiBrief } from "@/components/ai/AiBrief";
import { DocumentViewer } from "@/components/DocumentViewer";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { rupiah, compactRupiah, formatDate, pct } from "@/lib/format";
import { categoryIcon } from "@/lib/categories";

const DOC_LABEL = {
  BUSINESS_PROFILE: "Business Profile",
  FINANCIAL_STATEMENT: "Financial Statement",
  PITCH_SUMMARY: "Pitch Summary",
};
const POS_LABEL = { MOKA: "Moka POS", PAWOON: "Pawoon", MAJOO: "majoo", GOBIZ: "GoBiz", CUSTOM: "Custom POS" };

export default function UmkmDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [interest, setInterest] = useState(null);
  const [dialog, setDialog] = useState(false);
  const [docPreview, setDocPreview] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.umkm.detail(id).then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (user?.role === "INVESTOR") {
      api.umkm.interestState(id).then((r) => setInterest(r.data)).catch(() => {});
    }
  }, [id, user]);

  const expressInterest = async () => {
    setBusy(true);
    try {
      const r = await api.interests.express({ umkmId: id, note });
      setInterest(r.data);
      setDialog(false);
      toast.success("Interest saved! Check your pipeline.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="shell flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-display text-3xl font-semibold text-ink">Profile unavailable</h1>
          <p className="mt-2 text-ink-muted">{error}</p>
          <Link href="/showcase" className="mt-6">
            <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Back to Showcase</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="shell space-y-6 py-12">
          <Skeleton className="h-48 rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}</div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
        <Footer />
      </div>
    );
  }

  const m = data.metrics;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* hero header */}
      <section className="surface-emerald grain bg-dots-light relative overflow-hidden text-paper-soft">
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="shell relative py-10 md:py-14">
          <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-paper-soft/70 hover:text-amber-300">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-start gap-5">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-paper-soft/10 text-3xl backdrop-blur">
                {categoryIcon(data.category)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">
                    {data.category}
                  </span>
                  <span className="text-sm text-paper-soft/60">{data.prospectLabel}</span>
                </div>
                <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">{data.name}</h1>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-paper-soft/70">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {data.city || "Indonesia"}</span>
                  {data.yearEstablished && (
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Since {data.yearEstablished}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {data.ownerName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 rounded-3xl border border-paper-soft/15 bg-paper-soft/5 p-5 backdrop-blur-xl">
              <div className="[&_*]:!text-paper-soft">
                <ProspectRing score={data.prospectScore} size={104} showLabel={false} />
              </div>
              {user?.role === "INVESTOR" ? (
                interest ? (
                  <div className="text-sm">
                    <p className="text-paper-soft/60">Interest status</p>
                    <p className="font-display text-lg font-semibold text-amber-300">{interest.status}</p>
                    <button onClick={() => setDialog(true)} className="mt-1 text-xs text-paper-soft/60 underline hover:text-amber-300">
                      Update note
                    </button>
                  </div>
                ) : (
                  <Button variant="amber" onClick={() => setDialog(true)}>
                    <Heart className="h-4 w-4" /> Express Interest
                  </Button>
                )
              ) : (
                !user && (
                  <Link href="/auth/login">
                    <Button variant="amber"><Heart className="h-4 w-4" /> Sign in to show interest</Button>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="shell relative z-10 -mt-8 grid gap-5 md:grid-cols-4">
        <StatCard icon={Banknote} label={`Revenue (${m.months} mo)`} value={compactRupiah(m.totalRevenue)} hint={rupiah(m.totalRevenue)} />
        <StatCard icon={Wallet} label="Net Income" value={compactRupiah(m.totalNet)} accent="amber" hint={rupiah(m.totalNet)} />
        <StatCard icon={TrendingUp} label="Avg Margin" value={`${m.avgMargin}%`} />
        <StatCard icon={TrendingUp} label="Period Growth" value={pct(m.periodGrowth, true)} delta={m.periodGrowth} />
      </section>

      {/* main grid */}
      <section className="shell grid gap-6 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-ink">Revenue & Profit Trend</h3>
              <Badge variant="emerald">{m.months} months</Badge>
            </div>
            {m.series.length ? <RevenueTrendChart data={m.series} /> : <p className="py-10 text-center text-sm text-ink-muted">No financial data yet.</p>}
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">Revenue vs Expenses</h3>
              <RevenueExpenseBars data={m.series} height={220} />
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">Monthly Margin</h3>
              <MarginChart data={m.series} height={220} />
            </Card>
          </div>

          {data.recentTransactions?.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink">Recent Transactions</h3>
              <div className="overflow-hidden rounded-2xl border border-sand">
                <table className="w-full text-sm">
                  <thead className="bg-paper text-left text-xs uppercase tracking-wider text-ink-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    {data.recentTransactions.slice(0, 8).map((t) => (
                      <tr key={t.id} className="bg-paper-soft">
                        <td className="px-4 py-3">
                          <span className="font-medium text-ink">{t.description || t.category}</span>
                        </td>
                        <td className="px-4 py-3 text-ink-muted">{formatDate(t.date)}</td>
                        <td className={`px-4 py-3 text-right font-semibold tabular ${t.type === "INCOME" ? "text-leaf" : "text-wine"}`}>
                          {t.type === "INCOME" ? "+" : "−"}{rupiah(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <AiBrief umkmId={id} />

          <Card className="p-6">
            <h3 className="font-display text-lg font-semibold text-ink">About</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{data.description || "No description yet."}</p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 font-display text-lg font-semibold text-ink">Contact</h3>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2 text-ink-soft"><Building2 className="h-4 w-4 text-ink-muted" /> {data.contactPerson || data.ownerName}</p>
              <p className="flex items-center gap-2 text-ink-soft"><Mail className="h-4 w-4 text-ink-muted" /> {data.contactEmail}</p>
              <p className="flex items-center gap-2 text-ink-soft"><MapPin className="h-4 w-4 text-ink-muted" /> {data.address || data.city || "Indonesia"}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink"><Plug className="h-5 w-5 text-emerald-700" /> POS Integrations</h3>
            {data.posIntegrations?.length ? (
              <div className="flex flex-wrap gap-2">
                {data.posIntegrations.map((p) => (
                  <Badge key={p.provider} variant={p.isActive ? "leaf" : "ghost"}>
                    {POS_LABEL[p.provider] || p.provider}{p.isActive ? " · active" : ""}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No POS integrations yet.</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink"><FileText className="h-5 w-5 text-emerald-700" /> Documents</h3>
            {data.documents?.length ? (
              <ul className="space-y-2">
                {data.documents.map((d) => (
                  <li key={d.id}>
                    <button
                      onClick={() => setDocPreview(d)}
                      className="flex w-full items-center justify-between rounded-xl border border-sand bg-paper px-3 py-2.5 text-sm transition-colors hover:border-emerald-700/40 hover:bg-emerald-800/[0.03]"
                    >
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <FileText className="h-4 w-4 text-ink-muted" />
                        {DOC_LABEL[d.type] || d.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        View <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">No documents yet.</p>
            )}
          </Card>
        </div>
      </section>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title={`Interest in ${data.name}`}
        description="Add a short note (optional). This business will be added to your pipeline."
      >
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Impressed by the margins and growth, would like to discuss further." />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="amber" onClick={expressInterest} disabled={busy}>
            {busy ? "Saving…" : "Save Interest"}
          </Button>
        </div>
      </Dialog>

      <Dialog open={!!docPreview} onClose={() => setDocPreview(null)} title={docPreview?.title} className="max-w-3xl">
        <DocumentViewer doc={docPreview} company={data.name} />
      </Dialog>

      <Footer />
    </div>
  );
}
