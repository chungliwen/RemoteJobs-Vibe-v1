import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Skip auth for static assets and API routes
  if (context.url.pathname.startsWith('/_astro') || 
      context.url.pathname.startsWith('/api/')) {
    return next();
  }

  // Check for session cookie
  const sessionToken = context.cookies.get('session_token')?.value;
  
  if (sessionToken) {
    try {
      // In production, this would validate against database
      // For now, we'll use a mock user for testing
      if (context.url.pathname.startsWith('/admin') || context.url.pathname.startsWith('/dashboard')) {
        context.locals.user = {
          id: 1,
          email: 'matt@rubycoded.com',
          role: 'admin',
          newsletter_opt_in: 1,
          category_preferences: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    } catch (error) {
      // Invalid session, clear cookie
      context.cookies.delete('session_token', { path: '/' });
    }
  }

  return next();
};