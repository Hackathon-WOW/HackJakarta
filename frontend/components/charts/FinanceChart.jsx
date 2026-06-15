"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { compactRupiah, rupiah } from "@/lib/format";

const COLORS = { revenue: "#18392B", expense: "#D8CCB0", net: "#EE9412" };

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-sand bg-paper-soft px-4 py-3 shadow-lift">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color || p.fill }} />
              {p.name}
            </span>
            <span className="font-semibold text-ink tabular">{rupiah(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "#5E6E64", fontSize: 12, fontWeight: 500 },
};

export function RevenueTrendChart({ data = [], height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#18392B" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#18392B" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E7DECB" strokeDasharray="4 4" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={56} tickFormatter={compactRupiah} />
        <Tooltip content={<TooltipBox />} cursor={{ stroke: "#E7DECB" }} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#18392B" strokeWidth={2.5} fill="url(#revFill)" />
        <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#EE9412" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function RevenueExpenseBars({ data = [], height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke="#E7DECB" strokeDasharray="4 4" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={56} tickFormatter={compactRupiah} />
        <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(231,222,203,0.3)" }} />
        <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[6, 6, 0, 0]} maxBarSize={26} />
        <Bar dataKey="expense" name="Expenses" fill={COLORS.expense} radius={[6, 6, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MarginChart({ data = [], height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#E7DECB" strokeDasharray="4 4" />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={40} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          cursor={{ fill: "rgba(231,222,203,0.3)" }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className="rounded-2xl border border-sand bg-paper-soft px-4 py-2 shadow-lift">
                <p className="text-xs font-semibold text-ink-muted">{label}</p>
                <p className="font-semibold text-amber-600">{payload[0].value}% margin</p>
              </div>
            ) : null
          }
        />
        <Bar dataKey="margin" name="Margin" radius={[6, 6, 0, 0]} maxBarSize={30}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.margin >= 20 ? "#1A6B45" : d.margin >= 10 ? "#EE9412" : "#9B2C3A"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
