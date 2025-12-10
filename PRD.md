# PRD: RemoteJobs.com.my - MVP

## Overview

A job board for Malaysians seeking remote jobs they're eligible to apply for. Built on Astro with Cloudflare D1, designed for eventual full automation.

**Target URL**: remotejobs.com.my
**Tech Stack**: Astro + Cloudflare Pages + D1 (SQLite)
**Development Phase**: Local MVP (In Progress)

---

## 📊 Progress Summary (Updated: 2025-12-10)

### ✅ Completed (Phase 1 & 2)
- [x] Project initialized (Astro + Cloudflare adapter)
- [x] D1 database setup locally with full schema
- [x] Admin user seeded: `matt@rubycoded.com` (role: admin)
- [x] Base layouts and components (Header, Footer, BaseLayout)
- [x] Public job listing page (`/`) with **8 test jobs**
- [x] Filter controls (category, coverage) - auto-submit on change
- [x] Job detail pages (`/jobs/[id]`) with full metadata
- [x] Responsive design (mobile-first approach)
- [x] Global CSS with professional design system

### 📝 In Progress / Not Started (Phase 3-6)
- [ ] **Phase 3**: Magic link authentication (login/register pages)
- [ ] **Phase 4**: User dashboard & preferences
- [ ] **Phase 5**: Admin panel (approve/reject jobs, stats)
- [ ] **Phase 6**: WeWorkRemotely scraper (TypeScript port)

### 🧪 Testing Status
- Homepage: ✅ Working (8 jobs displayed)
- Filters: ✅ Working (category + coverage)
- Job detail pages: ✅ Working (test with `/jobs/1`)
- Database: ✅ Working (verified with wrangler CLI)
- Dev server: ✅ Running on http://localhost:4324/

---

## 🚀 Getting Started (For Your Colleague)

### Prerequisites
```bash
# Ensure you have Node.js 18+ installed
node --version
npm --version
```

### Run the Project
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Server runs on http://localhost:4324/

# In another terminal, you can query the database:
npm run db:query "SELECT * FROM job_listings WHERE status='approved'"
```

### Database Commands
```bash
npm run db:migrate    # Run initial schema (already done)
npm run db:seed       # Seed admin user (already done)
npm run db:query "SQL_HERE"  # Execute any SQL query
```

### Test URLs
- Homepage with all jobs: http://localhost:4324/
- Tech jobs only: http://localhost:4324/?category=tech-development
- Asia jobs: http://localhost:4324/?coverage=asia
- Job detail: http://localhost:4324/jobs/1
- (More pages coming: `/login`, `/register`, `/dashboard`, `/admin`)

---

## Goals

1. Display curated remote job listings eligible for Malaysians
2. Allow users to register, set job category preferences, and opt-in to newsletter
3. Provide admin interface to approve/reject scraped jobs
4. Automate job sourcing from WeWorkRemotely

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Visitor** | Browse jobs, view job details, sign up |
| **User** | Login, set category preferences, newsletter opt-in |
| **Admin** | All user capabilities + approve/reject jobs, view pending jobs |

---

## Features

### 1. Public Job Board

**Job Listing Page** (`/` or `/jobs`)
- Display approved jobs, sorted by listing date (newest first)
- Filter by category (multi-select)
- Filter by coverage (Malaysia, Asia, Worldwide)
- Show: Job title, company name, category, coverage, listing date
- Jobs older than 30 days are hidden from public view (remain in DB)

**Job Detail Page** (`/jobs/[id]`)
- Full job details
- Link to original listing (opens in new tab)
- "Apply" button (redirects to original listing)

**Categories** (MVP)
1. Tech/Development
2. Design/Creative
3. Writing/Content
4. Admin/Virtual Assistant
5. Marketing/Social Media
6. Customer Support
7. Other

**Coverage Types**
- Malaysia (jobs specifically mentioning Malaysia)
- Asia (jobs open to Asia region)
- Worldwide (jobs open globally / "Anywhere in the World")
- Other (unclear eligibility - admin reviews these)

---

### 2. Authentication (Magic Links)

**Registration** (`/register`)
- Email input
- Sends magic link to email (logged to console in dev)
- On first login, user record is created

**Login** (`/login`)
- Email input
- Sends magic link
- Magic link valid for 15 minutes, single use

**Magic Link Flow**
1. User enters email
2. System generates token, stores in DB with expiry
3. Console logs: `Magic link: http://localhost:4321/auth/verify?token=xxx`
4. User clicks link
5. System verifies token, creates session cookie
6. Redirect to dashboard

**Session**
- HTTP-only cookie with session token
- Session expires after 7 days of inactivity

---

### 3. User Dashboard (`/dashboard`)

**Profile Section**
- Display email
- Newsletter opt-in checkbox (saved to user record)

