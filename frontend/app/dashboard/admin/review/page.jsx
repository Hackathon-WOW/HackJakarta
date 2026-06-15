"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { categoryIcon } from "@/lib/categories";

export default function ReviewPage() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState("pending");

  const load = () => api.admin.umkms().then((r) => setList(r.data)).catch(() => setList([]));
  useEffect(() => {
    load();
  }, []);

  const setApproval = async (id, approved) => {
    try {
      await api.admin.approve(id, approved);
      toast.success(approved ? "Approved" : "Approval revoked");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = (list || []).filter((u) => {
    if (filter === "pending") return u.status === "PUBLISHED" && !u.adminApproved;
    if (filter === "approved") return u.adminApproved;
    if (filter === "draft") return u.status === "DRAFT";
    return true;
  });

  return (
    <RoleGate allow={["ADMIN"]}>
      <PageHeader title="MSME Approvals" subtitle="Review and approve MSMEs before they go live on the public showcase." />

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {list === null ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-3xl" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-sand-dark bg-paper-soft/60 px-6 py-12 text-center text-sm text-ink-muted">
          No MSMEs in this category.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <Card key={u.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-800/8 text-xl">{categoryIcon(u.category)}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{u.name}</p>
                  <p className="text-xs text-ink-muted">{u.ownerEmail} · {u.category} · {u.interestCount} interests</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="amber">Score {u.prospectScore}</Badge>
                {u.status === "DRAFT" ? (
                  <Badge variant="ghost">Draft</Badge>
                ) : u.adminApproved ? (
                  <Badge variant="leaf">Live</Badge>
                ) : (
                  <Badge variant="amber">Pending</Badge>
                )}
                <Link href={`/umkm/${u.id}`}><Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                {u.adminApproved ? (
                  <Button variant="ghost" size="sm" onClick={() => setApproval(u.id, false)}>Revoke</Button>
                ) : (
                  <Button variant="primary" size="sm" disabled={u.status === "DRAFT"} onClick={() => setApproval(u.id, true)}>
                    Approve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </RoleGate>
  );
}
