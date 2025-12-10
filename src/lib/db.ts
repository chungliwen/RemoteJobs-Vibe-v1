/**
 * Database client for D1
 * Provides type-safe access to the database
 */

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  newsletter_opt_in: number;
  category_preferences: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  website: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface JobListing {
  id: number;
  listing_url: string;
  job_title: string;
  company_id: number | null;
  category: string | null;
  coverage: 'malaysia' | 'asia' | 'worldwide' | 'other';
  job_type: string;
  platform: string;
  listing_date: string | null;
  date_scraped: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  visible: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface AuthToken {
  id: number;
  user_email: string;
  token: string;
  expires_at: string;
  used: number;
  created_at: string;
}

export type D1Database = import('@cloudflare/workers-types').D1Database;

/**
 * Get the database instance from Astro locals
 */
export function getDb(locals: App.Locals): D1Database {
  return locals.runtime.env.DB;
}