**Job Preferences**
- Multi-select checkboxes for categories of interest
- Saved to user record for future newsletter personalization

---

### 4. Admin Panel (`/admin`)

**Access Control**
- Only users with `role = 'admin'` can access
- Redirect non-admins to home

**Pending Jobs** (`/admin/jobs/pending`)
- List all jobs with `status = 'pending'`
- For each job, show: Title, Company, Category, Coverage, Listing Date, Source URL
- Actions: Approve, Reject
- Bulk actions: Approve all, Reject all (future enhancement)

**Approved Jobs** (`/admin/jobs/approved`)
- List all approved jobs
- Action: Archive (soft delete)

**Job Edit** (`/admin/jobs/[id]/edit`)
- Edit category (dropdown)
- Edit coverage (dropdown)
- Save changes

**Stats Dashboard** (`/admin`)
- Total jobs (all time)
- Jobs pending review
- Jobs approved this week
- Total users
- Newsletter subscribers count

---

### 5. Scraper (Local Script)

**Source**: WeWorkRemotely
- URLs: `/100-percent-remote-jobs`, `/remote-asia-jobs`

**Schedule**: Manual run during MVP (daily cron later)

**Logic** (ported from existing Ruby scraper)
1. Fetch listing pages
2. Parse job cards: title, company, listing URL, date, coverage tags
3. Determine coverage: Malaysia > Asia > Worldwide > Other
4. Check for duplicates by `listing_url`
5. Insert new jobs with `status = 'pending'`
6. Update existing jobs' `date_scraped`

**Output**
- Jobs inserted into D1 database
- Console log of new vs updated jobs

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  newsletter_opt_in INTEGER DEFAULT 0,
  category_preferences TEXT, -- JSON array of category slugs
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Magic link tokens
CREATE TABLE auth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Companies
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  website TEXT,
  logo_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Job listings
CREATE TABLE job_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_url TEXT UNIQUE NOT NULL,
  job_title TEXT NOT NULL,
  company_id INTEGER,
  category TEXT CHECK (category IN (
    'tech-development',
    'design-creative',
    'writing-content',
    'admin-virtual-assistant',
    'marketing-social-media',
    'customer-support',
    'other'
  )),
  coverage TEXT CHECK (coverage IN ('malaysia', 'asia', 'worldwide', 'other')),
  job_type TEXT DEFAULT 'remote',
  platform TEXT NOT NULL, -- e.g., 'WeWorkRemotely'
  listing_date TEXT,
  date_scraped TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  visible INTEGER DEFAULT 1, -- for soft hiding without changing status
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Indexes for performance
CREATE INDEX idx_jobs_status ON job_listings(status);
CREATE INDEX idx_jobs_category ON job_listings(category);
CREATE INDEX idx_jobs_coverage ON job_listings(coverage);
CREATE INDEX idx_jobs_listing_date ON job_listings(listing_date);
CREATE INDEX idx_jobs_visible ON job_listings(visible);
```

---

## Seed Data

```sql
-- Admin user
INSERT INTO users (email, role, newsletter_opt_in)
VALUES ('matt@rubycoded.com', 'admin', 1);
```

---

## Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── JobCard.astro
│   │   ├── JobFilters.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── AuthForm.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro
│   │   └── DashboardLayout.astro
│   ├── pages/
│   │   ├── index.astro              # Job listings
│   │   ├── jobs/
│   │   │   └── [id].astro           # Job detail
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── dashboard.astro          # User dashboard
│   │   ├── auth/
│   │   │   └── verify.astro         # Magic link verification
│   │   ├── admin/
│   │   │   ├── index.astro          # Admin dashboard
│   │   │   └── jobs/
│   │   │       ├── pending.astro
│   │   │       ├── approved.astro
│   │   │       └── [id]/
│   │   │           └── edit.astro
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login.ts         # Send magic link
│   │       │   ├── logout.ts
│   │       │   └── verify.ts        # Verify token
│   │       ├── user/
│   │       │   └── preferences.ts   # Update preferences
│   │       └── admin/
│   │           └── jobs/
│   │               ├── approve.ts
│   │               ├── reject.ts
│   │               └── update.ts
│   ├── lib/
│   │   ├── db.ts                    # D1 client setup
│   │   ├── auth.ts                  # Auth utilities
│   │   └── utils.ts
│   └── styles/
│       └── global.css
├── scripts/
│   └── scraper.ts                   # WeWorkRemotely scraper
├── migrations/
│   └── 0001_initial.sql
├── wrangler.toml
├── astro.config.mjs
├── package.json
└── PRD.md
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Send magic link | Public |
| GET | `/api/auth/verify` | Verify magic link token | Public |
| POST | `/api/auth/logout` | Clear session | User |
| PUT | `/api/user/preferences` | Update category prefs & newsletter | User |
| POST | `/api/admin/jobs/approve` | Approve job(s) | Admin |
| POST | `/api/admin/jobs/reject` | Reject job(s) | Admin |
| PUT | `/api/admin/jobs/update` | Update job details | Admin |

---

## Pages & Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Job listings with filters | No |
| `/jobs/[id]` | Job detail page | No |
| `/login` | Login form | No |
| `/register` | Registration form | No |
| `/auth/verify` | Magic link landing | No |
| `/dashboard` | User preferences | User |
| `/admin` | Admin stats dashboard | Admin |
| `/admin/jobs/pending` | Pending jobs list | Admin |
| `/admin/jobs/approved` | Approved jobs list | Admin |
| `/admin/jobs/[id]/edit` | Edit job | Admin |

---

## Development Setup

### Prerequisites
- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

```bash
# Install dependencies
npm install

