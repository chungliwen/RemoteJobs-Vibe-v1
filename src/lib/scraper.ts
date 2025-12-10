/**
 * WeWorkRemotely Scraper - TypeScript version
 * Scrapes remote jobs from WeWorkRemotely.com and saves them to D1 database
 */

interface JobListing {
  listing_url: string;
  job_title: string;
  company_name: string;
  date_scraped: string;
  listing_date: string | null;
  coverage: 'malaysia' | 'asia' | 'worldwide' | 'other';
  job_type: string;
  job_category: string;
  platform: string;
}

interface Company {
  id: number;
  name: string;
}

interface Database {
  prepare(query: string): any;
}

class WeWorkRemotelyScraper {
  private readonly BASE_URL = 'https://weworkremotely.com';
  private readonly MAX_LISTINGS = 50;
  private readonly urls = [
    `${this.BASE_URL}/100-percent-remote-jobs`,
    `${this.BASE_URL}/remote-asia-jobs`
  ];
  
  private maxListings: number;
  private platform: string;
  private jobs: JobListing[] = [];
  private db: Database;

  constructor(db: Database, maxListings: number = this.MAX_LISTINGS) {
    this.db = db;
    this.maxListings = maxListings;
    this.platform = 'WeWorkRemotely';
  }

  async scrape(): Promise<void> {
    console.log(`Starting to scrape listings from ${this.platform}`);
    
    for (const url of this.urls) {
      await this.fetchJobs(url);
      if (this.jobs.length >= this.maxListings) break;
    }
    
    console.log(`Finished scraping. Total listings processed: ${this.jobs.length}`);
    await this.saveListingsToDatabase();
  }

  private async fetchJobs(startUrl: string): Promise<void> {
    let url = startUrl;
    
    while (true) {
      console.log(`Fetching page: ${url}`);
      
      try {
        const response = await fetch(url);
        const html = await response.text();
        const jobListings = this.parseJobListings(html);
        
        this.processListings(jobListings);
        
        if (this.jobs.length >= this.maxListings) break;
        
        // Check for next page (simplified - WWR pagination might need more complex handling)
        const nextUrlMatch = html.match(/href="([^"]*page[^"]*)"/);
        if (!nextUrlMatch) break;
        
        url = nextUrlMatch[1].startsWith('http') 
          ? nextUrlMatch[1] 
          : this.BASE_URL + nextUrlMatch[1];
          
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        break;
      }
    }
  }

  private parseJobListings(html: string): Element[] {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find job listings - WWR uses specific CSS classes
    return Array.from(doc.querySelectorAll('li.feature, li:not([class])'));
  }

  private processListings(jobListings: Element[]): void {
    for (const job of jobListings) {
      if (this.jobs.length >= this.maxListings) break;
      
      const processedJob = this.processJob(job);
      if (processedJob) {
        this.jobs.push(processedJob);
      }
    }
  }

  private processJob(job: Element): JobListing | null {
    try {
      const jobLinkElement = job.querySelector('a[href*="/remote-jobs/"]');
      if (!jobLinkElement) return null;
      
      const jobTitleElement = job.querySelector('span.title');
      const companyElement = job.querySelector('span.company');
      const tagsElement = job.querySelector('.region.company');
      const dateElement = job.querySelector('.listing-date__date');
      
      if (!jobTitleElement || !companyElement) return null;
      
      const jobTitle = jobTitleElement.textContent?.trim() || '';
      const companyName = companyElement.textContent?.trim() || '';
      const tags = tagsElement?.textContent?.trim() || '';
      const listingDate = this.extractListingDate(dateElement);
      
      const href = jobLinkElement.getAttribute('href');
      if (!href) return null;
      
      return {
        listing_url: this.BASE_URL + href,
        job_title: jobTitle,
        company_name: companyName,
        date_scraped: new Date().toISOString().split('T')[0],
        listing_date: listingDate,
        coverage: this.determineCoverage(tags),
        job_type: 'remote',
        job_category: this.categorizeJob(jobTitle),
        platform: this.platform
      };
    } catch (error) {
      console.error('Error processing job:', error);
      return null;
    }
  }

