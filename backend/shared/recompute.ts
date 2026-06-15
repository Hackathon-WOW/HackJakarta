import { prisma } from './db';
import { computeProspectScore } from './scoring';
import { cacheDelete } from './redis';

export const SHOWCASE_CACHE_KEY = 'showcase:published';

/** Recompute and persist an UMKM's prospect score from its current data. */
export async function recomputeProspectScore(umkmId: string): Promise<number> {
  const [reports, activePos, documentCount, transactionCount, umkm] = await Promise.all([
    prisma.financeReport.findMany({
      where: { umkmId },
      select: { periodYear: true, periodMonth: true, totalRevenue: true, totalExpense: true, netIncome: true },
    }),
    prisma.pOSIntegration.findFirst({ where: { umkmId, isActive: true } }),
    prisma.document.count({ where: { umkmId } }),
    prisma.transaction.count({ where: { umkmId } }),
    prisma.uMKM.findUnique({ where: { id: umkmId } }),
  ]);

  const profileComplete = !!(umkm?.description && umkm?.category && umkm?.city && umkm?.yearEstablished);

  const score = computeProspectScore({
    reports,
    posConnected: !!activePos,
    documentCount,
    transactionCount,
    profileComplete,
  });

  await prisma.uMKM.update({ where: { id: umkmId }, data: { prospectScore: score } });
  await cacheDelete(SHOWCASE_CACHE_KEY).catch(() => {});
  return score;
}
