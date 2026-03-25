# System Architecture

## End-to-End Flow

```
User visits fateherp.com or enfono.com
         │
         ▼
┌─────────────────────────────┐
│  Caddy Web Server (VPS)     │
│  IP: 207.180.209.80         │
│  SSH: root / enfono@123     │
│  Caddyfile: /etc/caddy/     │
│                             │
│  fateherp.com → /srv/fateh/ │  ← React+Vite+TS build (static files)
│  enfono.com  → /srv/enfono/ │  ← React CRA build (static files)
│                             │
│  try_files → index.html     │  ← SPA fallback for client routing
│  Auto SSL via Let's Encrypt │
└──────────┬──────────────────┘
           │ Browser makes API calls
           │ (fetch to office.enfonoerp.com)
           ▼
┌──────────────────────────────────┐
│  Frappe v15 + ERPNext            │
│  IP: 156.67.105.6               │
│  SSH: root / enfono123           │
│  Then: su - v15                  │
│  Bench: /home/v15/frappe-bench/  │
│  Site: enfono-office-new         │
│                                  │
│  ┌────────────────────────┐      │
│  │ fateh_website app      │      │
│  │ ├── api.py (Fateh)     │      │
│  │ ├── enfono_api.py      │      │
│  │ ├── ga4.py             │      │
│  │ ├── tasks.py           │      │
│  │ └── doctypes (CMS)     │      │
│  └────────────────────────┘      │
│                                  │
│  MariaDB + Redis                 │
│  Gunicorn (WSGI)                 │
│  nginx (reverse proxy)           │
│  Supervisor (process manager)    │
│                                  │
│  OTHER SITES (DO NOT TOUCH):     │
│  - katcherp                      │
│  - spice                         │
│  - office                        │
└──────────────────────────────────┘
```

## Three Repositories

### 1. Fateh Frontend — `sayanthns/Fatheherp-website` (branch: main)
**Local path**: `~/Documents/Fateh-website-claude-frappe/`
**Tech**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Wouter (router)
**Build**: `cd client && npm run build` → outputs to `dist/`
**Deploy to**: `207.180.209.80:/srv/fateh/`

Key files:
| File | Purpose |
|------|---------|
| `client/src/App.tsx` | Router, UTM tracking, base path detection |
| `client/src/lib/frappe-api.ts` | API client (5 methods) |
| `client/src/pages/Home.tsx` | Landing page |
| `client/src/pages/PricingPage.tsx` | Pricing + comparison table |
| `client/src/i18n.ts` | i18next EN/AR translations |
| `client/src/locales/en.json` | English strings |
| `client/src/locales/ar.json` | Arabic strings |
| `client/index.html` | Entry point + GA4 tag (G-03C7BMD95G) |
| `vite.config.ts` | Build config, dev proxy to localhost:8000 |
| `settings.json` | Admin config (emails, Calendly URL, 2FA secret) |

### 2. Enfono Frontend — `sayanthns/enfono-website-v2` (branch: main)
**Local path**: `~/Documents/enfono-website-v2/`
**Tech**: React 18 + JavaScript + CRA (craco) + SCSS + Bootstrap 5
**Build**: `npm run build` → outputs to `build/`
**Deploy to**: `207.180.209.80:/srv/enfono/`

Key files:
| File | Purpose |
|------|---------|
| `src/App.js` | Router, CMS data loader, lazy routes |
| `src/Functions/frappeApi.js` | API client (12 methods) |
| `src/Context/Context.js` | Global state (CMS data, UI state) |
| `src/Data/cms_data.js` | Fallback CMS data (used before API loads) |
| `src/Components/EnfonoUI/EnfonoChatbot.jsx` | AI chatbot component |
| `src/Pages/Admin/` | Admin panel (login, MFA, dashboard, CMS editor) |
| `src/Assets/scss/` | All styles |
| `.env.production` | `REACT_APP_FRAPPE_URL=https://office.enfonoerp.com` |
| `public/manifest.json` | PWA config (display: "browser" to prevent install prompt) |

### 3. Frappe Backend App — `sayanthns/fateh_website` (branch: master)
**Local path**: `~/Documents/Fateh-website-claude-frappe/fateh_website/` (embedded in Fateh repo)
**Also cloned to**: `/tmp/fateh_website_repo/` (for standalone editing)
**Server path**: `/home/v15/frappe-bench/apps/fateh_website/`

Key files:
| File | Purpose | Line count |
|------|---------|------------|
| `fateh_website/api.py` | Fateh public API (5 endpoints) | 162 |
| `fateh_website/enfono_api.py` | Enfono public API (10+ endpoints) | ~300 |
| `fateh_website/ga4.py` | GA4 Data API integration | ~150 |
| `fateh_website/tasks.py` | Scheduled tasks (purge leads) | 17 |
| `fateh_website/hooks.py` | App config, fixtures, scheduler | 33 |
| `fateh_website/install.py` | Post-install fixture loader | 47 |
| `fateh_website/migrate_data.py` | JSON-to-Frappe data migrator | 166 |

## API Endpoints — Complete Reference

### Fateh API (`fateh_website.api`)
All endpoints: `POST https://office.enfonoerp.com/api/method/fateh_website.api.<method>`

| Method | Auth | Parameters | Returns |
|--------|------|-----------|---------|
| `get_settings` | Guest | none | `{calendlyUrl}` |
| `get_testimonials` | Guest | none | `{testimonials: [{name, name_ar, role, role_ar, company, company_ar, quote, quote_ar, rating}]}` |
| `get_pricing` | Guest | none | `{plans: [...], comparisonCategories: [...]}` |
| `submit_lead` | Guest | lead_name, business_name, phone_number, location, source?, email?, ad_source?, ad_campaign? | `{success, message}` |
| `log_visit` | Guest | path?, browser?, source?, campaign? | `{success}` |

