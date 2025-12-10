-- Initial schema for RemoteJobs.com.my

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
    'other',
    ''
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
