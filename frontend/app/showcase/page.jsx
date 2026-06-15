"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UmkmCard } from "@/components/UmkmCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { CATEGORY_FILTERS } from "@/lib/categories";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ShowcasePage() {
  const [all, setAll] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("prospect");

  useEffect(() => {
    api.umkm
      .showcase({ sort: "prospect" })
      .then((r) => setAll(r.data))
      .catch(() => setAll([]));
  }, []);

  const filtered = useMemo(() => {
    if (!all) return null;
    let list = [...all];
    const query = q.toLowerCase().trim();
    if (query) list = list.filter((u) => `${u.name} ${u.description ?? ""} ${u.city ?? ""}`.toLowerCase().includes(query));
    if (category !== "All") list = list.filter((u) => u.category === category);
    if (sort === "prospect") list.sort((a, b) => b.prospectScore - a.prospectScore);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [all, q, category, sort]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* header */}
      <section className="surface-emerald grain bg-dots-light relative overflow-hidden text-paper-soft">
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="shell relative py-16 md:py-20">
          <span className="eyebrow text-amber-300">MSME Showcase</span>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold md:text-6xl">
            Discover Indonesia's most promising businesses.
          </h1>
          <p className="mt-4 max-w-xl text-paper-soft/70">
            Explore curated MSMEs with transparent financials and a measurable Prospect Score.
          </p>
        </div>
      </section>

      {/* controls */}
      <section className="sticky top-16 z-30 border-b border-sand bg-paper/85 backdrop-blur-xl">
        <div className="shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, city, or keyword…"
              className="pl-11"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </div>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 w-44">
              <option value="prospect">Highest prospect</option>
              <option value="name">Name (A–Z)</option>
            </Select>
          </div>
        </div>

        <div className="shell flex gap-2 overflow-x-auto pb-4">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-all",
                category === c
                  ? "border-emerald-800 bg-emerald-800 text-paper-soft"
                  : "border-sand bg-paper-soft text-ink-muted hover:border-emerald-700/30 hover:text-emerald-800",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* grid */}
      <section className="shell py-12 md:py-16">
        {filtered === null ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No MSMEs found"
            description="Try a different search term or category."
          />
        ) : (
          <>
            <p className="mb-6 text-sm text-ink-muted">
              Showing <span className="font-semibold text-ink">{filtered.length}</span> MSMEs
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((u, i) => (
                <UmkmCard key={u.id} umkm={u} index={i} />
              ))}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
