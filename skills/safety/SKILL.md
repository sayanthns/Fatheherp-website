# Safety & Precautions

## Hard Rules — NEVER Do These

### 1. NEVER touch other Frappe sites on the backend server
The Frappe server at `156.67.105.6` hosts multiple sites: `katcherp`, `spice`, `office`. These are **client production systems**. Only work with site `enfono-office-new`.

**What happens if you violate this**: You corrupt or destroy a paying client's live ERP system. There is no easy recovery.

```bash
# WRONG — affects all sites
bench migrate

# CORRECT — always specify the site
bench --site enfono-office-new migrate
```

### 2. NEVER deploy to the wrong server
| Site | Deploy To | Path | WRONG Target |
|------|-----------|------|-------------|
| enfono.com | `207.180.209.80` | `/srv/enfono/` | ~~156.67.105.6~~ |
| fateherp.com | `207.180.209.80` | `/srv/fateh/` | ~~156.67.105.6~~ |
| Frappe backend | `156.67.105.6` | `/home/v15/frappe-bench/apps/fateh_website/` | ~~207.180.209.80~~ |

**What happens if you violate this**: Files end up on a server that doesn't serve them. The live site shows stale content or breaks entirely.

### 3. NEVER run `bench migrate` without `--site enfono-office-new`
```bash
# WRONG — migrates ALL sites including client ERPs
cd ~/frappe-bench && bench migrate

# CORRECT
bench --site enfono-office-new migrate
```

