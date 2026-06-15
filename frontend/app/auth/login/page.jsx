"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

const DEMO = [
  { label: "MSME", email: "kopi.senja@umkm.id", pass: "umkm123" },
  { label: "Investor", email: "investor@grow.id", pass: "investor123" },
  { label: "Admin", email: "admin@grow.id", pass: "admin123" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <span className="eyebrow text-amber-600">Sign In</span>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 text-ink-muted">Continue managing your business or portfolio.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email Address">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@email.com"
              className="pl-11"
            />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
            <Input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="pl-11"
            />
          </div>
        </Field>

        <Button type="submit" size="lg" variant="amber" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-sand bg-paper-soft p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">Demo accounts</p>
        <div className="flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <button
              key={d.email}
              onClick={() => setForm({ email: d.email, password: d.pass })}
              className="rounded-full border border-sand bg-paper px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:border-emerald-700/40 hover:bg-emerald-800/5"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Don't have an account?{" "}
        <Link href="/auth/register" className="font-semibold text-emerald-700 hover:text-amber-600">
          Sign up free
        </Link>
      </p>
    </AuthShell>
  );
}
