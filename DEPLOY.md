# Deploying Grow to DigitalOcean

Same model as the qrypto / goodcafes projects: **CI builds the images and pushes them to GHCR,
the Droplet only pulls** (it never builds). Caddy terminates TLS and routes one domain:
`/api/*` → gateway, everything else → the Next.js frontend.

## Architecture
- **GitHub Actions** (`.github/workflows/deploy.yml`): builds `grow-backend` + `grow-frontend`
  images → pushes to `ghcr.io/<owner>/...` → SSHes to the Droplet → `docker compose pull`,
  runs migrations, `up -d`.
- **Droplet**: just needs Docker, a `.env`, and your deploy public key authorized. No repo clone,
  no building.

## 1. GitHub config (one time)
Repo → **Settings → Secrets and variables → Actions**:

**Secrets**
| Secret | Value |
|---|---|
| `DEPLOY_HOST` | Droplet IP / hostname |
| `DEPLOY_USER` | SSH user (e.g. `root`) |
| `DEPLOY_SSH_KEY` | **raw** private key (multi-line) already authorized on the Droplet — reuse the same key your other projects use |
| `DEPLOY_PATH` | compose dir on the Droplet, e.g. `/opt/grow` |

**Variables** (not secret)
| Variable | Value |
|---|---|
| `PUBLIC_URL` | public URL baked into the frontend, e.g. `https://grow.example.com` (or `http://DROPLET_IP`) |

GHCR auth uses the built-in `GITHUB_TOKEN` — no extra secret. Make sure **Settings → Actions →
General → Workflow permissions** allows read/write (for `packages: write`).

## 2. Droplet prep (one time)
SSH in with your existing access, then:
```bash
sudo mkdir -p /opt/grow && cd /opt/grow
# create .env (see .env.production.example in the repo) and fill in secrets:
nano .env   # POSTGRES_PASSWORD, JWT_SECRET, AI_API_KEY, PUBLIC_URL, DOMAIN, CADDY_* if needed
```
That's it — CI copies `docker-compose.prod.yml` + `deploy/Caddyfile` here on each deploy.

> **Shared Droplet note:** if this Droplet already serves another app on ports 80/443, set
> `CADDY_HTTP_PORT` / `CADDY_HTTPS_PORT` in `.env` to free ports (or route to the `frontend` /
> `gateway` containers from your existing reverse proxy) so Grow's Caddy doesn't collide.

## 3. Deploy
Push to `main` (or **Actions → Deploy → Run workflow**). CI builds, pushes, and the Droplet pulls
& starts everything.

## 4. Seed demo data (once)
```bash
cd /opt/grow
docker compose -f docker-compose.prod.yml run --rm migrate bun run shared/seed.ts
```
(Re-running wipes & reseeds — initial demo only.)

## 5. Open it
`https://grow.example.com` (or `http://DROPLET_IP:CADDY_HTTP_PORT`).
Demo logins: `admin@grow.id / admin123`, `investor@grow.id / investor123`, `kopi.senja@umkm.id / umkm123`.

## CI (quality gate)
`.github/workflows/ci.yml` runs on every push & PR: frontend build, backend transpile-check +
Prisma generate, and compose validation.

## Operations
```bash
cd /opt/grow
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f gateway
```

## Notes
- Data persists in volumes (`pgdata`, `redisdata`, `rabbitmqdata`). Back up `pgdata`.
- GHCR images are private by default; the Droplet logs in with the workflow token at deploy time.
  To allow pulls outside CI (e.g. manual), either keep deploying via CI or make the packages public.
- `PUBLIC_URL` is baked into the frontend at **build** time (CI), so changing it requires a new
  deploy run, not just an `.env` edit.
