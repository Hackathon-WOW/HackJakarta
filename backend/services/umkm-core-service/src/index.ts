import { t } from 'elysia';
import { prisma } from '../../../shared/db';
import { createService } from '../../../shared/service';
import { requireRole, HttpError } from '../../../shared/auth';
import { cacheGet, cacheSet, cacheDelete } from '../../../shared/redis';
import { buildMetrics } from '../../../shared/metrics';
import { prospectLabel } from '../../../shared/scoring';
import { recomputeProspectScore, SHOWCASE_CACHE_KEY } from '../../../shared/recompute';
import { publishEvent } from '../../../shared/rabbitmq';

const PORT = Number(process.env.UMKM_SERVICE_PORT) || 3003;

const summary = (u: any) => ({
  id: u.id,
  name: u.name,
  category: u.category,
  city: u.city,
  description: u.description,
  logoUrl: u.logoUrl,
  yearEstablished: u.yearEstablished,
  prospectScore: u.prospectScore,
  prospectLabel: prospectLabel(u.prospectScore),
  status: u.status,
  adminApproved: u.adminApproved,
});

async function getShowcase() {
  const cached = await cacheGet(SHOWCASE_CACHE_KEY).catch(() => null);
  if (cached) return cached;
  const list = await prisma.uMKM.findMany({
    where: { status: 'PUBLISHED', adminApproved: true },
    orderBy: { prospectScore: 'desc' },
  });
  const mapped = list.map(summary);
  await cacheSet(SHOWCASE_CACHE_KEY, mapped, 600).catch(() => {});
  return mapped;
}

