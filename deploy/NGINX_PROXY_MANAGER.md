# Nginx Proxy Manager setup

Use this when the blog runs in its own Proxmox LXC and Nginx Proxy Manager runs separately.

## Target topology

```text
Internet -> UniFi TCP 80/443 -> nginxproxymanager LXC -> blog LXC
                                               192.168.0.x:3000 app
                                               192.168.0.x:3001 Umami
```

Your current Proxmox host is `proxarr` at `192.168.0.2`, and Nginx Proxy Manager is LXC `111`. Create a new LXC for the blog instead of installing it into the Nginx Proxy Manager container.

For concrete `pct` commands, follow [PROXMOX_LXC.md](PROXMOX_LXC.md) first, then return here to configure the proxy hosts.

## Blog LXC

Recommended starting values:

- VMID: `112`, if it is still free
- Hostname: `blog`
- Static IP: choose a free LAN address, for example `192.168.0.112`
- OS: Debian 12 or Ubuntu 24.04
- CPU: 2 cores
- RAM: 2-4 GB
- Disk: 32 GB minimum, more if you upload media often
- Features: enable nesting if you plan to run Docker inside an LXC

On the blog LXC, clone the repo and create the production env file:

```bash
git clone https://github.com/Pieter-Geerts/blog.git
cd blog
cp deploy/env.production.example .env.production
chmod 600 .env.production
```

Edit `.env.production` and set:

```text
HOST_BIND_IP=192.168.0.112
POSTGRES_PASSWORD=<long-random-value>
PAYLOAD_SECRET=<long-random-value>
UMAMI_APP_SECRET=<long-random-value>
```

Use the actual blog LXC IP for `HOST_BIND_IP`. You can use `0.0.0.0` during setup, but binding to the LXC IP is tighter.

Start the services:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build app
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm migrate
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

The migration command initializes the Payload tables in the `portfolio` database before the app serves `/admin`.

Listmonk initializes its own database tables during startup. If you previously saw Postgres errors like `relation "templates" does not exist`, pull the latest repository changes and recreate the Listmonk container:

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate listmonk
```

From the Nginx Proxy Manager LXC, verify it can reach the blog LXC:

```bash
curl -I http://192.168.0.112:3000
curl -I http://192.168.0.112:3001
```

## Proxy hosts

In Nginx Proxy Manager, create these proxy hosts.

For the main site:

- Domain Names: `pietergeerts.eu`, `www.pietergeerts.eu`
- Scheme: `http`
- Forward Hostname / IP: `192.168.0.112`
- Forward Port: `3000`
- Cache Assets: off
- Block Common Exploits: on
- Websockets Support: on
- SSL: request a new Let's Encrypt certificate
- Force SSL: on
- HTTP/2 Support: on
- HSTS: only enable after HTTPS is verified

Add this under Advanced to redirect `www` to the apex domain:

```nginx
if ($host = www.pietergeerts.eu) {
    return 301 https://pietergeerts.eu$request_uri;
}
client_max_body_size 25m;
```

For Umami analytics:

- Domain Names: `analytics.pietergeerts.eu`
- Scheme: `http`
- Forward Hostname / IP: `192.168.0.112`
- Forward Port: `3001`
- Cache Assets: off
- Block Common Exploits: on
- Websockets Support: on
- SSL: request a new Let's Encrypt certificate
- Force SSL: on
- HTTP/2 Support: on

Add this under Advanced:

```nginx
client_max_body_size 10m;
```

Do not expose Postgres `5432` or Listmonk `9000` in Nginx Proxy Manager.

## DNS and port forwarding

DNS records should point to your public WAN IP:

- `A @`
- `A www`
- `A analytics`

UniFi should forward only TCP `80` and `443` to the Nginx Proxy Manager LXC, not to the blog LXC. The blog LXC should only be reachable from your LAN and Nginx Proxy Manager.
