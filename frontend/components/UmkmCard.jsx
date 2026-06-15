"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import { categoryIcon } from "@/lib/categories";
import { prospectTone } from "./ProspectScore";
import { Badge } from "./ui/badge";

export function UmkmCard({ umkm, index = 0 }) {
  const tone = prospectTone(umkm.prospectScore);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link
        href={`/umkm/${umkm.id}`}
        className="group block h-full rounded-3xl border border-sand bg-paper-soft p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-lift"
      >
        <div className="flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800/8 text-2xl">
            {categoryIcon(umkm.category)}
          </span>
          <div className="flex flex-col items-end">
            <span className="font-display text-2xl font-semibold leading-none tabular" style={{ color: tone.color }}>
              {umkm.prospectScore}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">prospect</span>
          </div>
        </div>

        <h3 className="mt-4 font-display text-xl font-semibold text-ink">{umkm.name}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-3.5 w-3.5" />
          {umkm.city || "Indonesia"}
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft/80">{umkm.description}</p>

        <div className="mt-5 flex items-center justify-between border-t border-sand/70 pt-4">
          <Badge variant="sand">{umkm.category}</Badge>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors group-hover:text-amber-600">
            View
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
