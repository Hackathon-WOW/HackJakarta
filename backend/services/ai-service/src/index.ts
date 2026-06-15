import { t } from 'elysia';
import { prisma } from '../../../shared/db';
import { createService } from '../../../shared/service';
import { requireRole, requireAuth, HttpError, type AuthUser } from '../../../shared/auth';
import { buildMetrics } from '../../../shared/metrics';
import { prospectLabel } from '../../../shared/scoring';
import { chat, chatStream, isAIConfigured, aiInfo, parseJsonResponse, AIUnavailable, type ChatMessage } from '../../../shared/ai';

const PORT = Number(process.env.AI_SERVICE_PORT) || 3005;

const money = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

// ---- access + context ----
async function loadUmkm(umkmId: string) {
  const umkm = await prisma.uMKM.findUnique({
    where: { id: umkmId },
    include: { financeReports: true, posIntegrations: true, documents: true, _count: { select: { investorInterests: true } } },
  });
  if (!umkm) throw new HttpError(404, 'UMKM not found');
  return umkm;
}

async function ownUmkm(user: AuthUser | null) {
  const u = requireRole(user, 'MSME');
  const umkm = await prisma.uMKM.findUnique({ where: { ownerId: u.id } });
  if (!umkm) throw new HttpError(404, 'UMKM profile not found');
  return loadUmkm(umkm.id);
}

function assertCanView(user: AuthUser | null, umkm: any) {
  const isPublic = umkm.status === 'PUBLISHED' && umkm.adminApproved;
  if (isPublic) return;
  const u = requireAuth(user);
  if (u.role === 'ADMIN' || u.id === umkm.ownerId) return;
  throw new HttpError(403, 'This profile is not published yet');
}

function buildContext(umkm: any) {
  const metrics = buildMetrics(umkm.financeReports);
  const pos = umkm.posIntegrations.filter((p: any) => p.isActive).map((p: any) => p.provider);
  const series = metrics.series
    .map((s: any) => `${s.label}: revenue ${money(s.revenue)}, net ${money(s.netIncome)}, margin ${s.margin}%`)
    .join('\n');

  const contextText = `Business: ${umkm.name}
Category: ${umkm.category} | City: ${umkm.city ?? 'Indonesia'} | Established: ${umkm.yearEstablished ?? 'unknown'}
Owner: ${umkm.ownerName}
Description: ${umkm.description ?? '(none provided)'}
Prospect Score: ${umkm.prospectScore}/100 (${prospectLabel(umkm.prospectScore)})
Financial summary over ${metrics.months} months:
- Total revenue: ${money(metrics.totalRevenue)}
- Total net income: ${money(metrics.totalNet)}
- Average net margin: ${metrics.avgMargin}%
- Revenue growth over the period: ${metrics.periodGrowth}%
- Latest month revenue: ${money(metrics.latestRevenue)}
Monthly breakdown:
${series || '(no monthly data yet)'}
Active POS integrations: ${pos.length ? pos.join(', ') : 'none'}
Documents on file: ${umkm.documents.length}
Investor interests: ${umkm._count.investorInterests}`;

  return { metrics, contextText, posActive: pos.length > 0 };
}

