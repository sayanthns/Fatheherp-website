# Managing Multiple Apps & Domains (Multi-Tenant Caddy Setup)

Because we installed **Caddy Server** natively on your Contabo Ubuntu host, you can host as many applications as you want on this single server, limited only by your VPS RAM/CPU!

Caddy acts as a **Reverse Proxy**. It takes incoming web traffic (like `app2.yourdomain.com`) and securely forwards it to the correct internal Docker container running on a specific port.

---

## 🏗️ Step 1: Deploy Your Second App

Just like we did for Fateh ERP, you will clone your new app's code to `/opt` and run it on a **different port**. 

For example, let's say you have a new app called **"HR System"**.

1. Go to the `/opt` folder:
```bash
cd /opt
git clone https://github.com/yourusername/hr-system.git
cd hr-system
```

2. Make sure the new app exposes a **unique port**. If Fateh ERP uses `5050`, make your HR System use `5051`. Give it a unique container name in its `docker-compose.yml`:
```yaml
services:
  hr-system-app:
    build: .
    container_name: hr-system-app
    ports:
      - "5051:5050"   # Maps host port 5051 -> container port 5050
```

3. Boot the new container:
```bash
docker compose build && docker compose up -d
```

---

## 🌐 Step 2: Route the Domain in Caddy

Now that your second app is running on port `5051`, we just need to tell Caddy to route traffic from your new domain (`hr.enfono.com`) to that port.

1. Open the global Caddyfile:
```bash
nano /etc/caddy/Caddyfile
```

2. Add a new block for your new domain at the bottom of the file! It should look exactly like this:

```caddyfile
# App 1: Fateh ERP (Already configured)
docs.enfono.com {
    reverse_proxy localhost:5050
}

# App 2: HR System (New!)
hr.enfono.com {
    reverse_proxy localhost:5051
}

# App 3: Another app...
anotherdomain.com {
    reverse_proxy localhost:5052
}
```

3. Save the file (`CTRL + X`, then `Y`, then `Enter`).

4. Reload Caddy to instantly apply the new domains and fetch free SSL certificates:
```bash
systemctl reload caddy
```

**That's it!** Caddy will handle all the HTTPS routing automatically.

---

## 🔄 How to Change an Existing Domain

If you want to move Fateh ERP from `docs.enfono.com` to `fateherp.com`, the process is incredibly simple.

### 1. Update your Domain Registrar
Log into GoDaddy/Namecheap/Cloudflare and point the `A Record` for `fateherp.com` to your Contabo Server IP (`147.93.155.122`).

### 2. Update the Caddyfile
Open the Caddy config:
```bash
nano /etc/caddy/Caddyfile
```
Simply **rename** the domain block:
```caddyfile
# Change "docs.enfono.com" to "fateherp.com"
fateherp.com {
    reverse_proxy localhost:5050
}
```

### 3. Reload Caddy
```bash
systemctl reload caddy
```
Caddy will automatically provision a new SSL certificate for your new domain instantly.
