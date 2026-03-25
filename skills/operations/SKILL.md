# Day-to-Day Operations

## Build Commands

### Fateh Frontend
```bash
cd ~/Documents/Fateh-website-claude-frappe/client
npm install          # Only if package.json changed
npm run build        # Outputs to dist/
```

### Enfono Frontend
```bash
cd ~/Documents/enfono-website-v2
npm install          # Only if package.json changed
npm run build        # Outputs to build/
```

### Frappe Backend
No build step. Python files are interpreted directly. After code changes:
```bash
# On server (156.67.105.6) as v15 user
cd ~/frappe-bench/apps/fateh_website
git pull upstream master

# If doctype schema changed
bench --site enfono-office-new migrate

# Restart web workers (always do this after code changes)
kill -HUP $(ps aux | grep 'gunicorn.*frappe.app' | grep -v grep | head -1 | awk '{print $2}')
```

## Deploy Procedures

### Deploy Fateh Frontend → fateherp.com
```bash
# 1. Build locally
cd ~/Documents/Fateh-website-claude-frappe/client
npm run build

# 2. Upload to VPS
sshpass -p 'enfono@123' scp -r dist/* root@207.180.209.80:/srv/fateh/

# 3. Verify
curl -s -o /dev/null -w "%{http_code}" https://fateherp.com
# Should return 200
```

### Deploy Enfono Frontend → enfono.com
```bash
# 1. Build locally
cd ~/Documents/enfono-website-v2
npm run build

# 2. Upload to VPS
sshpass -p 'enfono@123' scp -r build/* root@207.180.209.80:/srv/enfono/

# 3. Verify
curl -s -o /dev/null -w "%{http_code}" https://enfono.com
# Should return 200
```

### Deploy Frappe Backend
```bash
# 1. Commit and push from local
cd ~/Documents/Fateh-website-claude-frappe/fateh_website
# or: cd /tmp/fateh_website_repo
git add -A && git commit -m "description" && git push origin master

# 2. Pull on server
ssh root@156.67.105.6   # pw: enfono123
su - v15
cd ~/frappe-bench/apps/fateh_website
git pull upstream master

# 3. Migrate (only if doctypes changed)
cd ~/frappe-bench
bench --site enfono-office-new migrate

# 4. Restart gunicorn
kill -HUP $(ps aux | grep 'gunicorn.*frappe.app' | grep -v grep | head -1 | awk '{print $2}')

# 5. Verify
curl -s https://office.enfonoerp.com/api/method/fateh_website.api.get_settings | python3 -m json.tool
```

## Full VPS Recovery (After Reinstall)

The VPS at 207.180.209.80 has been reinstalled before. Here's the full recovery procedure:

```bash
# 1. SSH to fresh VPS
ssh root@207.180.209.80   # pw: enfono@123 (or whatever new password)

# 2. Install Caddy
apt update && apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 3. Create document roots
mkdir -p /srv/fateh /srv/enfono

# 4. Configure Caddy
cat > /etc/caddy/Caddyfile << 'EOF'
fateherp.com {
    root * /srv/fateh
    file_server
    try_files {path} /index.html
    encode gzip
}

enfono.com {
    root * /srv/enfono
    file_server
    try_files {path} /index.html
    encode gzip
}

www.fateherp.com {
    redir https://fateherp.com{uri} permanent
}

www.enfono.com {
    redir https://enfono.com{uri} permanent
}
EOF

# 5. Validate and start Caddy
caddy validate --config /etc/caddy/Caddyfile
systemctl enable caddy
systemctl start caddy

# 6. Deploy both builds (from local machine)
# Fateh:
cd ~/Documents/Fateh-website-claude-frappe/client && npm run build
sshpass -p 'enfono@123' scp -r dist/* root@207.180.209.80:/srv/fateh/

# Enfono:
cd ~/Documents/enfono-website-v2 && npm run build
sshpass -p 'enfono@123' scp -r build/* root@207.180.209.80:/srv/enfono/

# 7. Verify both sites
curl -s -o /dev/null -w "%{http_code}" https://fateherp.com    # 200
curl -s -o /dev/null -w "%{http_code}" https://enfono.com      # 200
```

## Rollback Procedures

### Rollback Frontend (Fateh or Enfono)
```bash
# Option 1: Redeploy previous git commit
cd ~/Documents/Fateh-website-claude-frappe  # or enfono-website-v2
git log --oneline -5                         # Find last good commit
git checkout <commit-hash> -- client/        # Restore client files
npm run build                                # Rebuild
# Then SCP to server as normal

# Option 2: If you still have the old build directory, just re-SCP it
```