// ---- data-driven fallbacks (used when no AI provider configured) ----
function fallbackInsights(umkm: any, ctx: ReturnType<typeof buildContext>) {
  const m = ctx.metrics;
  const insights: { title: string; detail: string; tone: string }[] = [];

  if (m.months === 0) {
    insights.push({ title: 'No financial data yet', detail: 'Connect a POS or upload a report so we can analyze your business.', tone: 'warning' });
  } else {
    insights.push(
      m.avgMargin >= 20
        ? { title: 'Healthy profitability', detail: `Your average net margin of ${m.avgMargin}% is strong and attractive to investors.`, tone: 'positive' }
        : m.avgMargin >= 10
        ? { title: 'Moderate margins', detail: `A ${m.avgMargin}% net margin is acceptable; reducing COGS or operating costs would strengthen your case.`, tone: 'neutral' }
        : { title: 'Thin margins', detail: `A ${m.avgMargin}% net margin is low. Review pricing and cost of goods to improve profitability.`, tone: 'warning' },
    );
    insights.push(
      m.periodGrowth > 5
        ? { title: 'Revenue is growing', detail: `Revenue grew ${m.periodGrowth}% over the period — a positive signal of traction.`, tone: 'positive' }
        : m.periodGrowth >= 0
        ? { title: 'Flat revenue', detail: `Revenue grew only ${m.periodGrowth}%. Investors look for momentum — consider growth experiments.`, tone: 'neutral' }
        : { title: 'Declining revenue', detail: `Revenue declined ${m.periodGrowth}% over the period. Identify and address the cause before fundraising.`, tone: 'warning' },
    );
  }
  insights.push(
    ctx.posActive
      ? { title: 'POS connected', detail: 'Live POS data makes your financials more credible and verifiable.', tone: 'positive' }
      : { title: 'Connect a POS', detail: 'Linking a POS (Moka, Pawoon, majoo, GoBiz) adds verifiable transaction data and lifts your score.', tone: 'neutral' },
  );

  const recommendations = [
    !umkm.description || !umkm.city || !umkm.yearEstablished ? 'Complete your business profile (description, city, year established).' : null,
    m.months < 3 ? 'Add at least 3 months of financial data for a credible trend.' : null,
    umkm.documents.length === 0 ? 'Generate investor documents (profile, financial statement, pitch).' : null,
    !ctx.posActive ? 'Connect and sync a POS for verifiable revenue data.' : null,
    'Aim to publish to the showcase once your profile and financials are complete.',
  ].filter(Boolean) as string[];

  return { summary: `${umkm.name} scores ${umkm.prospectScore}/100 (${prospectLabel(umkm.prospectScore)}).`, insights, recommendations, aiGenerated: false };
}

function fallbackBrief(umkm: any, ctx: ReturnType<typeof buildContext>) {
  const m = ctx.metrics;
  const strengths = [
    m.avgMargin >= 18 ? `Strong net margin (${m.avgMargin}%)` : null,
    m.periodGrowth > 5 ? `Revenue growth of ${m.periodGrowth}% over the period` : null,
    ctx.posActive ? 'Verifiable POS-linked transaction data' : null,
    m.months >= 6 ? `${m.months} months of financial history` : null,
    umkm.prospectScore >= 70 ? `High prospect score (${umkm.prospectScore}/100)` : null,
  ].filter(Boolean) as string[];

  const risks = [
    m.avgMargin < 12 ? `Thin net margin (${m.avgMargin}%)` : null,
    m.periodGrowth < 0 ? `Revenue declined ${m.periodGrowth}% over the period` : null,
    m.months < 3 ? 'Limited financial track record' : null,
    !ctx.posActive ? 'No live POS integration to verify revenue' : null,
    'Customer concentration and supplier dependence are unknown',
  ].filter(Boolean) as string[];

  const dueDiligence = [
    'What is the revenue split across products/channels?',
    'What are the main cost drivers and how do they scale?',
    'Who are the top customers and what is their concentration?',
    'What is the use of funds and expected runway?',
    'Are there any debts, legal, or licensing obligations?',
  ];

  return {
    summary: `${umkm.name} is a ${umkm.category} business in ${umkm.city ?? 'Indonesia'} scoring ${umkm.prospectScore}/100 (${prospectLabel(umkm.prospectScore)}), with ${m.avgMargin}% average net margin and ${m.periodGrowth}% revenue growth over ${m.months} months.`,
    strengths: strengths.length ? strengths : ['Established and operating business'],
    risks,
    dueDiligence,
    aiGenerated: false,
  };
}

