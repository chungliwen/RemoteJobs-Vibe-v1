import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { generateToken } from '../../../lib/utils';

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
    
    // Check if user exists, if not create one
    let user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    
    if (!user) {
      await db.prepare('INSERT INTO users (email) VALUES (?)').bind(email).run();
      user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    }

    // Generate magic link token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    
    // Store token
    await db.prepare(`
      INSERT INTO auth_tokens (user_email, token, expires_at) 
      VALUES (?, ?, ?)
    `).bind(email, token, expiresAt).run();

    // In development, log the magic link to console
    const magicLink = `http://localhost:4321/api/auth/verify?token=${token}`;
    console.log(`Magic link for ${email}: ${magicLink}`);

    return new Response(JSON.stringify({ 
      message: 'Magic link sent to your email',
      // In development, return the link for testing
      link: magicLink 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};