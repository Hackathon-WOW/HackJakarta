const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface ReportRow {
  periodYear: number;
  periodMonth: number;
  totalRevenue: number;
  totalExpense: number;
  grossProfit?: number;
  netIncome: number;
}

/** Aggregate finance reports into a chart-ready monthly series + summary KPIs. */
export function buildMetrics(reports: ReportRow[]) {
  const sorted = [...reports].sort((a, b) =>
    a.periodYear === b.periodYear ? a.periodMonth - b.periodMonth : a.periodYear - b.periodYear,
  );

  const series = sorted.map((r) => ({
    period: `${r.periodYear}-${String(r.periodMonth).padStart(2, '0')}`,
    label: `${MONTHS[r.periodMonth - 1]} ${String(r.periodYear).slice(2)}`,
    revenue: Math.round(r.totalRevenue),
    expense: Math.round(r.totalExpense),
    grossProfit: Math.round(r.grossProfit ?? r.totalRevenue - r.totalExpense),
    netIncome: Math.round(r.netIncome),
    margin: r.totalRevenue > 0 ? Math.round((r.netIncome / r.totalRevenue) * 100) : 0,
  }));

  const totalRevenue = sorted.reduce((s, r) => s + r.totalRevenue, 0);
  const totalExpense = sorted.reduce((s, r) => s + r.totalExpense, 0);
  const totalNet = sorted.reduce((s, r) => s + r.netIncome, 0);
  const avgMargin = totalRevenue > 0 ? totalNet / totalRevenue : 0;
  const latestRevenue = sorted.length ? sorted[sorted.length - 1].totalRevenue : 0;

  let momGrowth = 0;
  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2].totalRevenue || 1;
    const last = sorted[sorted.length - 1].totalRevenue;
    momGrowth = (last - prev) / prev;
  }

  let periodGrowth = 0;
  if (sorted.length >= 2) {
    const first = sorted[0].totalRevenue || 1;
    const last = sorted[sorted.length - 1].totalRevenue;
    periodGrowth = (last - first) / first;
  }

  return {
    series,
    totalRevenue: Math.round(totalRevenue),
    totalExpense: Math.round(totalExpense),
    totalNet: Math.round(totalNet),
    avgMargin: Math.round(avgMargin * 1000) / 10, // percent, 1 decimal
    latestRevenue: Math.round(latestRevenue),
    momGrowth: Math.round(momGrowth * 1000) / 10,
    periodGrowth: Math.round(periodGrowth * 1000) / 10,
    months: sorted.length,
  };
}
