"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Handshake, CalendarClock, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { UmkmCard } from "@/components/UmkmCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { prospectTone } from "@/components/ProspectScore";
import { api } from "@/lib/api";
import { categoryIcon } from "@/lib/categories";

const STATUS_VARIANT = {
  INTERESTED: "amber",
  CONTACTED: "emerald",
  MEETING: "emerald",
  DEAL: "leaf",
  PASSED: "ghost",
};

export function InvestorDashboard({ user }) {
  const [interests, setInterests] = useState(null);
  const [recommended, setRecommended] = useState(null);

  useEffect(() => {
    api.interests.list().then((r) => setInterests(r.data)).catch(() => setInterests([]));
    api.umkm.showcase({ sort: "prospect" }).then((r) => setRecommended(r.data)).catch(() => setRecommended([]));
  }, []);

  const stats = {
    total: interests?.length || 0,
    meetings: interests?.filter((i) => i.status === "MEETING").length || 0,
    deals: interests?.filter((i) => i.status === "DEAL").length || 0,
  };

  const interestedIds = new Set((interests || []).map((i) => i.umkm.id));
  const recoList = (recommended || []).filter((u) => !interestedIds.has(u.id)).slice(0, 3);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm text-ink-muted">Hi, {user.fullName.split(" ")[0]} 👋</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Investor Dashboard</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={Heart} label="Total Interests" value={stats.total} />
        <StatCard icon={CalendarClock} label="Meetings" value={stats.meetings} accent="amber" />
        <StatCard icon={Handshake} label="Deals" value={stats.deals} />
      </div>

      {/* pipeline */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Interest Pipeline</h3>
          <Link href="/dashboard/pipeline">
            <Button variant="ghost" size="sm">Manage</Button>
          </Link>
        </div>
        {interests === null ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        ) : interests.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No interests yet"
            description="Browse the showcase and express interest in promising MSMEs."
            action={<Link href="/showcase"><Button variant="amber" size="sm">Explore Showcase</Button></Link>}
          />
        ) : (
          <div className="space-y-3">
            {interests.slice(0, 5).map((i) => {
              const tone = prospectTone(i.umkm.prospectScore);
              return (
                <Link
                  key={i.id}
                  href={`/umkm/${i.umkm.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-sand bg-paper px-4 py-3 transition-colors hover:border-emerald-700/30"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-800/8 text-xl">
                    {categoryIcon(i.umkm.category)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{i.umkm.name}</p>
                    <p className="text-xs text-ink-muted">{i.umkm.city} · {i.umkm.category}</p>
                  </div>
                  <span className="font-display text-lg font-semibold tabular" style={{ color: tone.color }}>
                    {i.umkm.prospectScore}
                  </span>
                  <Badge variant={STATUS_VARIANT[i.status]}>{i.status}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* recommended */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Recommended for you</h3>
          <Link href="/showcase"><Button variant="ghost" size="sm">View all</Button></Link>
        </div>
        {recommended === null ? (
          <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
        ) : recoList.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {recoList.map((u, i) => <UmkmCard key={u.id} umkm={u} index={i} />)}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">You've reviewed all the top MSMEs. 🎉</p>
        )}
      </div>
    </div>
  );
}
