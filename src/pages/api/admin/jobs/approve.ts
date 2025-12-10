import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { job_id } = await request.json();
    
    if (!job_id) {
      return new Response(JSON.stringify({ error: 'Job ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb(locals);
    
    // Update job status to approved
    await db.prepare(`
      UPDATE job_listings 
      SET status = 'approved', updated_at = datetime('now')
      WHERE id = ?
    `).bind(job_id).run();

    return new Response(JSON.stringify({ 
      message: 'Job approved successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Job approval error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};