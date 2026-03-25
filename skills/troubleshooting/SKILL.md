# Troubleshooting Guide

## Quick Reference: "If You See X, Check Y"

| Symptom | First Check | Second Check |
|---------|------------|-------------|
| Blank white page on fateherp.com | Browser console → JS errors | `/srv/fateh/index.html` exists on VPS |
| Blank white page on enfono.com | Browser console → JS errors | `/srv/enfono/index.html` exists on VPS |
| "Error sending message" on contact form | Browser Network tab → API call status | CORS config in `hooks.py` |
| 404 on direct URL (e.g., `/about`) | Caddy `try_files` config | `Caddyfile` on VPS |
| API returns 500 | Frappe error log on server | Python syntax error in api.py |
| API returns 403 | Missing `allow_guest=True` decorator | CORS origin not in allow list |
| Site loads but no content | CMS API call failing | Check `enfono_cms_data` in localStorage |
| Loading spinner never stops (Enfono) | CMS API response time (~7s is normal) | Network tab for failed API call |
| GA4 data not syncing | Service account credentials in Settings | Service account has Viewer role in GA4 |
| Workspace cards not showing | Check child tables, not content JSON | Card names may have auto-suffixes |
| PWA install prompt showing | `manifest.json` → `display` should be `"browser"` | Clear browser cache |
| SSL certificate error | Caddy auto-renews — restart it | DNS pointing to correct IP? |
| `bench migrate` fails | Check Python traceback | Fixture JSON format errors |
| Admin login not working (Enfono) | localStorage `enfono_admin_session` | 2FA secret in `settings.json` |

---

## Bug Pattern #1: Blank Page After Deploy

### Symptom
Site shows completely blank white page. No content, no errors visible to user.

### Root Cause (most common)
Asset paths in `index.html` don't match the actual file locations on the server.

**Fateh-specific**: Vite build outputs with base path `/assets/fateh_website/fateh/` (designed for serving from Frappe). When deployed to Caddy at `/srv/fateh/`, the paths break because Caddy serves from root `/`.

### Diagnosis
```bash
# Check browser console for 404 errors on .js/.css files
# SSH to VPS and check what's actually there
ssh root@207.180.209.80
ls -la /srv/fateh/
cat /srv/fateh/index.html | head -20
# Look for <script src="/assets/fateh_website/fateh/..."> — this is wrong for Caddy
```

### Fix
Option A: Build with correct base path
```bash
# In vite.config.ts, set base: "/" for standalone deploy
# Then rebuild and redeploy
```

Option B: The current setup outputs to `dist/` which has root-relative paths — verify you're copying from `dist/`, not from `fateh_website/public/fateh/`.

### Prevention
Always verify after deploy:
```bash
curl -s https://fateherp.com | grep '<script' | head -5
# Asset paths should be relative or start with /assets/
```

---

## Bug Pattern #2: CORS Errors on API Calls

### Symptom
Browser console shows:
```
Access to fetch at 'https://office.enfonoerp.com/api/method/...' from origin 'https://enfono.com' has been blocked by CORS policy
```

### Root Cause
The `allow_cors` list in `hooks.py` doesn't include the requesting origin.

### Diagnosis
```bash
# Check hooks.py for allow_cors
grep -A 10 "allow_cors" fateh_website/hooks.py

# Test CORS headers directly
curl -I -H "Origin: https://enfono.com" https://office.enfonoerp.com/api/method/fateh_website.api.get_settings
# Look for Access-Control-Allow-Origin header
```

### Fix
Add the missing origin to `hooks.py`:
```python
allow_cors = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://fateherp.com",
    "https://enfono.com",
    "https://www.fateherp.com",
    "https://www.enfono.com",
]
```
Then push, pull on server, restart gunicorn.

### Prevention
When adding a new domain, always add it to `allow_cors` in `hooks.py` before deploying the frontend.

---

## Bug Pattern #3: Frappe Password Field Mangles JSON

### Symptom
```
json.decoder.JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 2
```
When trying to parse GA4 service account credentials from Frappe Settings.

### Root Cause
Frappe's Password field does two things to stored JSON:
1. Strips outer `{` and `}` braces
2. Replaces regular spaces with non-breaking spaces (`\xa0` / Unicode `U+00A0`)

### Diagnosis
```python
# In bench console
bench --site enfono-office-new console
>>> doc = frappe.get_single("Fateh Website Settings")
>>> raw = doc.get_password("ga4_service_account_json")
>>> print(repr(raw[:50]))  # Look for missing { and \xa0 characters
```

