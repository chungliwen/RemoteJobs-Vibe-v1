#!/usr/bin/env node

/**
 * Scraper script - Run the WeWorkRemotely scraper
 * Usage: npm run scrape
 */

import { WeWorkRemotelyScraper } from '../src/lib/scraper.js';

// Mock D1 database interface for local development
class MockD1Database {
  private data: Map<string, any[]> = new Map();
  
  prepare(query: string) {
    return {
      bind: (...params: any[]) => ({
        first: async () => {
          // Mock implementation for finding existing records
          if (query.includes('SELECT id FROM job_listings WHERE listing_url = ?')) {
            const listings = this.data.get('job_listings') || [];
            const existing = listings.find((job: any) => job.listing_url === params[0]);
            return existing || null;
          }
          
          if (query.includes('SELECT id FROM companies WHERE name = ?')) {
            const companies = this.data.get('companies') || [];
            const existing = companies.find((company: any) => company.name === params[0]);
            return existing || null;
          }
          
          return null;
        },
        run: async () => {
          // Mock implementation for insert/update operations
          if (query.includes('INSERT INTO companies')) {
            const companies = this.data.get('companies') || [];
            const newId = companies.length + 1;
            companies.push({
              id: newId,
              name: params[0],
              created_at: new Date().toISOString()
            });
            this.data.set('companies', companies);
            
            return {
              meta: { last_row_id: newId }
            };
          }
          
          if (query.includes('INSERT INTO job_listings')) {
            const listings = this.data.get('job_listings') || [];
            const newId = listings.length + 1;
            listings.push({
              id: newId,
              listing_url: params[0],
              job_title: params[1],
              company_id: params[2],
              category: params[3],
              coverage: params[4],
              job_type: params[5],
              platform: params[6],
              listing_date: params[7],
              date_scraped: params[8],
              status: params[9],
              visible: params[10],
              created_at: new Date().toISOString()
            });
            this.data.set('job_listings', listings);
            
            return {
              meta: { last_row_id: newId }
            };
          }
          
          if (query.includes('UPDATE job_listings')) {
            const listings = this.data.get('job_listings') || [];
            const index = listings.findIndex((job: any) => job.id === params[params.length - 1]);
            if (index !== -1) {
              listings[index] = { ...listings[index], updated_at: new Date().toISOString() };
              this.data.set('job_listings', listings);
            }
          }
          
          return { meta: {} };
        },
        all: async () => {
          return {
            results: this.data.get('job_listings') || []
          };
        }
      })
    };
  }
}

async function runScraper() {
  console.log('🚀 Starting WeWorkRemotely scraper...');
  
  try {
    // In production, this would be the actual D1 database
    // For now, we'll use a mock to demonstrate the scraper logic
    const mockDb = new MockD1Database();
    
    const scraper = new WeWorkRemotelyScraper(mockDb, 10); // Limit to 10 jobs for testing
    await scraper.scrape();
    
    console.log('✅ Scraping completed successfully!');
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  }
}

// Run the scraper
runScraper();