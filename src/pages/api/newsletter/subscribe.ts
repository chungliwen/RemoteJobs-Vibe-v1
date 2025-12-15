import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb(locals);
    
    // Check if user exists, create if not
    let user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    
    if (!user) {
      await db.prepare('INSERT INTO users (email, newsletter_opt_in) VALUES (?, 1)').bind(email).run();
      user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    } else {
      // Update newsletter preference
      await db.prepare('UPDATE users SET newsletter_opt_in = 1, updated_at = datetime(\'now\') WHERE email = ?').bind(email).run();
    }

    // In a real implementation, this would send to a newsletter service
    // For now, we'll just log it
    console.log(`Newsletter subscription: ${email}`);
    
    return new Response(JSON.stringify({ 
      message: 'Successfully subscribed to newsletter!' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Check if user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb(locals);
    
    // Get all newsletter subscribers
    const subscribers = await db.prepare(`
      SELECT email, created_at 
      FROM users 
      WHERE newsletter_opt_in = 1 
      ORDER BY created_at DESC
    `).all();

    return new Response(JSON.stringify({ 
      subscribers: subscribers.results,
      count: subscribers.results.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};