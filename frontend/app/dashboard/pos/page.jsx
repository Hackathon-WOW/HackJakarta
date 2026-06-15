"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plug, RefreshCw, Check, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function PosPage() {
  const [providers, setProviders] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [pending, setPending] = useState(null); // provider id being acted on

  const load = () => {
    api.pos.providers().then((r) => setProviders(r.data));
    api.pos.integrations().then((r) => setIntegrations(r.data)).catch(() => setIntegrations([]));
  };
  useEffect(() => {
    load();
  }, []);

  const integrationFor = (id) => integrations.find((i) => i.provider === id);

  const act = async (fn, id, okMsg) => {
    setPending(id);
    try {
      const r = await fn();
      toast.success(r.message || okMsg);
      const fresh = await api.pos.integrations();
      setIntegrations(fresh.data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPending(null);
    }
  };

  return (
    <RoleGate allow={["MSME"]}>
      <PageHeader
        title="POS Integration"
        subtitle="Connect your POS/cashier to pull transactions automatically into your financial reports."
      />

      {!providers ? (
        <div className="grid gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {providers.map((p) => {
            const integ = integrationFor(p.id);
            const active = integ?.isActive;
            const isPending = pending === p.id;
            return (
              <Card key={p.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-bold text-white"
                      style={{ background: p.accent }}
                    >
                      {p.label[0]}
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold text-ink">{p.label}</p>
                      <p className="text-xs text-ink-muted">{p.description}</p>
                    </div>
                  </div>
                  {active && <Badge variant="leaf"><Check className="h-3 w-3" /> Active</Badge>}
                </div>

                {active && (
                  <p className="mt-4 text-xs text-ink-muted">
                    Last sync: <span className="font-semibold text-ink-soft">{relativeTime(integ.lastSyncAt)}</span>
                  </p>
                )}

                <div className="mt-5 flex gap-2">
                  {active ? (
                    <>
                      <Button
                        variant="amber"
                        size="sm"
                        disabled={isPending}
                        onClick={() => act(() => api.pos.sync(p.id, 14), p.id, "Sync complete")}
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="h-4 w-4" /> Sync Now</>}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => act(() => api.pos.disconnect(p.id), p.id, "Disconnected")}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isPending}
                      onClick={() => act(() => api.pos.connect(p.id), p.id, "Connected")}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plug className="h-4 w-4" /> Connect</>}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-6 bg-emerald-800/[0.04] p-6">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-emerald-700">Note:</span> These connectors simulate pulling
          transactions from the POS. Each sync generates realistic sales transactions and automatically updates
          your monthly reports and Prospect Score via an event queue.
        </p>
      </Card>
    </RoleGate>
  );
}
