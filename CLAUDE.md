# Fateh ERP & Enfono — Project Guide

## Project Overview

Two marketing websites (fateherp.com + enfono.com) with a shared Frappe v15 backend for CMS, lead management, analytics, and AI chatbot.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  fateherp.com   │     │   enfono.com    │
│  React+Vite+TS  │     │  React (CRA)   │
│  Tailwind CSS   │     │  SCSS+Bootstrap │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────┬───────────────┘
                 │ API calls
                 ▼
    ┌────────────────────────┐
    │  office.enfonoerp.com  │
    │  Frappe v15 + ERPNext  │
    │  fateh_website app     │
    │  (both modules inside) │
    └────────────────────────┘
```

## Repositories

| Repo | GitHub | Branch | Purpose |
|------|--------|--------|---------|
| Fateh frontend | `sayanthns/Fatheherp-website` | main | fateherp.com React+Vite+TS SPA |
| Enfono frontend | `sayanthns/enfono-website-v2` | main | enfono.com React CRA SPA |
| Frappe custom app | `sayanthns/fateh_website` | master | Backend: doctypes, APIs, scheduler |

## Servers

### VPS — Static Website Hosting
- **IP**: `156.67.105.6`
- **SSH**: `root` / `enfono123`
- **Web server**: Caddy (systemd)
- **Caddyfile**: `/etc/caddy/Caddyfile`
- **Document roots**:
  - `/var/www/enfono/` — enfono.com build
  - `/var/www/fateh/` — fateherp.com build

### Frappe Server — Backend API + ERP
- **IP**: `156.67.105.6` (same server)
- **SSH**: `root` / `enfono123`, then `su - v15`
- **Bench**: `/home/v15/frappe-bench/`
- **Site**: `enfono-office-new` (office.enfonoerp.com)
- **App path**: `apps/fateh_website/`
- **Git remote in server**: `upstream` → `sayanthns/fateh_website`
- **Python env**: `/home/v15/frappe-bench/env/`
- **Other sites on this server**: `katcherp`, `spice`, `office` — DO NOT TOUCH

### DNS
- `enfono.com` → 156.67.105.6
- `fateherp.com` → 156.67.105.6
- `office.enfonoerp.com` → 156.67.105.6 (Frappe)

## Local Development Paths

```
~/Documents/Fateh-website-claude-frappe/     # Fateh frontend (this repo)
~/Documents/enfono-website-v2/               # Enfono frontend
/tmp/fateh_website_repo/                     # Frappe app (cloned for editing)
```

## Frappe App Structure (`fateh_website`)

```
fateh_website/
├── hooks.py                    # App config, scheduler, CORS, fixtures
├── api.py                      # Fateh public API endpoints
├── enfono_api.py               # Enfono public API endpoints + AI chatbot
├── ga4.py                      # Google Analytics Data API integration
├── tasks.py                    # Scheduler: purge_trashed_leads, sync_ga4_analytics
├── install.py                  # Post-install setup
├── fateh_website/              # Module: Fateh Website
│   ├── doctype/
│   │   ├── fateh_website_settings/   # Single: Calendly URL + GA4 config
│   │   ├── website_lead/             # Leads from contact forms
│   │   ├── website_testimonial/      # Testimonials
│   │   ├── website_pricing_plan/     # Pricing tiers
│   │   ├── website_pricing_comparison/ # Feature comparison matrix
│   │   ├── website_pricing_feature/  # Individual features
│   │   ├── website_analytics/        # Page visit tracking (custom)
│   │   └── ga4_analytics_data/       # Daily GA4 metrics per site
│   └── workspace/fateh_website/      # Workspace dashboard config
├── enfono_website/             # Module: Enfono Website
│   ├── doctype/
│   │   ├── enfono_website_settings/  # Single: 50 fields (hero, services, AI chatbot, GA4)
│   │   ├── enfono_lead/              # Enfono leads
│   │   ├── enfono_blog_post/         # Blog posts
│   │   ├── enfono_case_study/        # Case studies
│   │   ├── enfono_brand/             # Product brands
│   │   ├── enfono_client_logo/       # Client logos
│   │   ├── enfono_testimonial/       # Testimonials
│   │   ├── enfono_career/            # Job listings
│   │   ├── enfono_team_member/       # Team members
│   │   ├── enfono_office/            # Office locations
│   │   ├── enfono_media_event/       # Media events
│   │   ├── enfono_journey_milestone/ # Timeline milestones
│   │   └── enfono_stat_item/         # Stats (child table)
│   └── workspace/enfono_website/     # Workspace dashboard config
└── fixtures/                   # Auto-loaded data on bench migrate
```

## Key API Endpoints

### Fateh (`api.py`)
- `fateh_website.api.get_settings` — Fateh website settings
- `fateh_website.api.get_testimonials` — Testimonials list
- `fateh_website.api.get_pricing` — Pricing plans + features + comparison
- `fateh_website.api.submit_lead` — Contact form submission
- `fateh_website.api.log_visit` — Page view tracking

### Enfono (`enfono_api.py`)
- `fateh_website.enfono_api.get_settings` — Enfono settings (hero, services, AI)
- `fateh_website.enfono_api.get_all_content` — All CMS content in one call
- `fateh_website.enfono_api.submit_lead` — Contact form
- `fateh_website.enfono_api.chat` — AI chatbot (OpenAI/Anthropic)
- `fateh_website.enfono_api.get_blog_posts` — Blog listing
- `fateh_website.enfono_api.get_case_studies` — Case studies

## Google Analytics (GA4) Integration

### Setup
- Fateh GA4: `G-03C7BMD95G` (property ID: `529142113`)
- Enfono GA4: `G-8S8NFD5X80`
- Service account: `frappe-enfono-fateh@caramel-logic-490621-g2.iam.gserviceaccount.com`
- Google Cloud project: `caramel-logic-490621-g2`
- API: Google Analytics Data API v1 (REST, via `google-auth` + `requests`)

### How It Works
1. GA4 tags in both frontend `index.html` files send pageview data to Google
2. Daily scheduler (`sync_ga4_analytics`) pulls yesterday's metrics via GA4 Data API
3. Data stored in `GA4 Analytics Data` doctype (one record per site per day)
4. Displayed in workspace dashboards via Number Cards and Dashboard Charts
5. Manual sync available via "Sync GA4 Now" button in both Settings doctypes

### Credentials Storage
- Stored in `Fateh Website Settings` and `Enfono Website Settings`
- Fields: `ga4_enabled` (Check), `ga4_property_id` (Data), `ga4_service_account_json` (Password)
- Password field encrypts at rest; access via `doc.get_password("ga4_service_account_json")`
- JSON needs cleanup (Frappe strips braces, adds NBSP) — handled by `clean_json_string()` in `ga4.py`

## Deployment Procedures

### Deploy Fateh Frontend
```bash
cd ~/Documents/Fateh-website-claude-frappe/client
npm run build
sshpass -p 'enfono123' scp -r dist/* root@156.67.105.6:/var/www/fateh/
```

### Deploy Enfono Frontend
```bash
cd ~/Documents/enfono-website-v2
npm run build
sshpass -p 'enfono123' scp -r build/* root@156.67.105.6:/var/www/enfono/
```

### Deploy Frappe App Changes
```bash
# 1. Push changes from local repo
cd /tmp/fateh_website_repo
git add -A && git commit -m "message" && git push origin master

# 2. Pull on server
ssh root@156.67.105.6
su - v15
cd frappe-bench/apps/fateh_website
git pull upstream master

# 3. Migrate (if doctype changes)
cd ~/frappe-bench
bench --site enfono-office-new migrate

# 4. Restart gunicorn
kill -HUP $(ps aux | grep 'gunicorn.*frappe.app' | grep -v grep | head -1 | awk '{print $2}')
```

### Server Console (for debugging)
```bash
ssh root@156.67.105.6
su - v15
cd frappe-bench
bench --site enfono-office-new console
```

## Workspace Dashboards

### Fateh Website Workspace
- Number Cards: Total Leads, New Leads, Contacted Leads, Converted Leads, Total Page Views, GA4 Sessions, GA4 Page Views, GA4 Users, GA4 Bounce Rate
- Charts: GA4 Sessions Trend, GA4 Page Views Trend
- Shortcuts: All Leads, Testimonials, Pricing Plans, Website Analytics, GA4 Analytics Data

### Enfono Website Workspace
- Number Cards: GA4 Sessions, GA4 Page Views, GA4 Users, GA4 Bounce Rate
- Charts: GA4 Sessions Trend, GA4 Page Views Trend
- Shortcuts: All Enfono Leads, Blog Posts, Case Studies, Brands, etc.

## Scheduler Tasks

| Task | Schedule | Function |
|------|----------|----------|
| Purge trashed leads | Daily | `fateh_website.tasks.purge_trashed_leads` |
| GA4 analytics sync | Daily | `fateh_website.tasks.sync_ga4_analytics` |

## Tech Stack

### Fateh Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- React Router v6

### Enfono Frontend
- React 18 + JavaScript + CRA
- SCSS + React Bootstrap
- Framer Motion
- React Router v6

### Backend
- Frappe v15.69.2
- ERPNext v15.63.0
- Python 3.12
- MariaDB
- Redis
- google-auth (for GA4 API)

## Important Notes

- Both frontends are SPAs with client-side routing — Caddy has `try_files` fallback to `index.html`
- CORS is configured in `hooks.py` (`allow_cors` list) for both localhost and production domains
- The Frappe app uses `fixtures` for auto-loading Testimonials, Pricing Plans, Pricing Comparisons, and Fateh Website Settings on `bench migrate`
- Enfono CMS data is stored in individual doctypes (not fixtures) and loaded via `get_all_content` API
- AI chatbot uses `chatbot_api_key` (Password field) in Enfono Website Settings — supports OpenAI and Anthropic
