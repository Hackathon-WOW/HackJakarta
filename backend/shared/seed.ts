import { prisma } from './db';
import { hashPassword } from './auth';
import { computeProspectScore } from './scoring';

type Provider = 'MOKA' | 'PAWOON' | 'MAJOO' | 'GOBIZ' | 'CUSTOM';

interface MSMESeed {
  email: string;
  fullName: string;
  name: string;
  category: string;
  city: string;
  yearEstablished: number;
  description: string;
  baseRevenue: number; // monthly revenue ~6 months ago
  marginPct: number; // net margin
  growthPct: number; // monthly compounding growth
  pos?: Provider;
  publish: boolean;
  approved: boolean;
}

const MSMES: MSMESeed[] = [
  {
    email: 'kopi.senja@umkm.id',
    fullName: 'Andini Pratama',
    name: 'Kopi Senja Nusantara',
    category: 'Food and Beverages',
    city: 'Bandung',
    yearEstablished: 2021,
    description:
      'Specialty coffee roaster & cafe chain sourcing single-origin beans from Indonesian highland farmers. Three outlets and a growing subscription business.',
    baseRevenue: 38_000_000,
    marginPct: 0.22,
    growthPct: 0.09,
    pos: 'MOKA',
    publish: true,
    approved: true,
  },
  {
    email: 'batik.larasati@umkm.id',
    fullName: 'Sekar Larasati',
    name: 'Batik Larasati',
    category: 'Fashion',
    city: 'Yogyakarta',
    yearEstablished: 2019,
    description:
      'Heritage batik atelier blending traditional Yogyakarta motifs with modern ready-to-wear. Exports to Singapore and Japan.',
    baseRevenue: 52_000_000,
    marginPct: 0.28,
    growthPct: 0.07,
    pos: 'PAWOON',
    publish: true,
    approved: true,
  },
  {
    email: 'sayur.segar@umkm.id',
    fullName: 'Bayu Wicaksono',
    name: 'SayurSegar Hidroponik',
    category: 'Agriculture',
    city: 'Bogor',
    yearEstablished: 2020,
    description:
      'Hydroponic farm supplying premium leafy greens to supermarkets and restaurants with same-day cold-chain delivery.',
    baseRevenue: 64_000_000,
    marginPct: 0.18,
    growthPct: 0.11,
    pos: 'MAJOO',
    publish: true,
    approved: true,
  },
  {
    email: 'glow.skincare@umkm.id',
    fullName: 'Maya Anggraini',
    name: 'GlowLab Skincare',
    category: 'Beauty',
    city: 'Jakarta',
    yearEstablished: 2022,
    description:
      'BPOM-certified local skincare brand with halal formulations, selling through marketplaces and 200+ reseller network.',
    baseRevenue: 41_000_000,
    marginPct: 0.31,
    growthPct: 0.14,
    pos: 'GOBIZ',
    publish: true,
    approved: true,
  },
  {
    email: 'kayu.kriya@umkm.id',
    fullName: 'Joko Santoso',
    name: 'KriyaKayu Furniture',
    category: 'Furnitures',
    city: 'Jepara',
    yearEstablished: 2017,
    description:
      'Handcrafted solid-wood furniture workshop in Jepara serving custom interior projects and e-commerce.',
    baseRevenue: 73_000_000,
    marginPct: 0.2,
    growthPct: 0.05,
    pos: 'CUSTOM',
    publish: true,
    approved: true,
  },
  {
    email: 'edukita.les@umkm.id',
    fullName: 'Rina Halim',
    name: 'EduKita Bimbel',
    category: 'Education',
    city: 'Surabaya',
    yearEstablished: 2021,
    description:
      'After-school tutoring centre with a hybrid online platform; 800 active students across STEM subjects.',
    baseRevenue: 29_000_000,
    marginPct: 0.25,
    growthPct: 0.08,
    publish: false, // still a draft — appears only in MSME dashboard, not showcase
    approved: false,
  },
];

const INCOME_LABELS: Record<string, string[]> = {
  'Food and Beverages': ['Dine-in sales', 'Bean subscription', 'Catering order', 'Delivery sales'],
  Fashion: ['Retail order', 'Export shipment', 'Marketplace sales', 'Custom tailoring'],
  Agriculture: ['Supermarket supply', 'Restaurant order', 'Farmers market', 'B2B contract'],
  Beauty: ['Marketplace sales', 'Reseller restock', 'Bundle promo', 'Retail order'],
  Furnitures: ['Interior project', 'E-commerce order', 'Wholesale batch', 'Custom build'],
  Education: ['Tuition fees', 'Online course', 'Workshop ticket', 'Material kit'],
};
const EXPENSE_LABELS = ['Raw materials', 'Staff salary', 'Rent & utilities', 'Marketing', 'Logistics'];