### Rollback Frappe Backend
```bash
# On server (156.67.105.6) as v15 user
cd ~/frappe-bench/apps/fateh_website
git log --oneline -5                    # Find last good commit
git checkout <commit-hash>              # Revert to it
cd ~/frappe-bench
bench --site enfono-office-new migrate  # Re-run migration
kill -HUP $(ps aux | grep 'gunicorn.*frappe.app' | grep -v grep | head -1 | awk '{print $2}')
```

### Restore Frappe Data
```bash
# As v15 user on Frappe server
cd ~/frappe-bench

# Find latest backup
ls -la sites/enfono-office-new/private/backups/

# Restore from backup
bench --site enfono-office-new restore sites/enfono-office-new/private/backups/<backup-file>.sql.gz
```

## Accessing Logs

### Caddy (VPS) Logs
```bash
ssh root@207.180.209.80
journalctl -u caddy -f              # Live logs
journalctl -u caddy --since "1h ago" # Last hour
```

### Frappe Logs
```bash
ssh root@156.67.105.6
su - v15
cd ~/frappe-bench

# Application logs
tail -f sites/enfono-office-new/logs/frappe.log

# Web server logs
tail -f sites/enfono-office-new/logs/web.log

# Error logs
tail -f sites/enfono-office-new/logs/error.log

# Worker logs
tail -f sites/enfono-office-new/logs/worker.log

# Quick error check
bench --site enfono-office-new show-log
```

### Browser Console
For frontend issues, the most useful debugging is in the browser:
- **Network tab**: Check API calls to `office.enfonoerp.com` — look for CORS errors, 500s, timeouts
- **Console tab**: JavaScript errors, API error logs
- **Application tab**: Check localStorage (`enfono_cms_data`, `enfono_admin_session`)

## Frappe Console (Interactive Python)

For debugging data issues:
```bash
ssh root@156.67.105.6
su - v15
cd ~/frappe-bench
bench --site enfono-office-new console

# Example queries
>>> frappe.get_all("Website Lead", filters={"status": "New"}, limit=5)
>>> frappe.get_single("Fateh Website Settings").as_dict()
>>> frappe.get_all("GA4 Analytics Data", filters={"site": "Fateh"}, limit=5)
>>> frappe.db.sql("SELECT count(*) FROM `tabWebsite Lead`")
```

## Environment Variables

### Fateh Frontend (Vite)
| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_FRAPPE_URL` | `https://office.enfonoerp.com` (prod) / `http://127.0.0.1:8000` (dev) | Backend API base URL |

### Enfono Frontend (CRA)
| Variable | File | Purpose |
|----------|------|---------|
| `REACT_APP_FRAPPE_URL` | `.env` / `.env.production` | Backend API base URL |

### Frappe Backend
Frappe uses its own config files, not env vars:
- `sites/common_site_config.json` — Global config (Redis, MariaDB)
- `sites/enfono-office-new/site_config.json` — Site-specific config
- No custom env vars needed for this app

## Common Workflows

### Add a new Fateh API endpoint
1. Edit `fateh_website/fateh_website/api.py`
2. Add function with `@frappe.whitelist(allow_guest=True)`
3. Push to git, pull on server, restart gunicorn
4. Call from frontend: add method to `client/src/lib/frappe-api.ts`

### Add a new Enfono API endpoint
1. Edit `fateh_website/fateh_website/enfono_api.py`
2. Add function with `@frappe.whitelist(allow_guest=True)`
3. Push to git, pull on server, restart gunicorn
4. Call from frontend: add method to `src/Functions/frappeApi.js`

### Add a new Frappe Doctype
1. Create doctype folder: `fateh_website/<module>/doctype/<doctype_name>/`
2. Create `<doctype_name>.json` (schema) and `<doctype_name>.py` (controller)
3. Add to `modules.txt` if new module
4. Push to git, pull on server, run `bench --site enfono-office-new migrate`

### Update CMS content for Enfono
1. Go to `https://office.enfonoerp.com/app/enfono-website-settings`
2. Edit fields as needed
3. Save — changes appear on enfono.com after page refresh (or after CMS API cache expires)

### Manually sync GA4 data
1. Go to `https://office.enfonoerp.com/app/fateh-website-settings` (or enfono equivalent)
2. Click "Sync GA4 Now" button
3. Check `GA4 Analytics Data` list for new records

### Test API locally
```bash
# Start Frappe dev server
cd ~/frappe-bench
bench --site enfono-office-new serve

# In another terminal, test endpoints
curl http://localhost:8000/api/method/fateh_website.api.get_settings
curl http://localhost:8000/api/method/fateh_website.api.get_testimonials
```
