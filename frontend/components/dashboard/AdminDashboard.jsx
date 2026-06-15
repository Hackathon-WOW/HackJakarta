"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Users, Store, BadgeCheck, Clock, Heart, Banknote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/lib/api";
import { compactRupiah } from "@/lib/format";
import { categoryIcon } from "@/lib/categories";

export function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(null);

  const load = () => {
    api.admin.stats().then((r) => setStats(r.data)).catch(() => setStats(null));
    api.admin
      .umkms()
      .then((r) => setPending(r.data.filter((u) => u.status === "PUBLISHED" && !u.adminApproved)))
      .catch(() => setPending([]));
  };
  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await api.admin.approve(id, true);
      toast.success("MSME approved & live on showcase");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm text-ink-muted">Hi, {user.fullName.split(" ")[0]} 👋</p>
        <h1 className="font-display text-3xl font-semibold text-ink">Admin Dashboard</h1>
      </div>

      {stats ? (
        <>
          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={Users} label="Users" value={stats.users.total} />
            <StatCard icon={Store} label="Total MSMEs" value={stats.umkm.total} />
            <StatCard icon={BadgeCheck} label="Approved" value={stats.umkm.approved} accent="amber" />
            <StatCard icon={Clock} label="Pending" value={stats.umkm.pending} />
            <StatCard icon={Heart} label="Interests" value={stats.interests} />
            <StatCard icon={Banknote} label="Income tracked" value={compactRupiah(stats.totalIncomeTracked)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {["MSME", "INVESTOR", "ADMIN"].map((role) => (
              <Card key={role} className="flex items-center justify-between p-5">
                <span className="text-sm font-semibold text-ink-muted">{role}</span>
                <span className="font-display text-2xl font-semibold text-emerald-700 tabular">{stats.users[role] || 0}</span>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-6">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}</div>
      )}

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Pending Approval</h3>
          <Link href="/dashboard/admin/review"><Button variant="ghost" size="sm">All</Button></Link>
        </div>
        {pending === null ? (
          <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        ) : pending.length === 0 ? (
          <EmptyState icon={BadgeCheck} title="All clear" description="No MSMEs awaiting approval." />
        ) : (
          <div className="space-y-3">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center gap-4 rounded-2xl border border-sand bg-paper px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-800/8 text-xl">{categoryIcon(u.category)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{u.name}</p>
                  <p className="text-xs text-ink-muted">{u.ownerEmail} · {u.category}</p>
                </div>
                <Badge variant="amber">Score {u.prospectScore}</Badge>
                <Link href={`/umkm/${u.id}`}><Button variant="outline" size="sm">Review</Button></Link>
                <Button variant="primary" size="sm" onClick={() => approve(u.id)}>Approve</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