function fallbackDocument(umkm: any, ctx: ReturnType<typeof buildContext>, type: string) {
  const m = ctx.metrics;
  if (type === 'PITCH_SUMMARY') {
    return `# ${umkm.name} — Investment Pitch

**${umkm.category} · ${umkm.city ?? 'Indonesia'} · since ${umkm.yearEstablished ?? '—'}**

## Overview
${umkm.description ?? umkm.name + ' is a growing Indonesian MSME.'}

## Traction & Financials (last ${m.months} months)
- Total revenue: ${money(m.totalRevenue)}
- Net income: ${money(m.totalNet)}
- Average net margin: ${m.avgMargin}%
- Revenue growth: ${m.periodGrowth}%

## Why invest
Prospect Score ${umkm.prospectScore}/100 (${prospectLabel(umkm.prospectScore)}). ${ctx.posActive ? 'Revenue is verified through live POS integration.' : ''}

## The ask
Capital to scale production, expand marketing & distribution, and grow the team.`;
  }
  if (type === 'FINANCIAL_STATEMENT') {
    return `# ${umkm.name} — Financial Statement

Period: last ${m.months} months

| Metric | Value |
|---|---|
| Total revenue | ${money(m.totalRevenue)} |
| Total expense | ${money(m.totalExpense)} |
| Net income | ${money(m.totalNet)} |
| Average net margin | ${m.avgMargin}% |
| Revenue growth | ${m.periodGrowth}% |

## Monthly detail
${m.series.map((s: any) => `- ${s.label}: revenue ${money(s.revenue)}, net ${money(s.netIncome)} (${s.margin}% margin)`).join('\n') || '(no data)'}`;
  }
  return `# ${umkm.name} — Business Profile

**Category:** ${umkm.category}
**Location:** ${umkm.city ?? 'Indonesia'}
**Established:** ${umkm.yearEstablished ?? '—'}
**Owner:** ${umkm.ownerName}

## About
${umkm.description ?? '(No description provided.)'}

## Highlights
- ${m.months} months of tracked financials
- Average net margin ${m.avgMargin}%
- Revenue growth ${m.periodGrowth}% over the period
- Prospect Score ${umkm.prospectScore}/100 (${prospectLabel(umkm.prospectScore)})`;
}

