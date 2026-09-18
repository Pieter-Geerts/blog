# Self-hosting on Proxmox

This deployment assumes:

```text
Porkbun DNS -> UniFi port forwarding -> Proxmox VM -> host Nginx
                                                     -> 127.0.0.1:3000 app
                                                     -> 127.0.0.1:3001 Umami
```

Use a dedicated Debian or Ubuntu VM for the site rather than installing Docker directly on the Proxmox host. Take a Proxmox snapshot before the first deployment and before database migrations.

## 1. Prepare DNS at Porkbun

Create these records pointing to your UniFi WAN/public IP:

- `A @` -> your public IPv4 address
- `A www` -> your public IPv4 address, if you want `www`
- `A analytics` -> your public IPv4 address

If your public IP changes, use Porkbun dynamic DNS or another DDNS solution. Do not point DNS at the private Proxmox address.

## 2. Configure UniFi

Forward only these ports to the VM running Nginx:

- TCP `80` -> VM TCP `80`
- TCP `443` -> VM TCP `443`

Do not forward `3000`, `3001`, `5432`, or `9000`. The production Compose file binds the app and Umami to loopback and leaves Postgres/Listmonk private to Docker.

Give the VM a static DHCP lease or static LAN address so the forwarding rule does not change.

## 3. Install the VM dependencies

Install Docker Engine and the Compose plugin on the VM, then copy or clone this repository to it. From the repository directory:

```bash
cp deploy/env.production.example .env.production
chmod 600 .env.production
```

Edit `.env.production` and set long random values for `POSTGRES_PASSWORD`, `PAYLOAD_SECRET`, and `UMAMI_APP_SECRET`. Leave `UMAMI_WEBSITE_ID` empty until you create the website in Umami, then set the real website ID and restart the app.

## 4. Start the production containers

The first command loads variables for Compose interpolation. This is required because the Compose file uses the database password in service configuration.

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build app
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Check startup:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 app
```

The database init script only runs when the Postgres volume is created for the first time. Do not delete that volume after production data exists.

## 5. Configure Nginx and HTTPS

Install Nginx on the VM and serve the ACME challenge from the default HTTP-only site first:

```bash
sudo mkdir -p /var/www/certbot
sudo systemctl enable --now nginx
```

Obtain certificates with Certbot:

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d pietergeerts.eu -d www.pietergeerts.eu
sudo certbot certonly --webroot -w /var/www/certbot -d analytics.pietergeerts.eu
```

Then install the final reverse-proxy configuration:

```bash
sudo cp deploy/nginx/pietergeerts.eu.conf /etc/nginx/sites-available/pietergeerts.eu
sudo ln -s /etc/nginx/sites-available/pietergeerts.eu /etc/nginx/sites-enabled/pietergeerts.eu
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

If Certbot cannot complete validation, check DNS propagation, UniFi forwarding, the VM firewall, and whether another service already uses ports 80 or 443.

## 6. Finish first-run setup

- Open `https://pietergeerts.eu` and verify the homepage, blog, favicon, and newsletter form.
- Open `https://pietergeerts.eu/admin` and create or verify the protected Payload admin account.
- Open `https://analytics.pietergeerts.eu` and complete Umami setup.
- Add `https://pietergeerts.eu` as the Umami website and put its website ID in `.env.production`.
- Restart the app after changing the website ID:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate app
```

- Open Listmonk from the VM or a private administration path. It is intentionally not exposed publicly by this Compose file.
- Configure Listmonk SMTP, sender identity, unsubscribe behavior, and double opt-in as appropriate.

## 7. Backups and updates

Back up all databases before updates. At minimum, verify backups for the `portfolio`, `listmonk`, and `umami` databases and test a restore on a separate VM.

For an update:

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml build app
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Use the production checklist in [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) before making the domain public.