  private determineCoverage(tags: string): 'malaysia' | 'asia' | 'worldwide' | 'other' {
    if (tags.includes('Malaysia')) return 'malaysia';
    if (tags.includes('Asia')) return 'asia';
    if (tags.includes('Anywhere in the World')) return 'worldwide';
    return 'other';
  }

  private categorizeJob(jobTitle: string): string {
    const title = jobTitle.toLowerCase();
    
    if (title.match(/developer|engineer|software|frontend|backend|fullstack|devops|sre|data scientist|machine learning|programmer/)) {
      return 'tech-development';
    }
    if (title.match(/designer|ui|ux|graphic|creative|illustrator/)) {
      return 'design-creative';
    }
    if (title.match(/writer|content|copywriter|editor|journalist|blogger/)) {
      return 'writing-content';
    }
    if (title.match(/assistant|admin|virtual assistant|secretary|data entry/)) {
      return 'admin-virtual-assistant';
    }
    if (title.match(/marketing|social media|seo|growth|community manager/)) {
      return 'marketing-social-media';
    }
    if (title.match(/support|customer service|customer success|helpdesk/)) {
      return 'customer-support';
    }
    
    return 'other';
  }

  private extractListingDate(dateElement: Element | null): string | null {
    if (!dateElement) return null;
    
    const dateText = dateElement.textContent?.trim() || '';
    const today = new Date();
    
    const hoursMatch = dateText.match(/(\d+)h/);
    if (hoursMatch) {
      return today.toISOString().split('T')[0];
    }
    
    const daysMatch = dateText.match(/(\d+)d/);
    if (daysMatch) {
      const daysAgo = parseInt(daysMatch[1]);
      const date = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      return date.toISOString().split('T')[0];
    }
    
    console.warn(`Unable to parse date: ${dateText}`);
    return null;
  }

  private async saveListingsToDatabase(): Promise<void> {
    let newJobs = 0;
    let updatedJobs = 0;

    for (const job of this.jobs) {
      try {
        // Check if job already exists
        const existingJob = await this.db.prepare(
          'SELECT id FROM job_listings WHERE listing_url = ?'
        ).bind(job.listing_url).first();

        // Find or create company
        let companyId = null;
        if (job.company_name) {
          const existingCompany = await this.db.prepare(
            'SELECT id FROM companies WHERE name = ?'
          ).bind(job.company_name).first();

          if (existingCompany) {
            companyId = existingCompany.id;
          } else {
            const result = await this.db.prepare(
              'INSERT INTO companies (name) VALUES (?)'
            ).bind(job.company_name).run();
            companyId = result.meta.last_row_id;
          }
        }

        if (existingJob) {
          // Update existing job
          await this.db.prepare(`
            UPDATE job_listings 
            SET date_scraped = ?, listing_date = ?, job_title = ?, 
                company_id = ?, coverage = ?, category = ?, updated_at = datetime('now')
            WHERE id = ?
          `).bind(
            job.date_scraped,
            job.listing_date,
            job.job_title,
            companyId,
            job.coverage,
            job.job_category,
            existingJob.id
          ).run();
          
          updatedJobs++;
          console.log(`Updated: ${job.job_title} from ${job.company_name}`);
        } else {
          // Insert new job
          await this.db.prepare(`
            INSERT INTO job_listings (
              listing_url, job_title, company_id, category, coverage, 
              job_type, platform, listing_date, date_scraped, status, visible
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1)
          `).bind(
            job.listing_url,
            job.job_title,
            companyId,
            job.job_category,
            job.coverage,
            job.job_type,
            job.platform,
            job.listing_date,
            job.date_scraped
          ).run();
          
          newJobs++;
          console.log(`Created: ${job.job_title} from ${job.company_name}`);
        }

        console.log(`  Listing date: ${job.listing_date}, Platform: ${job.platform}, Coverage: ${job.coverage}`);
        
      } catch (error) {
        console.error(`Error saving job: ${job.job_title} from ${job.company_name}:`, error);
      }
    }

    console.log(`Scraping completed. New jobs: ${newJobs}, Updated jobs: ${updatedJobs}, Total: ${this.jobs.length}`);
  }
}

// Export for use in scripts
export { WeWorkRemotelyScraper };