// ---- service ----
const app = createService('ai')
  .get('/', () => ({ service: 'ai-service', status: 'active', ...aiInfo() }))
  .get('/status', () => ({ success: true, ...aiInfo() }))

  // Financial insights for an UMKM (owner/admin, or public if published)
  .get('/insights/:umkmId', async ({ params: { umkmId }, user }) => {
    const umkm = await loadUmkm(umkmId);
    assertCanView(user, umkm);
    const ctx = buildContext(umkm);

    if (isAIConfigured()) {
      try {
        const raw = await chat(
          [
            {
              role: 'system',
              content:
                'You are a financial analyst helping an Indonesian MSME become investor-ready. ' +
                'Given the business data, respond ONLY with JSON: ' +
                '{"summary": string, "insights": [{"title": string, "detail": string, "tone": "positive"|"neutral"|"warning"}], "recommendations": [string]}. ' +
                'Reference the actual numbers. Be specific and concise (max 5 insights, 5 recommendations).',
            },
            { role: 'user', content: ctx.contextText },
          ],
          { json: true, temperature: 0.4 },
        );
        const parsed = parseJsonResponse(raw);
        if (parsed?.insights) return { success: true, data: { ...parsed, aiGenerated: true } };
      } catch (e) {
        if (!(e instanceof AIUnavailable)) throw e;
      }
    }
    return { success: true, data: fallbackInsights(umkm, ctx) };
  })

  // Investor brief (strengths/risks/DD) — public if published, else owner/admin
  .get('/brief/:umkmId', async ({ params: { umkmId }, user }) => {
    const umkm = await loadUmkm(umkmId);
    assertCanView(user, umkm);
    const ctx = buildContext(umkm);

    if (isAIConfigured()) {
      try {
        const raw = await chat(
          [
            {
              role: 'system',
              content:
                'You are an investment analyst writing a brief for investors evaluating an Indonesian MSME. ' +
                'Respond ONLY with JSON: {"summary": string, "strengths": [string], "risks": [string], "dueDiligence": [string]}. ' +
                'Ground every claim in the provided data. Be balanced and concise.',
            },
            { role: 'user', content: ctx.contextText },
          ],
          { json: true, temperature: 0.4 },
        );
        const parsed = parseJsonResponse(raw);
        if (parsed?.strengths) return { success: true, data: { ...parsed, aiGenerated: true } };
      } catch (e) {
        if (!(e instanceof AIUnavailable)) throw e;
      }
    }
    return { success: true, data: fallbackBrief(umkm, ctx) };
  })

  // Generate an AI-written document and store it (MSME own)
  .post(
    '/document',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const type = body.type;
      if (!['BUSINESS_PROFILE', 'FINANCIAL_STATEMENT', 'PITCH_SUMMARY'].includes(type)) {
        throw new HttpError(400, 'Invalid document type');
      }
      const ctx = buildContext(umkm);
      const titleMap: Record<string, string> = {
        BUSINESS_PROFILE: `${umkm.name} — Business Profile`,
        FINANCIAL_STATEMENT: `${umkm.name} — Financial Statement`,
        PITCH_SUMMARY: `${umkm.name} — Investment Pitch`,
      };

      let markdown = '';
      let aiGenerated = false;
      if (isAIConfigured()) {
        try {
          const kind =
            type === 'PITCH_SUMMARY'
              ? 'a concise, persuasive investor pitch (problem, solution, traction with the real numbers, why now, and the ask)'
              : type === 'FINANCIAL_STATEMENT'
              ? 'a clear narrative financial statement summarizing the figures with a short table'
              : 'a one-page business profile';
          markdown = await chat(
            [
              {
                role: 'system',
                content: `You are a business writer creating investor-ready documents for an Indonesian MSME. Write ${kind} in clean Markdown. Use the real figures provided. Keep it professional and under 400 words. Output only the Markdown.`,
              },
              { role: 'user', content: ctx.contextText },
            ],
            { temperature: 0.6, maxTokens: 1200 },
          );
          aiGenerated = true;
        } catch (e) {
          if (!(e instanceof AIUnavailable)) throw e;
        }
      }
      if (!markdown) markdown = fallbackDocument(umkm, ctx, type);

      const doc = await prisma.document.create({
        data: { umkmId: umkm.id, type: type as any, title: titleMap[type], generatedContent: { markdown, aiGenerated } as any },
      });
      return { success: true, data: doc, aiGenerated };
    },
    { body: t.Object({ type: t.String() }) },
  )

  // Advisor chat (MSME) — grounded in their data
  .post(
    '/chat',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const ctx = buildContext(umkm);
      const history = (body.messages || []).slice(-8).map((mm: any) => ({
        role: mm.role === 'assistant' ? 'assistant' : 'user',
        content: String(mm.content || '').slice(0, 2000),
      })) as ChatMessage[];

      if (isAIConfigured()) {
        try {
          const reply = await chat(
            [
              {
                role: 'system',
                content:
                  "You are Grow's AI advisor helping an Indonesian MSME owner become investor-ready. " +
                  'Be practical, encouraging, and specific. Use their business data below when relevant. ' +
                  'Reply in the same language as the user. Keep answers concise.\n\n--- BUSINESS DATA ---\n' +
                  ctx.contextText,
              },
              ...history,
            ],
            { temperature: 0.7, maxTokens: 800 },
          );
          return { success: true, data: { reply, aiGenerated: true } };
        } catch (e) {
          if (!(e instanceof AIUnavailable)) throw e;
        }
      }

      // Fallback: a helpful, data-aware canned reply
      const m = ctx.metrics;
      const gaps = fallbackInsights(umkm, ctx).recommendations.slice(0, 3);
      const reply =
        `Here's a quick read on ${umkm.name} (Prospect Score ${umkm.prospectScore}/100):\n\n` +
        `• Revenue (last ${m.months} mo): ${money(m.totalRevenue)} · Net margin: ${m.avgMargin}% · Growth: ${m.periodGrowth}%\n\n` +
        `Top things to improve your investor-readiness:\n` +
        gaps.map((g) => `• ${g}`).join('\n') +
        `\n\n(Connect a free AI provider — Groq, Gemini, or local Ollama — to chat with the full AI advisor.)`;
      return { success: true, data: { reply, aiGenerated: false } };
    },
    { body: t.Object({ messages: t.Array(t.Object({ role: t.String(), content: t.String() })) }) },
  )

  // Streaming advisor chat — emits text deltas as they are generated
  .post(
    '/chat/stream',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const ctx = buildContext(umkm);
      const history = (body.messages || []).slice(-8).map((mm: any) => ({
        role: mm.role === 'assistant' ? 'assistant' : 'user',
        content: String(mm.content || '').slice(0, 2000),
      })) as ChatMessage[];

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            "You are Grow's AI advisor helping an Indonesian MSME owner become investor-ready. " +
            'Be practical, encouraging, and specific. Use their business data below when relevant. ' +
            'Reply in the same language as the user. Use Markdown. Keep answers concise.\n\n--- BUSINESS DATA ---\n' +
            ctx.contextText,
        },
        ...history,
      ];

      const enc = new TextEncoder();
      if (!isAIConfigured()) {
        const m = ctx.metrics;
        const gaps = fallbackInsights(umkm, ctx).recommendations.slice(0, 3);
        const reply =
          `Here's a quick read on **${umkm.name}** (Prospect Score ${umkm.prospectScore}/100):\n\n` +
          `- Revenue (last ${m.months} mo): ${money(m.totalRevenue)}\n- Net margin: ${m.avgMargin}%\n- Growth: ${m.periodGrowth}%\n\n` +
          `**Top things to improve:**\n` +
          gaps.map((g) => `- ${g}`).join('\n') +
          `\n\n_(Connect a free AI provider for the full AI advisor.)_`;
        return new Response(reply, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      }

      const stream = new ReadableStream({
        async start(controller) {
          try {
            await chatStream(messages, { temperature: 0.7, maxTokens: 800 }, (d) => controller.enqueue(enc.encode(d)));
          } catch (e) {
            controller.enqueue(enc.encode(`\n\n_[AI error: ${(e as Error).message}]_`));
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    },
    { body: t.Object({ messages: t.Array(t.Object({ role: t.String(), content: t.String() })) }) },
  )

  // Streaming document generation — streams Markdown, then persists the document
  .post(
    '/document/stream',
    async ({ user, body }) => {
      const umkm = await ownUmkm(user);
      const type = body.type;
      if (!['BUSINESS_PROFILE', 'FINANCIAL_STATEMENT', 'PITCH_SUMMARY'].includes(type)) {
        throw new HttpError(400, 'Invalid document type');
      }
      const ctx = buildContext(umkm);
      const titleMap: Record<string, string> = {
        BUSINESS_PROFILE: `${umkm.name} — Business Profile`,
        FINANCIAL_STATEMENT: `${umkm.name} — Financial Statement`,
        PITCH_SUMMARY: `${umkm.name} — Investment Pitch`,
      };
      const enc = new TextEncoder();

      if (!isAIConfigured()) {
        const md = fallbackDocument(umkm, ctx, type);
        await prisma.document.create({
          data: { umkmId: umkm.id, type: type as any, title: titleMap[type], generatedContent: { markdown: md, aiGenerated: false } as any },
        });
        return new Response(md, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      }

      const kind =
        type === 'PITCH_SUMMARY'
          ? 'a concise, persuasive investor pitch (problem, solution, traction with the real numbers, why now, and the ask)'
          : type === 'FINANCIAL_STATEMENT'
          ? 'a clear narrative financial statement summarizing the figures with a short table'
          : 'a one-page business profile';
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a business writer creating investor-ready documents for an Indonesian MSME. Write ${kind} in clean Markdown. Use the real figures provided. Keep it professional and under 400 words. Output only the Markdown.`,
        },
        { role: 'user', content: ctx.contextText },
      ];

      const stream = new ReadableStream({
        async start(controller) {
          let full = '';
          try {
            full = await chatStream(messages, { temperature: 0.6, maxTokens: 1200 }, (d) => controller.enqueue(enc.encode(d)));
          } catch (e) {
            controller.enqueue(enc.encode(`\n\n_[AI error: ${(e as Error).message}]_`));
          } finally {
            controller.close();
          }
          if (full.trim()) {
            await prisma.document
              .create({ data: { umkmId: umkm.id, type: type as any, title: titleMap[type], generatedContent: { markdown: full, aiGenerated: true } as any } })
              .catch(() => {});
          }
        },
      });
      return new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    },
    { body: t.Object({ type: t.String() }) },
  )

  .listen(PORT);

console.log(`🤖 ai-service running at http://localhost:${app.server?.port} (AI ${isAIConfigured() ? 'configured: ' + aiInfo().model : 'fallback mode'})`);