### Enfono API (`fateh_website.enfono_api`)
All endpoints: `POST https://office.enfonoerp.com/api/method/fateh_website.enfono_api.<method>`

| Method | Auth | Parameters | Returns |
|--------|------|-----------|---------|
| `get_cms` | Guest | key (default: "enfono_cms_data") | CMS content object |
| `update_cms` | Auth | key, content (JSON string) | `{success}` |
| `submit_lead` | Guest | name, email, phone, company, message, source | `{success}` |
| `get_leads` | Auth | none | `[{lead objects}]` |
| `chat` | Guest | messages (JSON string), provider ("openai"/"anthropic") | AI response |
| `send_email` | Guest | email data object | `{success}` |
| `upload_file` | Guest | file (FormData) | `{file_url}` |

## Frappe Doctypes

### Fateh Website Module
| Doctype | Type | Key Fields |
|---------|------|-----------|
| `Fateh Website Settings` | Single | calendly_url, ga4_enabled, ga4_property_id, ga4_service_account_json (Password) |
| `Website Lead` | List | lead_name, business_name, phone_number, email, location, status (New/Contacted/Converted/Trash), ad_source, ad_campaign |
| `Website Testimonial` | List | person_name, person_name_ar, role, role_ar, company, company_ar, quote, quote_ar, rating, display_order |
| `Website Pricing Plan` | List | plan_name, plan_name_ar, price, price_ar, description, description_ar, is_popular, display_order + child: Website Pricing Feature |
| `Website Pricing Feature` | Child | feature, feature_ar (parent: Website Pricing Plan) |
| `Website Pricing Comparison` | List | category_name, category_name_ar, feature_name, feature_name_ar, in_starter, in_professional, in_enterprise, display_order |
| `Website Analytics` | List | path, browser, source, campaign, creation (auto) |
| `GA4 Analytics Data` | List | site (Fateh/Enfono), date, ga4_property_id, sessions, page_views, users, bounce_rate, avg_session_duration, top_pages (JSON), top_sources (JSON) |

### Enfono Website Module
| Doctype | Type | Key Fields |
|---------|------|-----------|
| `Enfono Website Settings` | Single | 50+ fields for hero, services, AI chatbot config, GA4 |
| `Enfono Lead` | List | name, email, phone, company, message, source, status |
| `Enfono Blog Post` | List | title, slug, content, image, published |
| `Enfono Case Study` | List | title, slug, client, industry, content |
| `Enfono Brand` | List | brand_name, logo, description, link |
| `Enfono Client Logo` | List | client_name, logo |
| `Enfono Testimonial` | List | person_name, role, company, quote, rating |
| `Enfono Career` | List | title, department, location, description, requirements |
| `Enfono Team Member` | List | name, role, image, bio |
| `Enfono Office` | List | city, country, address, phone |
| `Enfono Media Event` | List | title, date, description, image |
| `Enfono Journey Milestone` | List | year, title, description |
| `Enfono Stat Item` | Child | label, value (used in settings) |

## External Dependencies

### Google Analytics (GA4)
- **Fateh**: Property `G-03C7BMD95G` (ID: `529142113`)
- **Enfono**: Property `G-8S8NFD5X80`
- **Service account**: `frappe-enfono-fateh@caramel-logic-490621-g2.iam.gserviceaccount.com`
- **API**: Google Analytics Data API v1 (REST)
- **Auth library**: `google-auth` (Python, installed via setup.py)
- **Credentials location**: Frappe Password fields in both Settings doctypes
- **How accessed**: `doc.get_password("ga4_service_account_json")` → `clean_json_string()` → `google.oauth2.service_account.Credentials`

### AI Chatbot (Enfono)
- **Providers**: OpenAI or Anthropic (configurable)
- **API key location**: `Enfono Website Settings` → `chatbot_api_key` (Password field)
- **Endpoint**: `fateh_website.enfono_api.chat`

### Email (Enfono)
- Uses Frappe's built-in email sending (`frappe.sendmail`)
- Configured via Frappe Email Account settings

## Connection Methods

| Service | Method | From Where |
|---------|--------|-----------|
| VPS (Caddy) | SSH: `ssh root@207.180.209.80` (pw: `enfono@123`) | Local machine |
| Frappe Server | SSH: `ssh root@156.67.105.6` (pw: `enfono123`), then `su - v15` | Local machine |
| Frappe API | HTTPS: `https://office.enfonoerp.com/api/method/...` | Browsers (CORS), curl |
| Frappe Console | `bench --site enfono-office-new console` | Frappe server (as v15 user) |
| GitHub repos | Git SSH/HTTPS | Local machine, Frappe server |

## Credentials Locations (NOT values)

| Credential | Where Stored | How Accessed |
|------------|-------------|-------------|
| VPS SSH password | `CLAUDE.md` (this repo) | Read from file |
| Frappe server SSH password | `CLAUDE.md` (this repo) | Read from file |
| GA4 service account JSON | Frappe Settings doctypes (Password field) | `doc.get_password("ga4_service_account_json")` |
| Chatbot API key | Enfono Website Settings (Password field) | `doc.get_password("chatbot_api_key")` |
| Admin 2FA TOTP secret | `settings.json` in Fateh repo | Read from file |
| Frappe admin password | Frappe `common_site_config.json` | `bench --site enfono-office-new set-admin-password` |
| Enfono `.env.production` | `enfono-website-v2/.env.production` | Build-time env var |