# Create D1 database locally
wrangler d1 create remotejobs-db --local

# Run migrations
wrangler d1 execute remotejobs-db --local --file=./migrations/0001_initial.sql

# Seed admin user
wrangler d1 execute remotejobs-db --local --command="INSERT INTO users (email, role, newsletter_opt_in) VALUES ('matt@rubycoded.com', 'admin', 1);"

# Start dev server
npm run dev

# Run scraper (separate terminal)
npm run scrape
```

---

## Implementation Phases

### ✅ Phase 1: Foundation (COMPLETE)
- [x] PRD complete
- [x] Project setup (Astro + D1 with Cloudflare adapter)
- [x] Database schema & migrations (all tables created)
- [x] Seed admin user: `matt@rubycoded.com` (role: admin)
- [x] Basic layout components (Header, Footer, BaseLayout)
- [x] Global CSS with design system

**Artifacts**: `/migrations/0001_initial.sql`, `/src/layouts/`, `/src/styles/global.css`

---

### ✅ Phase 2: Public Features (COMPLETE)
- [x] Job listing page (`/`) with real database queries
- [x] Filter controls (category + coverage dropdowns with auto-submit)
- [x] Job detail page (`/jobs/[id]`) with full metadata
- [x] JobCard component (reusable job display)
- [x] Responsive design (mobile-first)
- [x] Test data seeded: 8 approved jobs + 2 pending jobs

**Key Files**:
- `/src/pages/index.astro` - Job listings with filters
- `/src/pages/jobs/[id].astro` - Job detail page
- `/src/components/JobCard.astro` - Job card component
- `/src/components/JobFilters.astro` - Filter controls
- `/migrations/seed_jobs.sql` - Test job data

**Database Queries Used**:
- `SELECT * FROM job_listings WHERE status='approved' AND visible=1 AND listing_date >= date('now', '-30 days')`
- Filters applied with parameterized queries to prevent SQL injection

---

### 📋 Phase 3: Authentication (NOT STARTED)

**What needs to be done:**
1. Create `/src/pages/login.astro` - Email input form
2. Create `/src/pages/register.astro` - Email input form (same as login)
3. Create `/src/pages/auth/verify.astro` - Magic link verification page
4. Create `/src/lib/auth.ts` - Auth helper functions
5. Create API endpoints:
   - `POST /api/auth/login.ts` - Generate token, save to `auth_tokens` table, console log magic link
   - `GET /api/auth/verify.ts` - Verify token, create session, redirect
   - `POST /api/auth/logout.ts` - Clear session cookie

**Implementation Details**:
- Magic link format: `http://localhost:4324/auth/verify?token=<random_token>`
- Token stored in `auth_tokens` table with `expires_at` (15 minutes)
- Session token stored in `sessions` table with user_id
- HTTP-only cookie for session management
- Console output: `Magic link: http://localhost:4324/auth/verify?token=abc123def456`

**Testing**:
- Visit `/login`, enter `test@example.com`
- Copy magic link from console
- Click link or paste in browser
- Should redirect to `/dashboard` with session

---

### 📋 Phase 4: User Features (NOT STARTED)

**What needs to be done:**
1. Create `/src/pages/dashboard.astro` - User dashboard (protected page)
2. Add `src/lib/middleware.ts` - Check if user is logged in, set `Astro.locals.user`
3. Implement user preferences:
   - Display email
   - Toggle newsletter_opt_in checkbox
   - Multi-select for category_preferences (stored as JSON)
   - Save button → PUT `/api/user/preferences`
4. Create `PUT /api/user/preferences.ts` endpoint

**Database Updates**:
- `UPDATE users SET newsletter_opt_in=?, category_preferences=? WHERE id=?`

---

### 📋 Phase 5: Admin Panel (NOT STARTED)

