"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { UploadCloud, Loader2, Plus, Trash2, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { RevenueExpenseBars } from "@/components/charts/FinanceChart";
import { api } from "@/lib/api";
import { rupiah, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function FinancePage() {
  const [umkmId, setUmkmId] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [txns, setTxns] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [txn, setTxn] = useState({ amount: "", type: "INCOME", category: "", description: "" });
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async (id) => {
    const reports = await api.finance.reports(id);
    setMetrics(reports.metrics);
    const t = await api.finance.transactions(id, 100);
    setTxns(t.data);
  }, []);

  useEffect(() => {
    api.umkm.mine().then((r) => {
      setUmkmId(r.data.id);
      refresh(r.data.id);
    });
  }, [refresh]);

  const onDrop = useCallback(
    async (files) => {
      if (!files.length) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", files[0]);
        const r = await api.finance.upload(fd);
        toast.success(r.message);
        await refresh(umkmId);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setUploading(false);
      }
    },
    [umkmId, refresh],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "application/vnd.ms-excel": [".xls"] },
    multiple: false,
  });

  const addTxn = async (e) => {
    e.preventDefault();
    if (!txn.amount) return toast.error("Enter an amount");
    setSaving(true);
    try {
      await api.finance.addTransaction({ ...txn, amount: Number(txn.amount) });
      toast.success("Transaction added");
      setTxn({ amount: "", type: "INCOME", category: "", description: "" });
      await refresh(umkmId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeTxn = async (id) => {
    try {
      await api.finance.deleteTransaction(id);
      await refresh(umkmId);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <RoleGate allow={["MSME"]}>
      <PageHeader title="Finance" subtitle="Import from POS/Excel, record manually, and see automatic reports." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* upload */}
        <Card className="p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-ink">Upload Report</h3>
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              isDragActive ? "border-amber-500 bg-amber-100/40" : "border-sand-dark bg-paper hover:border-emerald-700/40",
            )}
          >
            <input {...getInputProps()} />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800/8 text-emerald-700">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
            </span>
            <p className="mt-3 font-semibold text-ink">{uploading ? "Processing…" : "Drag a file here or click"}</p>
            <p className="mt-1 text-xs text-ink-muted">CSV or Excel — POS export (Sub Total / COGS) or ledger (type / amount)</p>
          </div>
        </Card>

        {/* manual entry */}
        <Card className="p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-ink">Record Manual Transaction</h3>
          <form onSubmit={addTxn} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (Rp)">
                <Input type="number" value={txn.amount} onChange={(e) => setTxn({ ...txn, amount: e.target.value })} placeholder="0" />
              </Field>
              <Field label="Type">
                <Select value={txn.type} onChange={(e) => setTxn({ ...txn, type: e.target.value })}>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </Select>
              </Field>
            </div>
            <Field label="Category">
              <Input value={txn.category} onChange={(e) => setTxn({ ...txn, category: e.target.value })} placeholder="e.g. Sales" />
            </Field>
            <Field label="Description">
              <Input value={txn.description} onChange={(e) => setTxn({ ...txn, description: e.target.value })} placeholder="e.g. Daily sales" />
            </Field>
            <Button type="submit" variant="primary" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add Transaction</>}
            </Button>
          </form>
        </Card>
      </div>

      {/* chart */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Monthly Report</h3>
          {metrics && <Badge variant="emerald">{metrics.months} months</Badge>}
        </div>
        {metrics?.series?.length ? (
          <RevenueExpenseBars data={metrics.series} height={260} />
        ) : (
          <p className="py-12 text-center text-sm text-ink-muted">No reports yet. Upload a file or record a transaction.</p>
        )}
      </Card>

      {/* transactions */}
      <Card className="mt-6 p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-ink">Transactions ({txns.length})</h3>
        {txns.length === 0 ? (
          <EmptyState icon={FileSpreadsheet} title="No transactions yet" description="Start by uploading or recording a transaction." />
        ) : (
          <div className="max-h-[420px] overflow-auto rounded-2xl border border-sand">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-paper text-left text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {txns.map((t) => (
                  <tr key={t.id} className="bg-paper-soft">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{t.description || t.category || "—"}</span>
                    </td>
                    <td className="px-4 py-3"><Badge variant="ghost">{t.source}</Badge></td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(t.date)}</td>
                    <td className={cn("px-4 py-3 text-right font-semibold tabular", t.type === "INCOME" ? "text-leaf" : "text-wine")}>
                      {t.type === "INCOME" ? "+" : "−"}{rupiah(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeTxn(t.id)} className="rounded-lg p-1.5 text-ink-muted hover:bg-wine/10 hover:text-wine">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </RoleGate>
  );
}
