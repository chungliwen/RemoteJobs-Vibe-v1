import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip auth for static assets and API routes
  if (context.url.pathname.startsWith('/_astro') || 
      context.url.pathname.startsWith('/api/')) {
    return next();
  }

  // For now, set a mock user for testing
  if (context.url.pathname.startsWith('/admin') || context.url.pathname.startsWith('/dashboard')) {
    context.locals.user = {
      id: 1,
      email: 'matt@rubycoded.com',
      role: 'admin',
      newsletter_opt_in: 1,
      category_preferences: null,
      created_at: '',
      updated_at: ''
    };
  }

  return next();
});