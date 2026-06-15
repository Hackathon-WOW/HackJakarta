import { t } from 'elysia';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { prisma } from '../../../shared/db';
import { createService } from '../../../shared/service';
import { requireRole, requireAuth, HttpError, type AuthUser } from '../../../shared/auth';
import { buildMetrics } from '../../../shared/metrics';
import { prospectLabel } from '../../../shared/scoring';
import { rebuildReportsFromTransactions } from '../../../shared/reports';
import { consumeEvent } from '../../../shared/rabbitmq';

const PORT = Number(process.env.FINANCE_SERVICE_PORT) || 3002;

// ---- helpers ----
async function ownUmkm(user: AuthUser | null) {
  const u = requireRole(user, 'MSME');
  const umkm = await prisma.uMKM.findUnique({ where: { ownerId: u.id } });
  if (!umkm) throw new HttpError(404, 'UMKM profile not found');
  return umkm;
}

async function assertOwnerOrAdmin(user: AuthUser | null, umkmId: string) {
  const u = requireAuth(user);
  if (u.role === 'ADMIN') return;
  const umkm = await prisma.uMKM.findUnique({ where: { id: umkmId } });
  if (!umkm || umkm.ownerId !== u.id) throw new HttpError(403, 'Not allowed');
}

const num = (v: any): number => {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : 0;
  }
  return 0;
};

