import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { category_preferences, newsletter_opt_in } = await request.json();
    
    const db = getDb(locals);
    
    // Update user preferences
    await db.prepare(`
      UPDATE users 
      SET category_preferences = ?, newsletter_opt_in = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      JSON.stringify(category_preferences || []),
      newsletter_opt_in || 0,
      locals.user.id
    ).run();

    return new Response(JSON.stringify({ 
      message: 'Preferences updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};