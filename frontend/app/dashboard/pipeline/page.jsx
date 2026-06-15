"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Compass, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { prospectTone } from "@/components/ProspectScore";
import { api } from "@/lib/api";
import { categoryIcon } from "@/lib/categories";

const STATUSES = ["INTERESTED", "CONTACTED", "MEETING", "DEAL", "PASSED"];

export default function PipelinePage() {
  const [items, setItems] = useState(null);

  const load = () => api.interests.list().then((r) => setItems(r.data)).catch(() => setItems([]));
  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await api.interests.update(id, { status });
      toast.success("Status updated");
    } catch (e) {
      toast.error(e.message);
      load();
    }
  };

  const remove = async (id) => {
    try {
      await api.interests.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <RoleGate allow={["INVESTOR"]}>
      <PageHeader
        title="Interest Pipeline"
        subtitle="Manage MSMEs you're interested in from first look to deal."
        action={<Link href="/showcase"><Button variant="outline"><Compass className="h-4 w-4" /> Explore</Button></Link>}
      />

      {items === null ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-3xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Your pipeline is empty"
          description="Express interest in MSMEs from the showcase to start building your pipeline."
          action={<Link href="/showcase"><Button variant="amber">Explore Showcase</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((i) => {
            const tone = prospectTone(i.umkm.prospectScore);
            return (
              <Card key={i.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <Link href={`/umkm/${i.umkm.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800/8 text-xl">
                    {categoryIcon(i.umkm.category)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{i.umkm.name}</p>
                    <p className="text-xs text-ink-muted">{i.umkm.city} · {i.umkm.category}</p>
                    {i.note && <p className="mt-0.5 truncate text-xs italic text-ink-muted">“{i.note}”</p>}
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl font-semibold tabular" style={{ color: tone.color }}>
                    {i.umkm.prospectScore}
                  </span>
                  <Select value={i.status} onChange={(e) => updateStatus(i.id, e.target.value)} className="h-10 w-36">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <button onClick={() => remove(i.id)} className="rounded-lg p-2 text-ink-muted hover:bg-wine/10 hover:text-wine">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </RoleGate>
  );
}