function monthsAgo(n: number): { year: number; month: number } {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function dateInPeriod(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 10, 0, 0);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean (respect FK order)
  await prisma.investorInterest.deleteMany();
  await prisma.document.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.financeReport.deleteMany();
  await prisma.pOSIntegration.deleteMany();
  await prisma.uMKM.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@grow.id',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
      fullName: 'Platform Admin',
    },
  });

  // Investors
  const investor = await prisma.user.create({
    data: {
      email: 'investor@grow.id',
      passwordHash: await hashPassword('investor123'),
      role: 'INVESTOR',
      fullName: 'Daniel Investor',
    },
  });
  await prisma.user.create({
    data: {
      email: 'ventura@grow.id',
      passwordHash: await hashPassword('investor123'),
      role: 'INVESTOR',
      fullName: 'Nusantara Ventures',
    },
  });

  const NUM_MONTHS = 6;
  const createdUmkms: { id: string; idx: number }[] = [];

  for (let idx = 0; idx < MSMES.length; idx++) {
    const m = MSMES[idx];
    const user = await prisma.user.create({
      data: {
        email: m.email,
        passwordHash: await hashPassword('umkm123'),
        role: 'MSME',
        fullName: m.fullName,
      },
    });

    const umkm = await prisma.uMKM.create({
      data: {
        ownerId: user.id,
        name: m.name,
        ownerName: m.fullName,
        category: m.category,
        city: m.city,
        address: `${m.city}, Indonesia`,
        contactPerson: m.fullName,
        yearEstablished: m.yearEstablished,
        description: m.description,
        status: m.publish ? 'PUBLISHED' : 'DRAFT',
        adminApproved: m.approved,
      },
    });

    if (m.pos) {
      await prisma.pOSIntegration.create({
        data: { umkmId: umkm.id, provider: m.pos, isActive: true, lastSyncAt: new Date() },
      });
    }

    const reports: { periodYear: number; periodMonth: number; totalRevenue: number; totalExpense: number; netIncome: number }[] = [];
    let txnCount = 0;

    for (let i = NUM_MONTHS - 1; i >= 0; i--) {
      const { year, month } = monthsAgo(i);
      const monthsForward = NUM_MONTHS - 1 - i;
      const revenue = Math.round(m.baseRevenue * Math.pow(1 + m.growthPct, monthsForward));
      const net = Math.round(revenue * m.marginPct);
      const expense = revenue - net;

      await prisma.financeReport.create({
        data: {
          umkmId: umkm.id,
          periodYear: year,
          periodMonth: month,
          totalRevenue: revenue,
          totalExpense: expense,
          grossProfit: Math.round(revenue * (m.marginPct + 0.18)),
          netIncome: net,
          sourceFiles: m.pos ? [`pos:${m.pos.toLowerCase()}`] : ['manual'],
        },
      });
      reports.push({ periodYear: year, periodMonth: month, totalRevenue: revenue, totalExpense: expense, netIncome: net });

      // A few representative transactions per recent month (latest 3 months)
      if (i <= 2) {
        const incomes = INCOME_LABELS[m.category] ?? ['Sales'];
        for (let k = 0; k < 4; k++) {
          await prisma.transaction.create({
            data: {
              umkmId: umkm.id,
              amount: Math.round((revenue / 4) * (0.85 + (k % 3) * 0.1)),
              type: 'INCOME',
              category: 'Sales',
              source: m.pos ? 'POS' : 'MANUAL',
              description: incomes[k % incomes.length],
              date: dateInPeriod(year, month, 4 + k * 6),
            },
          });
          txnCount++;
        }
        for (let k = 0; k < 3; k++) {
          await prisma.transaction.create({
            data: {
              umkmId: umkm.id,
              amount: Math.round((expense / 3) * (0.9 + (k % 2) * 0.15)),
              type: 'EXPENSE',
              category: 'Operations',
              source: m.pos ? 'POS' : 'MANUAL',
              description: EXPENSE_LABELS[k % EXPENSE_LABELS.length],
              date: dateInPeriod(year, month, 6 + k * 7),
            },
          });
          txnCount++;
        }
      }
    }

    // Documents (only for published/approved demonstrate readiness).
    // Stored as Markdown so the preview renders cleanly; marked aiGenerated:false
    // (sample data). Real AI documents are created via the "Generate with AI" button.
    let docCount = 0;
    if (m.approved) {
      await prisma.document.create({
        data: {
          umkmId: umkm.id,
          type: 'BUSINESS_PROFILE',
          title: `${m.name} — Business Profile`,
          generatedContent: {
            aiGenerated: false,
            markdown: `# ${m.name} — Business Profile\n\n**Category:** ${m.category}\n**Location:** ${m.city}\n**Established:** ${m.yearEstablished}\n**Owner:** ${m.fullName}\n\n## About\n${m.description}`,
          },
        },
      });
      await prisma.document.create({
        data: {
          umkmId: umkm.id,
          type: 'FINANCIAL_STATEMENT',
          title: `${m.name} — Financial Statement (6 months)`,
          generatedContent: {
            aiGenerated: false,
            markdown: `# ${m.name} — Financial Statement\n\nPeriod: last ${NUM_MONTHS} months.\n\nSee the financial analysis and monthly charts on the public profile for the full breakdown.`,
          },
        },
      });
      docCount = 2;
    }

    const score = computeProspectScore({
      reports,
      posConnected: !!m.pos,
      documentCount: docCount,
      transactionCount: txnCount,
      profileComplete: true,
    });

    await prisma.uMKM.update({ where: { id: umkm.id }, data: { prospectScore: score } });
    createdUmkms.push({ id: umkm.id, idx });
    console.log(`  ✓ ${m.name} — prospect score ${score}${m.publish ? '' : ' (draft)'}`);
  }

  // Seed a couple investor interests so the pipeline isn't empty
  const published = createdUmkms.filter((c) => MSMES[c.idx].publish);
  if (published[0]) {
    await prisma.investorInterest.create({
      data: { investorId: investor.id, umkmId: published[0].id, status: 'INTERESTED', note: 'Strong margins, want to learn more.' },
    });
  }
  if (published[2]) {
    await prisma.investorInterest.create({
      data: { investorId: investor.id, umkmId: published[2].id, status: 'MEETING', note: 'Scheduled intro call.' },
    });
  }

  console.log('✅ Seed complete.');
  console.log('   Admin:    admin@grow.id / admin123');
  console.log('   Investor: investor@grow.id / investor123');
  console.log('   MSME:     kopi.senja@umkm.id / umkm123 (and others @umkm.id)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
