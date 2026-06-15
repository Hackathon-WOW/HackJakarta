/**
 * Prospect score (0–100): how investor-ready an MSME looks.
 * Combines profitability, scale, growth trend, data completeness, and documents.
 * Used by umkm-core (recompute on writes) and the seed script.
 */
export interface ScoreReport {
  periodYear: number;
  periodMonth: number;
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
}

export interface ScoreInput {
  reports: ScoreReport[];
  posConnected: boolean;
  documentCount: number;
  transactionCount: number;
  profileComplete: boolean;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function computeProspectScore(input: ScoreInput): number {
  const { reports, posConnected, documentCount, transactionCount, profileComplete } = input;

  const sorted = [...reports].sort((a, b) =>
    a.periodYear === b.periodYear ? a.periodMonth - b.periodMonth : a.periodYear - b.periodYear,
  );

  const totalRevenue = sorted.reduce((s, r) => s + r.totalRevenue, 0);
  const totalNet = sorted.reduce((s, r) => s + r.netIncome, 0);

  // 1. Profitability — net margin (max 30)
  const netMargin = totalRevenue > 0 ? totalNet / totalRevenue : 0;
  const profitability = clamp(netMargin * 100, 0, 30); // 30%+ margin => full marks

  // 2. Scale — average monthly revenue (max 20), full marks at ~Rp 50jt/mo
  const avgMonthlyRevenue = sorted.length ? totalRevenue / sorted.length : 0;
  const scale = clamp((avgMonthlyRevenue / 50_000_000) * 20, 0, 20);

  // 3. Growth trend — compare last vs first period revenue (max 20)
  let growth = 0;
  if (sorted.length >= 2) {
    const first = sorted[0].totalRevenue || 1;
    const last = sorted[sorted.length - 1].totalRevenue;
    const growthPct = (last - first) / first; // e.g. 0.5 = +50%
    growth = clamp(growthPct * 40, 0, 20); // +50% growth => full marks
  } else if (sorted.length === 1 && sorted[0].netIncome > 0) {
    growth = 8; // single profitable period => partial credit
  }

  // 4. Data completeness (max 20)
  let completeness = 0;
  if (posConnected) completeness += 8;
  if (sorted.length >= 3) completeness += 6;
  else if (sorted.length >= 1) completeness += 3;
  if (transactionCount >= 50) completeness += 6;
  else if (transactionCount > 0) completeness += 3;
  completeness = clamp(completeness, 0, 20);

  // 5. Documents + profile (max 10)
  let docs = clamp(documentCount * 3, 0, 7);
  if (profileComplete) docs += 3;
  docs = clamp(docs, 0, 10);

  return Math.round(clamp(profitability + scale + growth + completeness + docs, 0, 100));
}

export function prospectLabel(score: number): string {
  if (score >= 80) return 'High Prospect';
  if (score >= 60) return 'Promising';
  if (score >= 40) return 'Developing';
  return 'Early Stage';
}
