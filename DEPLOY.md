# Deploying Grow to DigitalOcean

The whole stack (frontend + API gateway + 5 microservices + Postgres + Redis + RabbitMQ + Caddy)
runs from **`docker-compose.prod.yml`** on a single **DigitalOcean Droplet**. Caddy terminates TLS
and routes one domain: `/api/*` → gateway, everything else → the Next.js frontend.

> Why a Droplet (not App Platform)? The architecture uses **RabbitMQ**, which DO App Platform has
> no managed equivalent for. A Droplet running Docker Compose keeps the event-driven design intact
> and is the simplest one-command deploy.

## 1. Create the Droplet
- Ubuntu 24.04 LTS, **2 vCPU / 4 GB RAM** or larger (Bun services + RabbitMQ).
- Add your SSH key. Note the public IP.
- (Optional, for HTTPS) Point a domain's **A record** to the Droplet IP.

## 2. Install Docker
```bash
ssh root@YOUR_DROPLET_IP
curl -fsSL https://get.docker.com | sh
```

## 3. Get the code & configure env
```bash
git clone <your-repo-url> grow && cd grow
cp .env.production.example .env
nano .env   # set PUBLIC_URL, DOMAIN, POSTGRES_PASSWORD, JWT_SECRET, AI_API_KEY
```
- **With a domain:** `PUBLIC_URL=https://grow.example.com` and `DOMAIN=grow.example.com` → Caddy gets a Let's Encrypt cert automatically.
- **IP only (no domain):** `PUBLIC_URL=http://YOUR_DROPLET_IP` and `DOMAIN=:80` (plain HTTP).
- Set a strong `JWT_SECRET` and `POSTGRES_PASSWORD`. Paste your free Groq key into `AI_API_KEY` (or leave blank for the data-driven fallback).

## 4. Launch
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
First build takes a few minutes. Migrations run automatically.

## 5. Seed demo data (once)
```bash
docker compose -f docker-compose.prod.yml run --rm migrate bun run shared/seed.ts
```
(Re-running this **wipes and reseeds** — only for the initial demo.)

## 6. Open it
- `https://grow.example.com` (or `http://YOUR_DROPLET_IP`).
- Demo logins: `admin@grow.id / admin123`, `investor@grow.id / investor123`, `kopi.senja@umkm.id / umkm123`.

## Firewall
```bash
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```
Only 80/443 (Caddy) are public; all services talk over the internal Docker network.

## Updating
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Operations
```bash
docker compose -f docker-compose.prod.yml ps                 # status
docker compose -f docker-compose.prod.yml logs -f gateway    # logs
docker compose -f docker-compose.prod.yml down               # stop (keeps data volumes)
```

## CI/CD (GitHub Actions)

Two workflows live in `.github/workflows/`:

- **`ci.yml`** — runs on every push & PR: builds the frontend, transpile-checks every backend
  entrypoint (Bun) + generates the Prisma client, and validates both compose files.
- **`deploy.yml`** — on push to `main` (or manual *Run workflow*): SSHes into the Droplet and runs
  `git pull && docker compose -f docker-compose.prod.yml up -d --build`.

**One-time setup for auto-deploy** (GitHub repo → Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | Droplet IP / hostname |
| `DEPLOY_USER` | SSH user (e.g. `root`) |
| `DEPLOY_SSH_KEY` | a private key whose public key is in the Droplet's `~/.ssh/authorized_keys` |
| `DEPLOY_PATH` | *(optional)* app dir on the Droplet (default `~/grow`) |

The Droplet must already have the repo cloned and `.env` filled in (steps 3–4 above). After that,
every push to `main` redeploys automatically. Generate a deploy key with
`ssh-keygen -t ed25519 -C grow-deploy`, add the **public** part to the Droplet and the **private**
part as `DEPLOY_SSH_KEY`.

## Notes
- Data persists in named volumes (`pgdata`, `redisdata`, `rabbitmqdata`). Back up `pgdata` regularly.
- To change the AI provider/model later, edit `.env` and `docker compose ... up -d` (no rebuild needed for backend env).
- `NEXT_PUBLIC_API_URL` is baked into the frontend at build time, so changing `PUBLIC_URL` requires `--build`.