**What needs to be done:**
1. Create `/src/pages/admin/index.astro` - Stats dashboard (protected to admin only)
   - Total jobs count
   - Pending jobs count
   - Approved jobs this week
   - Total users
   - Newsletter subscribers count
2. Create `/src/pages/admin/jobs/pending.astro` - List jobs with `status='pending'`
3. Create `/src/pages/admin/jobs/approved.astro` - List approved jobs
4. Create `/src/pages/admin/jobs/[id]/edit.astro` - Edit category/coverage
5. Create API endpoints:
   - `POST /api/admin/jobs/approve.ts` - Set status='approved'
   - `POST /api/admin/jobs/reject.ts` - Set status='rejected'
   - `PUT /api/admin/jobs/update.ts` - Update category/coverage

**Middleware**: Add admin role check to protect `/admin/*` routes

---

### 📋 Phase 6: Scraper (NOT STARTED)

**What needs to be done:**
1. Port WeWorkRemotely scraper from Ruby to TypeScript
   - Reference: `/we_work_remotely_scraper.rb`
   - Create: `/scripts/scraper.ts`
2. Connect to local D1 database
3. Insert scraped jobs as `status='pending'` (for manual approval)
4. Create `npm run scrape` script to run locally
5. Future: Set up cron job on VPS to run daily

**Key Logic** (from Ruby scraper):
- URLs: `https://weworkremotely.com/100-percent-remote-jobs` + `/remote-asia-jobs`
- Parse job title, company, URL, listing date
- Determine coverage: Malaysia > Asia > Worldwide > Other
- Check for duplicates by `listing_url` (unique constraint)
- Log: new jobs count, updated jobs count

---

## Future Enhancements (Post-MVP)

- ListMonk integration for actual email sending
- Stripe integration for paid job posts
- Auto-whitelist rules for trusted companies
- Additional job sources (Hiredly, JobStreet, LinkedIn)
- Weekly newsletter generation
- Job alerts based on user preferences
- Company profiles
- Full-text search
- SEO optimization

---

## Success Metrics (Post-Launch)

- Jobs scraped per week: 20+
- User registrations
- Newsletter opt-in rate
- Job approval rate
- Admin time spent on curation

---

## What's Next? (For Your Colleague)

**Priority Order:**
1. **Phase 3 (Authentication)** - Needed for user features to work
2. **Phase 4 (User Dashboard)** - Needed for newsletter + preferences
3. **Phase 5 (Admin Panel)** - Needed to review/approve scraped jobs
4. **Phase 6 (Scraper)** - Once admin panel is ready

**Recommended First Steps:**
1. Run the project: `npm install && npm run dev`
2. Test homepage at http://localhost:4324/ (should show 8 jobs)
3. Test filters and job detail pages
4. Start with Phase 3 (Magic Link Auth) - Most complex but unlocks other features
5. Refer to the detailed "What needs to be done" sections above for each phase

**Key Architecture Notes:**
- All pages are server-rendered (Astro's default)
- Database queries happen at build/request time
- Session management via HTTP-only cookies (Cloudflare KV when deployed)
- D1 queries use parameterized statements (prepared queries) for security
- No external dependencies for auth (no NextAuth, no third-party libraries)

**Database Health Check:**
```bash
# Verify data is in the database:
npm run db:query "SELECT COUNT(*) as total_jobs FROM job_listings WHERE status='approved'"
npm run db:query "SELECT * FROM users WHERE email='matt@rubycoded.com'"
npm run db:query "SELECT * FROM job_listings LIMIT 2"
```

**File to NOT modify:**
- Don't rename migrations (they define schema)
- Keep `global.css` as base style system
- `db.ts` defines all TypeScript interfaces

---

## Open Questions

1. ~~Authentication method~~ → Magic links ✅
2. ~~Database choice~~ → D1 with local emulator ✅
3. ~~Initial job source~~ → WeWorkRemotely only for MVP ✅
4. ~~Should job descriptions be scraped?~~ → Link only for MVP (avoids copyright) ✅
5. ~~Mobile-first design?~~ → Yes, mobile-first responsive design ✅

---

## Appendix: Category Mapping

When scraping, attempt to auto-categorize based on job title keywords:

| Keywords | Category |
|----------|----------|
| developer, engineer, software, frontend, backend, fullstack, devops, sre, data scientist, machine learning | tech-development |
| designer, ui, ux, graphic, creative, illustrator | design-creative |
| writer, content, copywriter, editor, journalist, blogger | writing-content |
| assistant, admin, virtual assistant, secretary, data entry | admin-virtual-assistant |
| marketing, social media, seo, growth, community manager | marketing-social-media |
| support, customer service, customer success, helpdesk | customer-support |
| (default) | other |

---

*Last updated: 2024-12-10*
