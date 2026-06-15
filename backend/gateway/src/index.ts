import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { verifyToken } from '../../shared/auth';

const PORT = Number(process.env.GATEWAY_PORT) || 8080;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// path prefix -> downstream service base URL
const ROUTES: Record<string, string> = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3004',
  umkm: process.env.UMKM_SERVICE_URL || 'http://localhost:3003',
  finance: process.env.FINANCE_SERVICE_URL || 'http://localhost:3002',
  pos: process.env.POS_SERVICE_URL || 'http://localhost:3001',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:3005',
};

// headers we never trust from the client — only the gateway may set these
const IDENTITY_HEADERS = ['x-user-id', 'x-user-role', 'x-user-email', 'x-user-name'];
// hop-by-hop / encoding headers to drop from the upstream response
const STRIP_RESPONSE = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const app = new Elysia()
  .use(cors({ origin: CORS_ORIGIN, credentials: true }))

  .get('/', () => ({ service: 'api-gateway', status: 'active', routes: Object.keys(ROUTES) }))
  .get('/health', () => ({ ok: true }))

  .all('/api/*', async ({ request }) => {
    const url = new URL(request.url);
    const segments = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const service = segments[0];
    const target = ROUTES[service];
    if (!target) return json(404, { success: false, error: `Unknown API route: /${service ?? ''}` });

    const restPath = '/' + segments.slice(1).join('/');
    const targetUrl = target + (restPath === '/' ? '' : restPath) + url.search;

    // forward headers minus host + any spoofed identity headers
    const headers = new Headers(request.headers);
    headers.delete('host');
    IDENTITY_HEADERS.forEach((h) => headers.delete(h));

    // verify JWT (if present) and inject trusted identity
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      try {
        const p = verifyToken(auth.slice(7));
        headers.set('x-user-id', p.sub);
        headers.set('x-user-role', p.role);
        headers.set('x-user-email', p.email);
        headers.set('x-user-name', encodeURIComponent(p.fullName || ''));
      } catch {
        // invalid/expired token: forward without identity; downstream enforces auth
      }
    }

    const init: RequestInit = { method: request.method, headers };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.arrayBuffer();
    }

    let upstream: Response;
    try {
      upstream = await fetch(targetUrl, init);
    } catch (e) {
      console.error(`[gateway] ${service} unreachable:`, (e as Error).message);
      return json(502, { success: false, error: `Service '${service}' is unavailable` });
    }

    const respHeaders = new Headers(upstream.headers);
    STRIP_RESPONSE.forEach((h) => respHeaders.delete(h));
    return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
  })

  .listen(PORT);

console.log(`🚪 api-gateway running at http://localhost:${app.server?.port}`);
console.log(`   routing: ${Object.entries(ROUTES).map(([k, v]) => `/api/${k} -> ${v}`).join('  ')}`);
