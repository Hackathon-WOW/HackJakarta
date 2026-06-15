"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileSpreadsheet,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { UmkmCard } from "@/components/UmkmCard";
import { ProspectRing } from "@/components/ProspectScore";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

const POS = ["Moka POS", "Pawoon", "majoo", "GoBiz / GoFood", "Spreadsheet", "Excel"];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

export default function HomePage() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    api.umkm
      .showcase({ sort: "prospect" })
      .then((r) => setFeatured(r.data.slice(0, 3)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="surface-emerald grain bg-dots-light relative overflow-hidden text-paper-soft">
        <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="shell relative grid items-center gap-12 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="eyebrow rounded-full border border-paper-soft/20 bg-paper-soft/5 px-3.5 py-1.5 text-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5" /> For Indonesian MSMEs & Investors
            </motion.span>

            <motion.h1
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="show"
              className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
            >
              Businesses ready to{" "}
              <span className="italic text-gradient-amber">meet</span> investors.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-paper-soft/75"
            >
              Grow helps MSMEs build clean, credible financial reports & documents — straight from
              their POS or spreadsheets — then matches them with investors looking for the most
              promising businesses.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="show"
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link href="/auth/register">
                <Button variant="amber" size="lg">
                  Start as an MSME <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/showcase">
                <Button size="lg" className="bg-paper-soft/10 text-paper-soft hover:bg-paper-soft/20">
                  Explore Showcase
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-paper-soft/50">
                Connected data sources
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-paper-soft/65">
                {POS.map((p) => (
                  <span key={p} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {p}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* floating prospect card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="animate-float-slow rounded-[28px] border border-paper-soft/15 bg-paper-soft/[0.06] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-paper-soft/50">Prospect Score</p>
                  <p className="font-display text-lg font-semibold text-paper-soft">GlowLab Skincare</p>
                </div>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">
                  Beauty
                </span>
              </div>
              <div className="my-6 flex justify-center">
                <div className="[&_*]:!text-paper-soft">
                  <ProspectRing score={96} size={140} showLabel={false} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "Margin", v: "31%" },
                  { k: "Growth", v: "+92%" },
                  { k: "Docs", v: "Ready" },
                ].map((s) => (
                  <div key={s.k} className="rounded-2xl bg-paper-soft/5 py-3">
                    <p className="font-display text-lg font-semibold text-amber-300">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-widest text-paper-soft/50">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-b border-sand bg-paper-soft">
        <div className="shell grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {[
            { icon: Users, v: "64M+", k: "MSMEs in Indonesia" },
            { icon: Wallet, v: "61%", k: "Contribution to GDP" },
            { icon: FileSpreadsheet, v: "1 click", k: "Reports from POS" },
            { icon: ShieldCheck, v: "Transparent", k: "Verified data" },
          ].map((s, i) => (
            <motion.div
              key={s.k}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-800/8 text-emerald-700">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold text-ink">{s.v}</p>
                <p className="text-sm text-ink-muted">{s.k}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="shell py-20 md:py-28">
        <div className="max-w-2xl">
          <span className="eyebrow text-amber-600">How It Works</span>
          <h2 className="mt-3 text-balance font-display text-4xl font-semibold text-ink md:text-5xl">
            From raw data to a deal.
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            Three steps for MSMEs to look credible, and a clear path for investors to find opportunities.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: FileSpreadsheet,
              step: "01",
              title: "Connect & import",
              body: "Link Moka, Pawoon, majoo, or GoBiz — or upload CSV/Excel. Transactions are organized automatically.",
            },
            {
              icon: LineChart,
              step: "02",
              title: "Automatic reports",
              body: "The system builds monthly reports, margins, growth trends, and investor-ready documents.",
            },
            {
              icon: TrendingUp,
              step: "03",
              title: "Get discovered",
              body: "Your Prospect Score measures business readiness. Investors find and reach out to you.",
            },
          ].map((c, i) => (
            <motion.div
              key={c.step}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl border border-sand bg-paper-soft p-7 shadow-soft"
            >
              <span className="absolute -right-2 -top-4 font-display text-7xl font-semibold text-sand/70">
                {c.step}
              </span>
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800 text-amber-300">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-5 font-display text-xl font-semibold text-ink">{c.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TWO AUDIENCES */}
      <section className="bg-emerald-800/[0.04]">
        <div className="shell grid gap-6 py-20 md:grid-cols-2">
          {[
            {
              tag: "For MSMEs",
              title: "Look credible without the accounting headache.",
              points: ["Automatic financial reports", "Investor-ready documents", "Real-time Prospect Score"],
              href: "/auth/register",
              cta: "Join as MSME",
              variant: "amber",
            },
            {
              tag: "For Investors",
              title: "Find promising businesses backed by real data.",
              points: ["Curated showcase", "Transparent financial analysis", "Manage your interest pipeline"],
              href: "/auth/register",
              cta: "Join as Investor",
              variant: "primary",
            },
          ].map((c, i) => (
            <motion.div
              key={c.tag}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-col rounded-3xl border border-sand bg-paper-soft p-8 shadow-soft"
            >
              <span className="eyebrow text-emerald-600">{c.tag}</span>
              <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{c.title}</h3>
              <ul className="mt-5 space-y-2.5">
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf/20 text-leaf">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={c.href} className="mt-7">
                <Button variant={c.variant}>{c.cta} <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="shell py-20 md:py-28">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow text-amber-600">Showcase</span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ink">Most promising MSMEs</h2>
          </div>
          <Link href="/showcase" className="hidden md:block">
            <Button variant="outline">View all <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured === null
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)
            : featured.map((u, i) => <UmkmCard key={u.id} umkm={u} index={i} />)}
        </div>
        <div className="mt-8 md:hidden">
          <Link href="/showcase">
            <Button variant="outline" className="w-full">View all MSMEs</Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="shell pb-24">
        <div className="surface-emerald grain relative overflow-hidden rounded-[32px] px-8 py-16 text-center text-paper-soft md:py-20">
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl text-balance font-display text-4xl font-semibold md:text-5xl">
            Ready to make your business <span className="italic text-gradient-amber">investment-ready?</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-paper-soft/75">
            Join free today. Build your first report in minutes.
          </p>
          <div className="relative mt-8 flex justify-center gap-3">
            <Link href="/auth/register">
              <Button variant="amber" size="lg">Sign Up Now <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
