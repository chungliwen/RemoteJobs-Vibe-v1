import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const GET: APIRoute = async ({ url, locals, cookies }) => {
  try {
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new Response('Invalid magic link', { status: 400 });
    }

    const db = getDb(locals);
    
    // Find and validate token
    const authToken = await db.prepare(`
      SELECT * FROM auth_tokens 
      WHERE token = ? AND expires_at > datetime('now') AND used = 0
    `).bind(token).first();

    if (!authToken) {
      return new Response('Invalid or expired magic link', { status: 400 });
    }

    // Mark token as used
    await db.prepare('UPDATE auth_tokens SET used = 1 WHERE id = ?')
      .bind(authToken.id).run();

    // Get or create user
    let user = await db.prepare('SELECT * FROM users WHERE email = ?')
      .bind(authToken.user_email).first();

    if (!user) {
      await db.prepare('INSERT INTO users (email) VALUES (?)')
        .bind(authToken.user_email).run();
      user = await db.prepare('SELECT * FROM users WHERE email = ?')
        .bind(authToken.user_email).first();
    }

    // Create session
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at) 
      VALUES (?, ?, ?)
    `).bind(user!.id, sessionToken, sessionExpires).run();

    // Set session cookie
    cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    // Redirect to dashboard
    return Response.redirect(new URL('/dashboard', url.origin), 302);

  } catch (error) {
    console.error('Verification error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};