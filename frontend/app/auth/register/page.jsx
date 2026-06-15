"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, User, Loader2, ArrowRight, Store, TrendingUp } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "MSME", label: "MSME", desc: "I run a business", icon: Store },
  { id: "INVESTOR", label: "Investor", desc: "I'm seeking opportunities", icon: TrendingUp },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "MSME" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    try {
      await register(form);
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <span className="eyebrow text-amber-600">Sign Up</span>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Create a free account</h1>
      <p className="mt-2 text-ink-muted">Choose your role to get started.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {ROLES.map((r) => {
          const active = form.role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setForm({ ...form, role: r.id })}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-emerald-700 bg-emerald-800/5 shadow-soft"
                  : "border-sand bg-paper-soft hover:border-emerald-700/30",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl",
                  active ? "bg-emerald-800 text-amber-300" : "bg-sand text-ink-soft",
                )}
              >
                <r.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-lg font-semibold text-ink">{r.label}</p>
              <p className="text-xs text-ink-muted">{r.desc}</p>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label={form.role === "MSME" ? "Your name / Business" : "Full Name"}>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
            <Input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="cth. Andini Pratama"
              className="pl-11"
            />
          </div>
        </Field>
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
        <Field label="Password" hint="At least 6 characters">
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
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-amber-600">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