### Fix
Already handled by `ga4.py:clean_json_string()`:
```python
def clean_json_string(raw):
    cleaned = raw.replace('\xa0', ' ').strip()
    if not cleaned.startswith('{'):
        cleaned = '{' + cleaned
    if not cleaned.endswith('}'):
        cleaned = cleaned + '}'
    return cleaned
```

### Prevention
Always use `clean_json_string()` when reading any JSON from a Frappe Password field. Never assume the JSON will be valid as-is.

---

## Bug Pattern #4: Workspace Number Cards Not Appearing

### Symptom
Workspace shows sections but Number Cards and Charts are missing, even though they exist in the database.

### Root Cause
Frappe v15 workspaces render Number Cards and Dashboard Charts from **child tables** (`number_cards` and `charts` on the Workspace doctype), NOT from the `content` JSON field.

### Diagnosis
```python
# In bench console
>>> ws = frappe.get_doc("Workspace", "Fateh Website")
>>> print(ws.number_cards)  # Should list card references
>>> print(ws.charts)        # Should list chart references
>>> # If these are empty, that's why nothing shows
```

### Fix
```python
# Add cards to workspace child table
ws = frappe.get_doc("Workspace", "Fateh Website")
ws.append("number_cards", {
    "label": "GA4 Sessions",
    "number_card_name": "GA4 Sessions"  # Must match actual Number Card name
})
ws.save(ignore_permissions=True)
frappe.db.commit()
```

**Gotcha**: Frappe auto-names Number Cards. If you create "GA4 Sessions", Frappe might name it "GA4 Sessions-1". Always query the actual name:
```python
>>> frappe.get_all("Number Card", filters={"label": "GA4 Sessions"}, pluck="name")
```

### Prevention
When creating workspace dashboards, always:
1. Create Number Cards/Dashboard Charts first
2. Query their actual names
3. Reference those exact names in workspace child tables

---

## Bug Pattern #5: Enfono Contact Form Fails

### Symptom
"Error sending message. Please try again." on enfono.com/contact

