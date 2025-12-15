import type { APIRoute } from 'astro';
import { getDb } from '../../../../lib/db';

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is admin
    if (!locals.user || locals.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { 
      job_id, 
      job_title, 
      company_name, 
      category, 
      coverage, 
      job_type, 
      listing_date, 
      listing_url, 
      platform 
    } = await request.json();
    
    if (!job_id) {
      return new Response(JSON.stringify({ error: 'Job ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb(locals);
    
    // Handle company - create new if provided
    let companyId = null;
    if (company_name) {
      const existingCompany = await db.prepare(
        'SELECT id FROM companies WHERE name = ?'
      ).bind(company_name).first();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const result = await db.prepare(
          'INSERT INTO companies (name) VALUES (?)'
        ).bind(company_name).run();
        companyId = result.meta.last_row_id;
      }
    }

    // Update job
    await db.prepare(`
      UPDATE job_listings 
      SET job_title = ?, company_id = ?, category = ?, coverage = ?, 
          job_type = ?, listing_date = ?, listing_url = ?, 
          platform = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      job_title,
      companyId,
      category,
      coverage,
      job_type,
      listing_date,
      listing_url,
      platform,
      job_id
    ).run();

    return new Response(JSON.stringify({ 
      message: 'Job updated successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Job edit error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};