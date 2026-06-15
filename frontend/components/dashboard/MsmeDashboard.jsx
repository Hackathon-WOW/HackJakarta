"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Banknote,
  Wallet,
  TrendingUp,
  Heart,
  Plug,
  FileText,
  Upload,
  CheckCircle2,
  Circle,
  Rocket,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/StatCard";
import { ProspectRing } from "@/components/ProspectScore";
import { RevenueTrendChart } from "@/components/charts/FinanceChart";
import { Skeleton } from "@/components/ui/skeleton";
import { AiInsights } from "@/components/ai/AiInsights";
import { api } from "@/lib/api";
import { compactRupiah, pct } from "@/lib/format";

export function MsmeDashboard({ user }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.umkm.mine().then((r) => setData(r.data)).catch((e) => toast.error(e.message));
  useEffect(() => {
    load();
  }, []);

  const togglePublish = async () => {
    setBusy(true);
    try {
      const publish = data.status !== "PUBLISHED";
      const r = await api.umkm.publish(publish);
      toast.success(r.message || "Saved");
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-3xl" />
        <div className="grid gap-5 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}</div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    );
  }

  const m = data.metrics;
  const checklist = [
    { done: !!(data.description && data.city && data.yearEstablished), label: "Complete your business profile", href: "/dashboard/profile" },
    { done: data.posIntegrations?.some((p) => p.isActive), label: "Connect a POS", href: "/dashboard/pos" },
    { done: m.months > 0, label: "Add financial data", href: "/dashboard/finance" },
    { done: data.documents?.length > 0, label: "Create investor documents", href: "/dashboard/documents" },
    { done: data.status === "PUBLISHED", label: "Publish to showcase", href: null },
  ];
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="space-y-7">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-muted">Hi, {user.fullName.split(" ")[0]} 👋</p>
          <h1 className="font-display text-3xl font-semibold text-ink">{data.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {data.status === "PUBLISHED" ? (
            <Badge variant={data.adminApproved ? "leaf" : "amber"}>
              {data.adminApproved ? "Live on showcase" : "Pending approval"}
            </Badge>
          ) : (
            <Badge variant="ghost">Draft</Badge>
          )}
          <Button variant={data.status === "PUBLISHED" ? "outline" : "amber"} size="sm" onClick={togglePublish} disabled={busy}>
            {data.status === "PUBLISHED" ? "Unpublish" : <><Rocket className="h-4 w-4" /> Publish</>}
          </Button>
        </div>
      </div>

      {/* hero row */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col items-center justify-center p-6">
          <ProspectRing score={data.prospectScore} size={130} />
          <p className="mt-4 text-center text-sm text-ink-muted">
            Your Prospect Score reflects how investor-ready your business looks.
          </p>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Profile readiness</h3>
            <span className="font-display text-2xl font-semibold text-emerald-700 tabular">{completion}%</span>
          </div>
          <Progress value={completion} />
          <ul className="mt-5 space-y-2.5">
            {checklist.map((c) => {
              const Item = (
                <div className="flex items-center gap-3 text-sm">
                  {c.done ? <CheckCircle2 className="h-5 w-5 text-leaf" /> : <Circle className="h-5 w-5 text-sand-dark" />}
                  <span className={c.done ? "text-ink-muted line-through" : "font-medium text-ink-soft"}>{c.label}</span>
                </div>
              );
              return c.href && !c.done ? (
                <li key={c.label}><Link href={c.href} className="hover:opacity-80">{Item}</Link></li>
              ) : (
                <li key={c.label}>{Item}</li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard icon={Banknote} label={`Revenue (${m.months} mo)`} value={compactRupiah(m.totalRevenue)} />
        <StatCard icon={Wallet} label="Net Income" value={compactRupiah(m.totalNet)} accent="amber" />
        <StatCard icon={TrendingUp} label="Margin" value={`${m.avgMargin}%`} delta={m.periodGrowth} hint="growth" />
        <StatCard icon={Heart} label="Investor Interest" value={data.interestCount} />
      </div>

      {/* chart + quick actions */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">Financial Trend</h3>
          {m.series.length ? (
            <RevenueTrendChart data={m.series} />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-sm text-ink-muted">No financial data yet.</p>
              <Link href="/dashboard/finance" className="mt-3">
                <Button variant="amber" size="sm"><Upload className="h-4 w-4" /> Add data</Button>
              </Link>
            </div>
          )}
        </Card>

        <div className="grid gap-4">
          {[
            { href: "/dashboard/pos", icon: Plug, title: "POS Integration", desc: "Auto-sync transactions" },
            { href: "/dashboard/finance", icon: Upload, title: "Upload report", desc: "CSV / Excel or manual" },
            { href: "/dashboard/documents", icon: FileText, title: "Investor documents", desc: "Profile, statement, pitch" },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800/8 text-emerald-700">
                  <a.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{a.title}</p>
                  <p className="text-xs text-ink-muted">{a.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <AiInsights umkmId={data.id} />

      {data.status === "PUBLISHED" && data.adminApproved && (
        <Link href={`/umkm/${data.id}`}>
          <Button variant="outline"><Eye className="h-4 w-4" /> View your public profile</Button>
        </Link>
      )}
    </div>
  );
}
