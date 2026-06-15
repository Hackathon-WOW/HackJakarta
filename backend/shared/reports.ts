import { prisma } from './db';
import { recomputeProspectScore } from './recompute';

interface Bucket {
  year: number;
  month: number;
  revenue: number;
  expense: number;
  cogs: number;
}

/**
 * Rebuild monthly FinanceReports from an UMKM's transactions.
 * Non-destructive: only upserts months that have transactions (leaves others intact),
 * then recomputes the prospect score.
 */
export async function rebuildReportsFromTransactions(umkmId: string, sourceTag?: string): Promise<number> {
  const txns = await prisma.transaction.findMany({ where: { umkmId } });

  const buckets = new Map<string, Bucket>();
  for (const tx of txns) {
    const d = new Date(tx.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    let b = buckets.get(key);
    if (!b) {
      b = { year, month, revenue: 0, expense: 0, cogs: 0 };
      buckets.set(key, b);
    }
    if (tx.type === 'INCOME') {
      b.revenue += tx.amount;
    } else {
      b.expense += tx.amount;
      if ((tx.category ?? '').toLowerCase().includes('cogs')) b.cogs += tx.amount;
    }
  }

  for (const b of buckets.values()) {
    const netIncome = b.revenue - b.expense;
    const grossProfit = b.cogs > 0 ? b.revenue - b.cogs : netIncome;
    const existing = await prisma.financeReport.findUnique({
      where: { umkmId_periodYear_periodMonth: { umkmId, periodYear: b.year, periodMonth: b.month } },
    });
    const sourceFiles = sourceTag
      ? Array.from(new Set([...(existing?.sourceFiles ?? []), sourceTag]))
      : existing?.sourceFiles ?? [];

    await prisma.financeReport.upsert({
      where: { umkmId_periodYear_periodMonth: { umkmId, periodYear: b.year, periodMonth: b.month } },
      update: {
        totalRevenue: b.revenue,
        totalExpense: b.expense,
        grossProfit,
        netIncome,
        sourceFiles,
      },
      create: {
        umkmId,
        periodYear: b.year,
        periodMonth: b.month,
        totalRevenue: b.revenue,
        totalExpense: b.expense,
        grossProfit,
        netIncome,
        sourceFiles,
      },
    });
  }

  await recomputeProspectScore(umkmId);
  return buckets.size;
}