function parseDate(v: any): Date {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  const s = String(v ?? '').trim();
  if (!s) return new Date();
  // MM/DD/YY or MM/DD/YYYY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const [, mm, dd, yy] = m;
    let year = parseInt(yy, 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(mm, 10) - 1, parseInt(dd, 10));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

const pick = (row: Record<string, any>, keys: string[]) => {
  const lower: Record<string, any> = {};
  for (const k of Object.keys(row)) lower[k.toLowerCase().trim()] = row[k];
  for (const key of keys) {
    const v = lower[key.toLowerCase()];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

/** Convert parsed rows into transaction create-inputs. Supports POS-sales schema + generic ledger. */
function rowsToTransactions(umkmId: string, rows: Record<string, any>[]) {
  const txns: any[] = [];
  for (const row of rows) {
    if (!row || Object.keys(row).length === 0) continue;
    const date = parseDate(pick(row, ['Purchase Date', 'date', 'tanggal', 'transaction date']));

    const subTotal = pick(row, ['Sub Total', 'subtotal', 'total', 'amount', 'revenue', 'gross']);
    const cogs = pick(row, ['COGS', 'cogs', 'hpp', 'cost']);
    const typeRaw = pick(row, ['type', 'tipe']);

    // Generic ledger schema (type + amount)
    if (typeRaw && pick(row, ['amount']) !== undefined) {
      const type = String(typeRaw).toUpperCase().includes('EXP') ? 'EXPENSE' : 'INCOME';
      txns.push({
        umkmId,
        amount: num(pick(row, ['amount'])),
        type,
        category: pick(row, ['category', 'kategori']) ?? null,
        source: 'EXCEL_UPLOAD',
        description: pick(row, ['description', 'item', 'keterangan']) ?? null,
        date,
      });
      continue;
    }

    // POS sales schema (Sub Total / COGS)
    if (subTotal !== undefined) {
      const category = pick(row, ['Item Category', 'category', 'kategori']) ?? 'Sales';
      const item = pick(row, ['Item', 'item', 'product']) ?? 'Sale';
      txns.push({
        umkmId,
        amount: num(subTotal),
        type: 'INCOME',
        category: String(category),
        source: 'EXCEL_UPLOAD',
        description: String(item),
        date,
      });
      if (cogs !== undefined && num(cogs) > 0) {
        txns.push({
          umkmId,
          amount: num(cogs),
          type: 'EXPENSE',
          category: 'COGS',
          source: 'EXCEL_UPLOAD',
          description: `COGS — ${item}`,
          date,
        });
      }
    }
  }
  return txns;
}

async function parseFile(file: File): Promise<Record<string, any>[]> {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.csv') || file.type === 'text/csv') {
    const text = await file.text();
    const result = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
    return result.data as Record<string, any>[];
  }
  // Excel
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, any>[];
}

// ---- document generation ----
function moneyId(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

async function generateDocumentContent(umkmId: string, type: string) {
  const umkm = await prisma.uMKM.findUnique({
    where: { id: umkmId },
    include: { financeReports: true, owner: { select: { email: true } } },
  });
  if (!umkm) throw new HttpError(404, 'UMKM not found');
  const metrics = buildMetrics(umkm.financeReports);

  if (type === 'BUSINESS_PROFILE') {
    return {
      title: `${umkm.name} — Business Profile`,
      content: {
        company: umkm.name,
        owner: umkm.ownerName,
        category: umkm.category,
        city: umkm.city,
        yearEstablished: umkm.yearEstablished,
        description: umkm.description,
        contact: { person: umkm.contactPerson, email: umkm.owner.email, address: umkm.address },
        highlights: [
          `${metrics.months} months of tracked financials`,
          `Average net margin ${metrics.avgMargin}%`,
          `Revenue growth ${metrics.periodGrowth}% over period`,
        ],
      },
    };
  }

  if (type === 'FINANCIAL_STATEMENT') {
    return {
      title: `${umkm.name} — Financial Statement`,
      content: {
        periodMonths: metrics.months,
        totalRevenue: metrics.totalRevenue,
        totalExpense: metrics.totalExpense,
        netIncome: metrics.totalNet,
        avgMargin: metrics.avgMargin,
        periodGrowth: metrics.periodGrowth,
        monthly: metrics.series,
        formatted: {
          totalRevenue: moneyId(metrics.totalRevenue),
          netIncome: moneyId(metrics.totalNet),
        },
      },
    };
  }

  // PITCH_SUMMARY
  return {
    title: `${umkm.name} — Investment Pitch Summary`,
    content: {
      headline: `${umkm.name}: ${prospectLabel(umkm.prospectScore)} (${umkm.prospectScore}/100)`,
      thesis: `${umkm.name} is a ${umkm.category} business in ${umkm.city ?? 'Indonesia'} with ${metrics.periodGrowth}% revenue growth and ${metrics.avgMargin}% net margins over the last ${metrics.months} months.`,
      metrics: {
        prospectScore: umkm.prospectScore,
        revenue: moneyId(metrics.totalRevenue),
        netIncome: moneyId(metrics.totalNet),
        margin: `${metrics.avgMargin}%`,
        growth: `${metrics.periodGrowth}%`,
      },
      askPoints: [
        'Working capital to scale production capacity',
        'Marketing & distribution expansion',
        'Talent acquisition',
      ],
    },
  };
}

const app = createService('finance-report')
  .get('/', () => ({ service: 'finance-report-service', status: 'active' }))

  // Upload CSV/Excel — MSME uploads to their own UMKM
  .post(
    '/upload',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const file = body.file as File;
      if (!file) throw new HttpError(400, 'File is required');

      const rows = await parseFile(file);
      if (!rows.length) throw new HttpError(400, 'No rows found in file');

      const txns = rowsToTransactions(umkm.id, rows);
      if (!txns.length) {
        throw new HttpError(
          400,
          'Could not detect financial columns. Expected a POS export (Sub Total / COGS) or a ledger (type / amount).',
        );
      }

      await prisma.transaction.createMany({ data: txns });
      const monthsTouched = await rebuildReportsFromTransactions(umkm.id, `upload:${file.name}`);

      return {
        success: true,
        message: `Imported ${txns.length} transactions across ${monthsTouched} month(s)`,
        data: { transactionsImported: txns.length, monthsTouched },
      };
    },
    { body: t.Object({ file: t.File() }) },
  )

  // Manual transaction entry
  .post(
    '/transactions',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const type = String(body.type).toUpperCase() === 'EXPENSE' ? 'EXPENSE' : 'INCOME';
      await prisma.transaction.create({
        data: {
          umkmId: umkm.id,
          amount: Math.abs(num(body.amount)),
          type,
          category: body.category ?? null,
          description: body.description ?? null,
          source: 'MANUAL',
          date: body.date ? new Date(body.date) : new Date(),
        },
      });
      const monthsTouched = await rebuildReportsFromTransactions(umkm.id);
      return { success: true, message: 'Transaction recorded', data: { monthsTouched } };
    },
    {
      body: t.Object({
        amount: t.Number(),
        type: t.String(),
        category: t.Optional(t.String()),
        description: t.Optional(t.String()),
        date: t.Optional(t.String()),
      }),
    },
  )

  .delete('/transactions/:id', async ({ user, params: { id } }) => {
    const u = requireRole(user, 'MSME');
    const txn = await prisma.transaction.findUnique({ where: { id }, include: { umkm: true } });
    if (!txn || txn.umkm.ownerId !== u.id) throw new HttpError(404, 'Transaction not found');
    await prisma.transaction.delete({ where: { id } });
    await rebuildReportsFromTransactions(txn.umkmId);
    return { success: true };
  })

  .get('/reports/:umkmId', async ({ params: { umkmId }, user }) => {
    await assertOwnerOrAdmin(user, umkmId);
    const reports = await prisma.financeReport.findMany({
      where: { umkmId },
      orderBy: [{ periodYear: 'asc' }, { periodMonth: 'asc' }],
    });
    return { success: true, data: reports, metrics: buildMetrics(reports) };
  })

  .get('/transactions/:umkmId', async ({ params: { umkmId }, user, query }) => {
    await assertOwnerOrAdmin(user, umkmId);
    const take = Math.min(Number(query.limit) || 50, 200);
    const transactions = await prisma.transaction.findMany({
      where: { umkmId },
      orderBy: { date: 'desc' },
      take,
    });
    return { success: true, data: transactions };
  })

  // Generate an investor-ready document
  .post(
    '/documents/generate',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const type = body.type;
      if (!['BUSINESS_PROFILE', 'FINANCIAL_STATEMENT', 'PITCH_SUMMARY'].includes(type)) {
        throw new HttpError(400, 'Invalid document type');
      }
      const { title, content } = await generateDocumentContent(umkm.id, type);
      const doc = await prisma.document.create({
        data: { umkmId: umkm.id, type: type as any, title, generatedContent: content as any },
      });
      // documents affect prospect score
      await rebuildReportsFromTransactions(umkm.id).catch(() => {});
      return { success: true, data: doc };
    },
    { body: t.Object({ type: t.String() }) },
  )

  .get('/documents/:umkmId', async ({ params: { umkmId }, user }) => {
    await assertOwnerOrAdmin(user, umkmId);
    const docs = await prisma.document.findMany({ where: { umkmId }, orderBy: { createdAt: 'desc' } });
    return { success: true, data: docs };
  })

  .listen(PORT);

// React to POS syncs: rebuild monthly reports for the affected UMKM
consumeEvent('POS_TRANSACTION_SYNCED', async (data: any) => {
  if (!data?.umkmId) return;
  console.log(`[finance] POS sync received for ${data.umkmId} — rebuilding reports`);
  try {
    await rebuildReportsFromTransactions(data.umkmId, `pos:${(data.provider ?? 'pos').toLowerCase()}`);
  } catch (e) {
    console.error('[finance] rebuild failed', e);
  }
}).catch((e) => console.error('[finance] consumer init failed', e));

console.log(`💰 finance-report-service running at http://localhost:${app.server?.port}`);
