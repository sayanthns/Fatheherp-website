# Fateh ERP Website - Deployment Guide (Ubuntu 24.04)

This guide walks you through deploying the Fateh ERP website to your Contabo Ubuntu 24.04 VPS.

## 1. Initial Server Setup

SSH into your Contabo server as root:
```bash
ssh root@<your_server_ip>
```

Update your packages:
```bash
apt update && apt upgrade -y
```

## 2. Install Docker & Git

Ubuntu 24.04 makes installing Docker very simple. Run the following:

```bash
# Install Git
apt install git -y

# Install Docker and Docker Compose
apt install docker.io docker-compose-v2 -y

# Enable Docker to start on boot
systemctl enable --now docker
```

## 3. Install Caddy (Web Server & Automatic HTTPS)

Caddy automatically handles SSL certificates for your domain seamlessly. Let's install it according to their official documentation:

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy -y
```

## 4. Clone Your Application

Change directories to `/opt` and clone your repository (You may need to provide your GitHub token here if it is a private repository, otherwise simply clone it).

```bash
cd /opt
git clone https://github.com/sayanthns/Fatheherp-website.git
cd Fatheherp-website
```

*(Note: Since you securely added your environment variables locally, make sure to read the Next Steps below)*

## 5. First-Time Data Initialization

The application stores leads, settings, and testimonials in local `json` files. We are using Docker volumes so they persist between deployments! We need to explicitly create them on the host machine first so Docker doesn't think they are folders.

Run these exact commands from inside the `/opt/Fatheherp-website` folder:

```bash
mkdir -p data
echo "[]" > data/leads.json
echo "[]" > data/testimonials.json
echo '{"calendlyUrl": "https://calendly.com/fateherp", "twoFactorSecret": ""}' > data/settings.json
```

## 6. Configure Environment Variables (Optional)

If you wish to change your unique passwords away from their defaults:
```bash
nano .env
```
Inside `.env` paste the following (change values as desired):
```env
ADMIN_PASSWORD=your_new_password_here
JWT_SECRET=your_new_long_random_secret
```

## 7. Start the Docker Container

Build the container and run it detached (`-d`) in the background:

```bash
docker compose build
docker compose up -d
```

Verify your container is running on Port 5050:
```bash
docker ps
```
You should see `fateh-erp-app` running!

## 8. Configure Caddy & Domain

Make sure you have gone to your domain registrar (GoDaddy, Namecheap, etc.) and pointed your Domain's `A Record` to your Contabo VPS IP address.

Now, edit the global Caddyfile:

```bash
nano /etc/caddy/Caddyfile
```

Delete the default text in `Caddyfile` entirely, and replace it with:

```caddyfile
yourdomain.com {
    reverse_proxy localhost:5050
}
```
*(Make sure to replace `yourdomain.com` with your ACTUAL domain name, e.g. `fateherp.com`!)*

Hit `CTRL + X`, then `Y`, then `ENTER` to save.

Restart Caddy to apply the changes and fetch your free SSL certificates:
```bash
systemctl restart caddy
```

**That's it!** Navigate to `https://yourdomain.com` and you will see your production Fateh ERP site.
