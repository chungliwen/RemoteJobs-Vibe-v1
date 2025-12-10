// Global type definitions for Astro
declare global {
  namespace App {
    interface Locals {
      user?: {
        id: number;
        email: string;
        role: 'user' | 'admin';
        newsletter_opt_in: number;
        category_preferences: string | null;
        created_at: string;
        updated_at: string;
      } | null;
      runtime: {
        env: {
          DB: D1Database;
        };
      };
    }
  }
}

export {};