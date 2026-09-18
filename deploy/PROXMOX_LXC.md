# Proxmox blog LXC

Run these commands on `proxarr` as `root`. The examples assume:

- Proxmox host: `192.168.0.2`
- New blog container VMID: `112`
- New blog container IP: `192.168.0.112/24`
- Gateway: `192.168.0.1`
- Bridge: `vmbr0`
- Template storage: `local`
- Container disk storage: `local-lvm`

These values match the current `proxarr` storage and network layout. Before creating the container, confirm that `192.168.0.112` is not already used on your LAN.

## Check available IDs, storage, and network

```bash
pct list
pvesm status
ip route
ping -c 3 192.168.0.112
```

If `112` is already used, pick the next free VMID. If `ping` gets replies from `192.168.0.112`, choose another unused LAN IP and update the commands below.

## Download a Debian template

```bash
pveam update
pveam available --section system | grep debian-12
```

Download the current Debian 12 standard template shown by the previous command:

```bash
TEMPLATE=$(pveam available --section system | awk '/debian-12-standard/ {print $2}' | tail -1)
echo "$TEMPLATE"
pveam download local "$TEMPLATE"
ls /var/lib/vz/template/cache/debian-12-standard_*_amd64.tar.zst
```

## Create the blog LXC

```bash
TEMPLATE=$(basename "$(ls -t /var/lib/vz/template/cache/debian-12-standard_*_amd64.tar.zst | head -1)")
pct create 112 local:vztmpl/$TEMPLATE \
  --hostname blog \
  --unprivileged 1 \
  --features nesting=1,keyctl=1 \
  --cores 2 \
  --memory 4096 \
  --swap 512 \
  --rootfs local-lvm:32 \
  --net0 name=eth0,bridge=vmbr0,ip=192.168.0.112/24,gw=192.168.0.1 \
  --nameserver 1.1.1.1 \
  --start 1
```

Enter the container:

```bash
pct enter 112
```

## Install Docker and Git inside the blog LXC

```bash
apt update
apt install -y ca-certificates curl gnupg git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
docker version
docker compose version
```

If Docker fails inside the LXC, stop the container, confirm `nesting=1,keyctl=1` is set, then start it again:

```bash
exit
pct config 112
pct stop 112
pct set 112 --features nesting=1,keyctl=1
pct start 112
pct enter 112
```

## Deploy the blog stack

```bash
git clone https://github.com/Pieter-Geerts/blog.git /opt/blog
cd /opt/blog
cp deploy/env.production.example .env.production
chmod 600 .env.production
```

Edit `.env.production`:

```text
HOST_BIND_IP=192.168.0.112
POSTGRES_PASSWORD=<long-random-value>
PAYLOAD_SECRET=<long-random-value>
UMAMI_APP_SECRET=<long-random-value>
```

Start the stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build app
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

## Smoke test from the Proxmox host

Exit the container, then run from `proxarr`:

```bash
curl -I http://192.168.0.112:3000
curl -I http://192.168.0.112:3001
```

After these respond, configure Nginx Proxy Manager using [NGINX_PROXY_MANAGER.md](NGINX_PROXY_MANAGER.md).