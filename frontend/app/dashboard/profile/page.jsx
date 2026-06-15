"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RoleGate } from "@/components/dashboard/RoleGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES } from "@/lib/categories";
import { api } from "@/lib/api";

const FIELDS = [
  ["name", "Business Name"],
  ["ownerName", "Owner Name"],
  ["city", "City"],
  ["contactPerson", "Contact Person"],
];

export default function ProfilePage() {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.umkm.mine().then((r) => {
      const d = r.data;
      setForm({
        name: d.name || "",
        ownerName: d.ownerName || "",
        category: d.category || CATEGORIES[0],
        city: d.city || "",
        address: d.address || "",
        contactPerson: d.contactPerson || "",
        yearEstablished: d.yearEstablished || "",
        description: d.description || "",
      });
    });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.umkm.updateProfile({
        ...form,
        yearEstablished: form.yearEstablished ? Number(form.yearEstablished) : undefined,
      });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <RoleGate allow={["MSME"]}>
      <PageHeader title="Business Profile" subtitle="This information is shown to investors in the showcase." />
      {!form ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <Card className="p-6 md:p-8">
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {FIELDS.map(([k, label]) => (
                <Field key={k} label={label}>
                  <Input value={form[k]} onChange={set(k)} />
                </Field>
              ))}
              <Field label="Category">
                <Select value={form.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Year Established">
                <Input type="number" value={form.yearEstablished} onChange={set("yearEstablished")} placeholder="e.g. 2021" />
              </Field>
            </div>
            <Field label="Address">
              <Input value={form.address} onChange={set("address")} />
            </Field>
            <Field label="Business Description" hint="Tell investors about your strengths & vision.">
              <Textarea value={form.description} onChange={set("description")} className="min-h-[140px]" />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" variant="amber" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Profile</>}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </RoleGate>
  );
}
