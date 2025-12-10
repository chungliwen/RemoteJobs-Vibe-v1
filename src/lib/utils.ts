/**
 * Utility functions
 */

/**
 * Format a date string to a human-readable format
 */
export function formatDate(date: string | null): string {
  if (!date) return 'N/A';

  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return d.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Generate a random token for auth
 */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Category mappings
 */
export const CATEGORIES = {
  'tech-development': 'Tech/Development',
  'design-creative': 'Design/Creative',
  'writing-content': 'Writing/Content',
  'admin-virtual-assistant': 'Admin/Virtual Assistant',
  'marketing-social-media': 'Marketing/Social Media',
  'customer-support': 'Customer Support',
  'other': 'Other'
} as const;

export type CategorySlug = keyof typeof CATEGORIES;

/**
 * Coverage mappings
 */
export const COVERAGE = {
  'malaysia': 'Malaysia',
  'asia': 'Asia',
  'worldwide': 'Worldwide',
  'other': 'Other'
} as const;

export type CoverageSlug = keyof typeof COVERAGE;

/**
 * Get readable category name
 */
export function getCategoryLabel(slug: string | null): string {
  if (!slug) return 'Uncategorized';
  return CATEGORIES[slug as CategorySlug] || 'Other';
}

/**
 * Get readable coverage name
 */
export function getCoverageLabel(slug: string): string {
  return COVERAGE[slug as CoverageSlug] || 'Other';
}