const app = createService('umkm-core')
  .get('/', () => ({ service: 'umkm-core-service', status: 'active' }))

  // ---------- Public showcase ----------
  .get('/umkms', async ({ query }) => {
    let list: any[] = await getShowcase();
    const q = (query.q ?? '').toString().toLowerCase().trim();
    const category = (query.category ?? '').toString().trim();
    const sort = (query.sort ?? 'prospect').toString();

    if (q) list = list.filter((u) => `${u.name} ${u.description ?? ''} ${u.city ?? ''}`.toLowerCase().includes(q));
    if (category && category !== 'All') list = list.filter((u) => u.category === category);

    if (sort === 'recent') list = [...list];
    else list = [...list].sort((a, b) => b.prospectScore - a.prospectScore);

    return { success: true, count: list.length, data: list };
  })

  .get('/umkms/:id', async ({ params: { id }, user }) => {
    const umkm = await prisma.uMKM.findUnique({
      where: { id },
      include: {
        owner: { select: { email: true, fullName: true } },
        financeReports: true,
        documents: { orderBy: { createdAt: 'desc' } },
        posIntegrations: true,
        transactions: { orderBy: { date: 'desc' }, take: 12 },
      },
    });
    if (!umkm) throw new HttpError(404, 'UMKM not found');

    const isOwner = user?.id === umkm.ownerId;
    const isAdmin = user?.role === 'ADMIN';
    const isPublic = umkm.status === 'PUBLISHED' && umkm.adminApproved;
    if (!isPublic && !isOwner && !isAdmin) throw new HttpError(403, 'This profile is not published yet');

    const metrics = buildMetrics(umkm.financeReports);
    return {
      success: true,
      data: {
        ...summary(umkm),
        ownerName: umkm.ownerName,
        address: umkm.address,
        contactPerson: umkm.contactPerson,
        contactEmail: umkm.owner.email,
        createdAt: umkm.createdAt,
        metrics,
        documents: umkm.documents,
        posIntegrations: umkm.posIntegrations.map((p) => ({
          provider: p.provider,
          isActive: p.isActive,
          lastSyncAt: p.lastSyncAt,
        })),
        recentTransactions: umkm.transactions,
      },
    };
  })

  // ---------- MSME: own profile ----------
  .get('/my/umkm', async ({ user }) => {
    const u = requireRole(user, 'MSME');
    let umkm = await prisma.uMKM.findUnique({
      where: { ownerId: u.id },
      include: {
        financeReports: true,
        documents: { orderBy: { createdAt: 'desc' } },
        posIntegrations: true,
        transactions: { orderBy: { date: 'desc' }, take: 10 },
      },
    });
    if (!umkm) {
      const created = await prisma.uMKM.create({ data: { ownerId: u.id, name: u.fullName, ownerName: u.fullName } });
      umkm = { ...created, financeReports: [], documents: [], posIntegrations: [], transactions: [] } as any;
    }
    const interestCount = await prisma.investorInterest.count({ where: { umkmId: umkm!.id } });
    const metrics = buildMetrics(umkm!.financeReports);
    return {
      success: true,
      data: {
        ...summary(umkm),
        ownerName: umkm!.ownerName,
        address: umkm!.address,
        contactPerson: umkm!.contactPerson,
        description: umkm!.description,
        metrics,
        documents: umkm!.documents,
        posIntegrations: umkm!.posIntegrations,
        recentTransactions: umkm!.transactions,
        interestCount,
      },
    };
  })

  .put(
    '/my/umkm',
    async ({ user, body }) => {
      const u = requireRole(user, 'MSME');
      const existing = await prisma.uMKM.findUnique({ where: { ownerId: u.id } });
      if (!existing) throw new HttpError(404, 'Profile not found');

      const umkm = await prisma.uMKM.update({
        where: { ownerId: u.id },
        data: {
          name: body.name ?? existing.name,
          ownerName: body.ownerName ?? existing.ownerName,
          category: body.category ?? existing.category,
          description: body.description ?? existing.description,
          yearEstablished: body.yearEstablished ?? existing.yearEstablished,
          city: body.city ?? existing.city,
          address: body.address ?? existing.address,
          contactPerson: body.contactPerson ?? existing.contactPerson,
          logoUrl: body.logoUrl ?? existing.logoUrl,
        },
      });
      await recomputeProspectScore(umkm.id);
      await cacheDelete(SHOWCASE_CACHE_KEY).catch(() => {});
      return { success: true, data: summary(await prisma.uMKM.findUnique({ where: { id: umkm.id } })) };
    },
    {
      body: t.Partial(
        t.Object({
          name: t.String(),
          ownerName: t.String(),
          category: t.String(),
          description: t.String(),
          yearEstablished: t.Number(),
          city: t.String(),
          address: t.String(),
          contactPerson: t.String(),
          logoUrl: t.String(),
        }),
      ),
    },
  )

  .post(
    '/my/umkm/publish',
    async ({ user, body }) => {
      const u = requireRole(user, 'MSME');
      const existing = await prisma.uMKM.findUnique({
        where: { ownerId: u.id },
        include: { financeReports: true },
      });
      if (!existing) throw new HttpError(404, 'Profile not found');

      if (body.publish) {
        const complete = existing.description && existing.category && existing.city && existing.yearEstablished;
        if (!complete) throw new HttpError(400, 'Complete your profile (description, category, city, year) before publishing');
        if (existing.financeReports.length === 0) throw new HttpError(400, 'Add financial data before publishing');
      }

      const umkm = await prisma.uMKM.update({
        where: { ownerId: u.id },
        data: { status: body.publish ? 'PUBLISHED' : 'DRAFT' },
      });
      await cacheDelete(SHOWCASE_CACHE_KEY).catch(() => {});
      return {
        success: true,
        data: summary(umkm),
        message: body.publish ? 'Submitted to showcase (pending admin approval)' : 'Unpublished',
      };
    },
    { body: t.Object({ publish: t.Boolean() }) },
  )

  // ---------- Investor: interests ----------
  .get('/interests', async ({ user }) => {
    const u = requireRole(user, 'INVESTOR');
    const interests = await prisma.investorInterest.findMany({
      where: { investorId: u.id },
      include: { umkm: true },
      orderBy: { updatedAt: 'desc' },
    });
    return {
      success: true,
      data: interests.map((i) => ({
        id: i.id,
        status: i.status,
        note: i.note,
        updatedAt: i.updatedAt,
        umkm: summary(i.umkm),
      })),
    };
  })

  .get('/umkms/:id/interest', async ({ params: { id }, user }) => {
    const u = requireRole(user, 'INVESTOR');
    const interest = await prisma.investorInterest.findUnique({
      where: { investorId_umkmId: { investorId: u.id, umkmId: id } },
    });
    return { success: true, data: interest };
  })

  .post(
    '/interests',
    async ({ user, body }) => {
      const u = requireRole(user, 'INVESTOR');
      const umkm = await prisma.uMKM.findUnique({ where: { id: body.umkmId } });
      if (!umkm) throw new HttpError(404, 'UMKM not found');
      const interest = await prisma.investorInterest.upsert({
        where: { investorId_umkmId: { investorId: u.id, umkmId: body.umkmId } },
        update: { note: body.note ?? undefined, status: (body.status as any) ?? undefined },
        create: { investorId: u.id, umkmId: body.umkmId, note: body.note, status: (body.status as any) ?? 'INTERESTED' },
      });
      await publishEvent('INVESTOR_INTEREST', { investorId: u.id, umkmId: body.umkmId }).catch(() => {});
      return { success: true, data: interest };
    },
    {
      body: t.Object({
        umkmId: t.String(),
        note: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
    },
  )

  .patch(
    '/interests/:id',
    async ({ user, params: { id }, body }) => {
      const u = requireRole(user, 'INVESTOR');
      const existing = await prisma.investorInterest.findUnique({ where: { id } });
      if (!existing || existing.investorId !== u.id) throw new HttpError(404, 'Interest not found');
      const updated = await prisma.investorInterest.update({
        where: { id },
        data: { status: (body.status as any) ?? existing.status, note: body.note ?? existing.note },
      });
      return { success: true, data: updated };
    },
    { body: t.Partial(t.Object({ status: t.String(), note: t.String() })) },
  )

  .delete('/interests/:id', async ({ user, params: { id } }) => {
    const u = requireRole(user, 'INVESTOR');
    const existing = await prisma.investorInterest.findUnique({ where: { id } });
    if (!existing || existing.investorId !== u.id) throw new HttpError(404, 'Interest not found');
    await prisma.investorInterest.delete({ where: { id } });
    return { success: true };
  })

  // ---------- Admin ----------
  .get('/admin/umkms', async ({ user }) => {
    requireRole(user, 'ADMIN');
    const list = await prisma.uMKM.findMany({
      include: {
        owner: { select: { email: true, fullName: true } },
        _count: { select: { investorInterests: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return {
      success: true,
      data: list.map((u) => ({
        ...summary(u),
        ownerEmail: u.owner.email,
        ownerFullName: u.owner.fullName,
        interestCount: u._count.investorInterests,
        updatedAt: u.updatedAt,
      })),
    };
  })

  .patch(
    '/admin/umkms/:id/approve',
    async ({ user, params: { id }, body }) => {
      requireRole(user, 'ADMIN');
      const umkm = await prisma.uMKM.update({ where: { id }, data: { adminApproved: body.approved } });
      await cacheDelete(SHOWCASE_CACHE_KEY).catch(() => {});
      return { success: true, data: summary(umkm) };
    },
    { body: t.Object({ approved: t.Boolean() }) },
  )

  .get('/admin/users', async ({ user }) => {
    requireRole(user, 'ADMIN');
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });
    return { success: true, data: users };
  })

  .get('/admin/stats', async ({ user }) => {
    requireRole(user, 'ADMIN');
    const [usersByRole, totalUmkm, publishedUmkm, approvedUmkm, interests, txnAgg] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.uMKM.count(),
      prisma.uMKM.count({ where: { status: 'PUBLISHED' } }),
      prisma.uMKM.count({ where: { adminApproved: true } }),
      prisma.investorInterest.count(),
      prisma.transaction.aggregate({ _sum: { amount: true }, _count: true, where: { type: 'INCOME' } }),
    ]);
    const roleCounts: Record<string, number> = {};
    usersByRole.forEach((r) => (roleCounts[r.role] = r._count));
    return {
      success: true,
      data: {
        users: { total: Object.values(roleCounts).reduce((a, b) => a + b, 0), ...roleCounts },
        umkm: {
          total: totalUmkm,
          published: publishedUmkm,
          approved: approvedUmkm,
          pending: publishedUmkm - approvedUmkm,
        },
        interests,
        totalIncomeTracked: Math.round(txnAgg._sum.amount ?? 0),
        incomeTxnCount: txnAgg._count,
      },
    };
  })

  .listen(PORT);

console.log(`🏪 umkm-core-service running at http://localhost:${app.server?.port}`);