### Root Cause (possibilities)
1. **CORS**: Origin not allowed (see Bug #2)
2. **API error**: Python exception in `enfono_api.submit_lead`
3. **Network**: office.enfonoerp.com unreachable
4. **SSL**: Certificate expired on Frappe server

### Diagnosis
```bash
# 1. Check from browser Network tab — what's the HTTP status?
# 2. Test API directly
curl -X POST https://office.enfonoerp.com/api/method/fateh_website.enfono_api.submit_lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"123","company":"Test","message":"Test","source":"Website"}'

# 3. Check Frappe error log
ssh root@156.67.105.6 && su - v15
tail -50 ~/frappe-bench/sites/enfono-office-new/logs/frappe.log
```

### Fix
Depends on root cause:
- CORS → Update `hooks.py` allow_cors list
- API error → Fix Python code in `enfono_api.py`
- Network → Check DNS, firewall, server status
- SSL → Frappe uses Let's Encrypt via nginx; run `bench setup lets-encrypt enfono-office-new`

---

## Bug Pattern #6: Fixtures Fail on `bench migrate`

### Symptom
```
KeyError: 'name'
```
or
```
DuplicateEntryError
```
during `bench migrate`

### Root Cause
Fixture JSON files have records that conflict with existing data, or the JSON structure doesn't match what Frappe expects.

### Diagnosis
```bash
# Check fixture file format
cd ~/frappe-bench/apps/fateh_website/fateh_website/fixtures/
cat website_testimonial.json | python3 -m json.tool | head -20
# Each record should have "doctype" field
```

### Fix
1. Ensure every record in fixture JSON has `"doctype": "Doctype Name"`
2. For Single doctypes (Settings), the fixture should contain only one record
3. Use `ignore_if_duplicate=True` in install.py (already done)
4. If migration succeeded despite the error, the error is usually non-fatal

### Prevention
After editing fixture JSON files, validate them:
```bash
python3 -c "import json; json.load(open('fixtures/website_testimonial.json'))"
```

---

## Bug Pattern #7: SPA Routes Return 404

### Symptom
Directly accessing `https://enfono.com/about` or `https://fateherp.com/pricing` returns a 404 or Caddy error page.

### Root Cause
Caddy is not configured with `try_files` fallback to `index.html`.

### Diagnosis
```bash
ssh root@207.180.209.80
cat /etc/caddy/Caddyfile
# Look for try_files directive under each domain
```

### Fix
```caddy
fateherp.com {
    root * /srv/fateh
    file_server
    try_files {path} /index.html    # THIS LINE IS CRITICAL
    encode gzip
}
```
Then: `caddy validate --config /etc/caddy/Caddyfile && systemctl restart caddy`

---

## Bug Pattern #8: Enfono Loading Spinner Won't Stop

### Symptom
enfono.com shows a loading spinner indefinitely on first visit.

### Root Cause
The CMS API call (`get_cms`) takes ~7 seconds on the Frappe server. If it fails entirely, the spinner persists because `setLoading(false)` only runs after the try/catch.

### Diagnosis
```bash
# Test API response time
time curl -s https://office.enfonoerp.com/api/method/fateh_website.enfono_api.get_cms \
  -X POST -H "Content-Type: application/json" -d '{"key":"enfono_cms_data"}'
# Normal: 5-7 seconds (this is a known performance issue)
# If timeout: server is down or overloaded
```

### Fix (short-term)
The app already uses `initialCmsData` as fallback. If the API fails, content still shows (just not dynamic CMS content).

### Fix (long-term — not yet implemented)
- Cache CMS data in Redis on the Frappe server
- Add ETags/Last-Modified headers for conditional requests
- Split `get_cms` into smaller, cacheable endpoints

---

## Bug Pattern #9: PWA Install Prompt on Enfono

### Symptom
Browser shows "Add to Home Screen" / "Install App" banner on enfono.com.

### Root Cause
`manifest.json` has `"display": "standalone"` which triggers PWA install prompt.

### Fix
Already applied — `manifest.json` should have `"display": "browser"`:
```json
{
  "short_name": "Enfono",
  "name": "Enfono Solutions",
  "display": "browser"
}
```
**File**: `enfono-website-v2/public/manifest.json`

### Prevention
Never set `display: "standalone"` unless you actually want a PWA install experience.

---

## Bug Pattern #10: VPS Server Reinstalled

### Symptom
Both fateherp.com and enfono.com are completely down. SSH works but Caddy and site files are gone.

### Root Cause
VPS hosting provider reinstalled the OS (happened before — user accidentally triggered it).

### Fix
Follow the complete recovery procedure in `skills/operations/SKILL.md` → "Full VPS Recovery" section.

Key steps:
1. Install Caddy
2. Create directories `/srv/fateh` and `/srv/enfono`
3. Write Caddyfile with both domains + `try_files`
4. Build and SCP both frontends
5. Verify SSL and sites

### Prevention
- Consider automated deployment (GitHub Actions → SCP)
- Keep a backup of the Caddyfile in this repo
- Document the new server password immediately in CLAUDE.md

---

## Bug Pattern #11: Frappe API Returns HTML Instead of JSON

### Symptom
API call returns HTML page (usually Frappe login page) instead of JSON response.

### Root Cause
1. The `@frappe.whitelist(allow_guest=True)` decorator is missing
2. The site is in maintenance mode
3. The function name doesn't match the URL path

### Diagnosis
```bash
# Check if endpoint exists
curl -s https://office.enfonoerp.com/api/method/fateh_website.api.get_settings | head -1
# If it starts with "<!DOCTYPE html>" — it's returning HTML, not JSON
```

### Fix
1. Verify function has `@frappe.whitelist(allow_guest=True)`
2. Verify the module path matches: `fateh_website.api.function_name`
3. Check maintenance mode: `bench --site enfono-office-new set-maintenance-mode off`

---

## Bug Pattern #12: Git Pull Fails on Frappe Server

### Symptom
```
error: Your local changes to the following files would be overwritten by merge
```

### Root Cause
Someone edited files directly on the server (or a `bench migrate` modified files).

### Fix
```bash
# As v15 user on Frappe server
cd ~/frappe-bench/apps/fateh_website
git stash                    # Save local changes
git pull upstream master     # Pull latest
git stash pop                # Reapply local changes if needed (may have conflicts)
```

### Prevention
NEVER edit code directly on the Frappe server. Always edit locally, push to GitHub, then pull on server.

---

## Server Health Checks

### Quick health check script
```bash
# Check both sites are up
echo "=== fateherp.com ===" && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://fateherp.com
echo "=== enfono.com ===" && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://enfono.com
echo "=== Frappe API ===" && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://office.enfonoerp.com/api/method/fateh_website.api.get_settings
```

### Expected output
```
=== fateherp.com ===
HTTP 200
=== enfono.com ===
HTTP 200
=== Frappe API ===
HTTP 200
```