### 4. NEVER commit credentials or secrets to git
These files/values must NEVER be in git:
- `.env` files with real API keys
- Service account JSON files (GA4)
- SSH passwords (they're in CLAUDE.md for agent use — this is intentional but risky)
- `settings.json` contains `twoFactorSecret` — it's already in git history (legacy issue)

### 5. NEVER force-push to any branch
All three repos (`Fatheherp-website`, `enfono-website-v2`, `fateh_website`) are production branches. Force-push destroys history.

### 6. NEVER restart Frappe with `bench restart` or `supervisorctl restart all`
This restarts ALL sites' workers. Only restart gunicorn for the web process:
```bash
# CORRECT — graceful reload, zero downtime
kill -HUP $(ps aux | grep 'gunicorn.*frappe.app' | grep -v grep | head -1 | awk '{print $2}')
```

### 7. NEVER modify Caddy config without testing
The VPS (`207.180.209.80`) serves both sites via Caddy. A bad Caddyfile kills both sites.
```bash
# Always validate before restarting
caddy validate --config /etc/caddy/Caddyfile
systemctl restart caddy
```

### 8. NEVER delete Frappe doctypes in production
Deleting a doctype drops the MariaDB table permanently. If you need to remove a doctype, use `bench --site enfono-office-new remove-from-installed-apps` workflow or create a patch.

---

## ALWAYS Do These Before Operations

### Before ANY deployment
- [ ] Verify which server you're deploying to (see table above)
- [ ] Verify the build completed successfully (`npm run build` exit code 0)
- [ ] Check that `index.html` exists in the build output
- [ ] For Frappe: verify `git status` shows clean working tree before pulling on server

### Before Frappe backend changes
- [ ] Test Python syntax locally: `python -c "import ast; ast.parse(open('file.py').read())"`
- [ ] Check for existing data that might conflict with schema changes
- [ ] Back up: `bench --site enfono-office-new backup` before `migrate`
- [ ] Always specify `--site enfono-office-new`

### Before editing hooks.py
- [ ] Verify fixture list matches actual fixture JSON files in `fixtures/` directory
- [ ] Ensure scheduler function paths are correct (module.function)
- [ ] Check CORS origins list includes all domains (localhost, production domains)

### Before frontend builds
- [ ] Verify API URL is correct:
  - Fateh: `VITE_FRAPPE_URL` or fallback to `https://office.enfonoerp.com`
  - Enfono: `REACT_APP_FRAPPE_URL` in `.env.production` = `https://office.enfonoerp.com`
- [ ] Run `npm install` if `package.json` changed
- [ ] Check that GA4 tags are present in `index.html`

---

## Common Pitfalls That Cause Production Issues

### Pitfall 1: Frappe Password field mangles JSON
**Context**: GA4 service account credentials stored in Password fields
**What happens**: Frappe strips outer `{}` braces and adds non-breaking spaces (`\xa0`)
**Prevention**: Always use `clean_json_string()` from `ga4.py` when reading Password field values
**Location**: `fateh_website/ga4.py:clean_json_string()`

### Pitfall 2: Fixtures overwrite production data on `bench migrate`
**Context**: `hooks.py` defines fixtures that auto-import on every migration
**What happens**: Manual edits to Testimonials, Pricing Plans, Settings get overwritten
**Prevention**: Only add static reference data to fixtures. Dynamic content should use patches or manual entry.

### Pitfall 3: Enfono CMS API is slow (~7 seconds)
**Context**: `get_cms` endpoint on Frappe loads all CMS content in one call
**What happens**: enfono.com shows loading spinner for 5-7 seconds on first visit
**Prevention**: This is a known issue. The frontend uses `initialCmsData` as fallback while loading.

### Pitfall 4: SPA routing breaks without Caddy `try_files`
**Context**: Both sites are single-page apps with client-side routing
**What happens**: Direct URL access to `/about`, `/pricing` returns 404
**Required Caddy config**:
```
try_files {path} /index.html
```

### Pitfall 5: Workspace Number Cards use child tables, not content JSON
**Context**: Frappe v15 workspace rendering
**What happens**: Adding items to workspace `content` JSON field doesn't display them
**Correct approach**: Append to `ws.number_cards` and `ws.charts` child tables

### Pitfall 6: VPS server gets reinstalled
**Context**: The VPS at 207.180.209.80 has been accidentally reinstalled before
**What happens**: Both sites go down, Caddy config is lost, SSL certs are gone
**Recovery**: See operations/SKILL.md "Full VPS Recovery" section

---

## Decision Matrix

| Situation | DO THIS | DON'T DO THAT |
|-----------|---------|---------------|
| Need to change a Frappe doctype field | Create a patch in `patches/`, run `bench migrate` | Manually edit JSON and hope for the best |
| Need to update frontend content | Edit CMS via Frappe admin panel | Hardcode content in React components |
| Need to add a new API endpoint | Add to `api.py` (Fateh) or `enfono_api.py` (Enfono) with `@frappe.whitelist(allow_guest=True)` | Create a new Python file without registering it |
| API returns CORS error | Check `allow_cors` in `hooks.py` | Disable CORS entirely |
| Need to debug Frappe on server | Use `bench --site enfono-office-new console` | Edit files directly on the server |
| Frontend shows blank page | Check browser console for JS errors, verify `index.html` has correct asset paths | Rebuild and redeploy blindly |
| Need to update Enfono CMS data | Use Frappe admin → Enfono Website Settings | Edit `cms_data.js` (it's just fallback data) |
| Workspace cards not showing | Check child tables `number_cards`/`charts` on workspace doc | Keep editing the `content` JSON field |
| VPS password changed | Update CLAUDE.md immediately | Continue with old credentials |
| GA4 not syncing | Check credentials in Settings → Password field, verify service account has Viewer access | Recreate service account |

---

## Pre-Deployment Checklist

### Frontend Deploy (Fateh or Enfono)
- [ ] `npm run build` completed with exit code 0
- [ ] Build directory contains `index.html`
- [ ] `scp` target is `207.180.209.80` (NOT `156.67.105.6`)
- [ ] Correct path: `/srv/fateh/` or `/srv/enfono/`
- [ ] After deploy: verify site loads in browser
- [ ] After deploy: verify API calls work (check browser Network tab)
- [ ] Commit source changes to git

### Backend Deploy (Frappe)
- [ ] Changes committed and pushed to `sayanthns/fateh_website` master
- [ ] SSH to `156.67.105.6`, `su - v15`
- [ ] `cd frappe-bench/apps/fateh_website && git pull upstream master`
- [ ] If doctype changes: `bench --site enfono-office-new migrate`
- [ ] Restart gunicorn: `kill -HUP $(ps aux | grep 'gunicorn.*frappe.app' | grep -v grep | head -1 | awk '{print $2}')`
- [ ] Verify API responds: `curl https://office.enfonoerp.com/api/method/fateh_website.api.get_settings`
- [ ] Check error log: `bench --site enfono-office-new show-log`

### Full Stack Deploy (Both)
- [ ] Deploy backend FIRST (APIs must be ready)
- [ ] Deploy frontends SECOND
- [ ] Verify both sites load
- [ ] Test contact forms on both sites
- [ ] Test any changed features specifically
