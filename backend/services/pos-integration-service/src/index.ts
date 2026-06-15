import { t } from 'elysia';
import { prisma } from '../../../shared/db';
import { createService } from '../../../shared/service';
import { requireRole, HttpError, type AuthUser } from '../../../shared/auth';
import { publishEvent } from '../../../shared/rabbitmq';

const PORT = Number(process.env.POS_SERVICE_PORT) || 3001;

type Provider = 'MOKA' | 'PAWOON' | 'MAJOO' | 'GOBIZ' | 'CUSTOM';

// Catalog of POS / tools commonly used by Indonesian MSMEs.
const PROVIDERS: {
  id: Provider;
  label: string;
  description: string;
  accent: string;
  items: { name: string; price: number; cogsRatio: number }[];
}[] = [
  {
    id: 'MOKA',
    label: 'Moka POS',
    description: 'Cloud POS by GoTo — cafes, retail & F&B.',
    accent: '#1A8FE3',
    items: [
      { name: 'Es Kopi Susu', price: 22000, cogsRatio: 0.4 },
      { name: 'Americano', price: 25000, cogsRatio: 0.35 },
      { name: 'Croissant', price: 28000, cogsRatio: 0.45 },
      { name: 'Beans 250g', price: 95000, cogsRatio: 0.5 },
    ],
  },
  {
    id: 'PAWOON',
    label: 'Pawoon',
    description: 'POS for retail, F&B and services.',
    accent: '#F26522',
    items: [
      { name: 'Kemeja Batik', price: 185000, cogsRatio: 0.55 },
      { name: 'Selendang', price: 120000, cogsRatio: 0.5 },
      { name: 'Kain Batik 2m', price: 240000, cogsRatio: 0.6 },
    ],
  },
  {
    id: 'MAJOO',
    label: 'majoo',
    description: 'All-in-one POS, inventory & accounting.',
    accent: '#5B2E91',
    items: [
      { name: 'Selada Hidroponik', price: 18000, cogsRatio: 0.45 },
      { name: 'Bayam Pack', price: 15000, cogsRatio: 0.4 },
      { name: 'Paket Sayur Mix', price: 65000, cogsRatio: 0.5 },
    ],
  },
  {
    id: 'GOBIZ',
    label: 'GoBiz (GoFood)',
    description: 'Merchant app for GoFood orders.',
    accent: '#00AA13',
    items: [
      { name: 'Serum Vit-C', price: 89000, cogsRatio: 0.35 },
      { name: 'Sunscreen SPF50', price: 75000, cogsRatio: 0.4 },
      { name: 'Skincare Bundle', price: 210000, cogsRatio: 0.45 },
    ],
  },
  {
    id: 'CUSTOM',
    label: 'Custom / Spreadsheet',
    description: 'Manual or in-house POS / spreadsheet feed.',
    accent: '#0F5132',
    items: [
      { name: 'Produk A', price: 150000, cogsRatio: 0.5 },
      { name: 'Produk B', price: 250000, cogsRatio: 0.55 },
      { name: 'Jasa Custom', price: 500000, cogsRatio: 0.4 },
    ],
  },
];

const findProvider = (id: string) => PROVIDERS.find((p) => p.id === id);

async function ownUmkm(user: AuthUser | null) {
  const u = requireRole(user, 'MSME');
  const umkm = await prisma.uMKM.findUnique({ where: { ownerId: u.id } });
  if (!umkm) throw new HttpError(404, 'UMKM profile not found');
  return umkm;
}

const app = createService('pos-integration')
  .get('/', () => ({ service: 'pos-integration-service', status: 'active' }))

  .get('/providers', () => ({
    success: true,
    data: PROVIDERS.map(({ id, label, description, accent }) => ({ id, label, description, accent })),
  }))

  .get('/integrations', async ({ user }) => {
    const umkm = await ownUmkm(user);
    const integrations = await prisma.pOSIntegration.findMany({ where: { umkmId: umkm.id } });
    return { success: true, data: integrations };
  })

  .post(
    '/connect',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const provider = body.provider as Provider;
      if (!findProvider(provider)) throw new HttpError(400, 'Unknown provider');

      const integration = await prisma.pOSIntegration.upsert({
        where: { umkmId_provider: { umkmId: umkm.id, provider } },
        update: { isActive: true },
        create: { umkmId: umkm.id, provider, isActive: true },
      });
      return { success: true, message: `${findProvider(provider)!.label} connected`, data: integration };
    },
    { body: t.Object({ provider: t.String() }) },
  )

  .post(
    '/disconnect',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const provider = body.provider as Provider;
      const existing = await prisma.pOSIntegration.findUnique({
        where: { umkmId_provider: { umkmId: umkm.id, provider } },
      });
      if (!existing) throw new HttpError(404, 'Integration not found');
      const integration = await prisma.pOSIntegration.update({
        where: { umkmId_provider: { umkmId: umkm.id, provider } },
        data: { isActive: false },
      });
      return { success: true, message: 'Disconnected', data: integration };
    },
    { body: t.Object({ provider: t.String() }) },
  )

  // Simulated sync: pull recent "sales" from the POS and store as transactions,
  // then emit an event so the finance service rebuilds reports.
  .post(
    '/sync',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const provider = (body.provider as Provider) ?? 'CUSTOM';
      const def = findProvider(provider);
      if (!def) throw new HttpError(400, 'Unknown provider');

      const integration = await prisma.pOSIntegration.findUnique({
        where: { umkmId_provider: { umkmId: umkm.id, provider } },
      });
      if (!integration || !integration.isActive) {
        throw new HttpError(400, `Connect ${def.label} before syncing`);
      }

      const days = Math.min(Math.max(Number(body.days) || 14, 1), 60);
      const txns: any[] = [];
      const now = new Date();
      for (let d = 0; d < days; d++) {
        const date = new Date(now);
        date.setDate(now.getDate() - d);
        const ordersToday = 2 + Math.floor(Math.random() * 4); // 2–5 orders/day
        for (let o = 0; o < ordersToday; o++) {
          const item = def.items[Math.floor(Math.random() * def.items.length)];
          const qty = 1 + Math.floor(Math.random() * 4);
          const revenue = item.price * qty;
          txns.push({
            umkmId: umkm.id,
            amount: revenue,
            type: 'INCOME',
            category: 'Sales',
            source: 'POS',
            description: `${item.name} x${qty} (${def.label})`,
            date,
          });
          txns.push({
            umkmId: umkm.id,
            amount: Math.round(revenue * item.cogsRatio),
            type: 'EXPENSE',
            category: 'COGS',
            source: 'POS',
            description: `COGS — ${item.name}`,
            date,
          });
        }
      }

      await prisma.transaction.createMany({ data: txns });
      await prisma.pOSIntegration.update({
        where: { umkmId_provider: { umkmId: umkm.id, provider } },
        data: { lastSyncAt: new Date() },
      });

      // Emit event for finance-report-service to rebuild monthly reports + prospect score.
      await publishEvent('POS_TRANSACTION_SYNCED', {
        umkmId: umkm.id,
        provider,
        count: txns.length,
      }).catch((e) => console.error('[pos] publish failed', e));

      return {
        success: true,
        message: `Synced ${txns.length} transactions from ${def.label} over ${days} days`,
        data: { synced: txns.length, days, provider },
      };
    },
    { body: t.Object({ provider: t.String(), days: t.Optional(t.Number()) }) },
  )

  .listen(PORT);

console.log(`🔌 pos-integration-service running at http://localhost:${app.server?.port}`);
