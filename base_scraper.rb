# base_scraper.rb

require 'active_record'
require 'logger'

class BaseScraper
  attr_reader :logger

  def initialize(max_listings: nil, platform: nil)
    @max_listings = max_listings
    @platform = platform
    @logger = Logger.new(STDOUT)
    @logger.level = Logger::INFO
  end

  def scrape
    raise NotImplementedError, "#{self.class} has not implemented method '#{__method__}'"
  end

  protected

  def fetch_jobs
    raise NotImplementedError, "#{self.class} has not implemented method '#{__method__}'"
  end

  def process_job(job)
    raise NotImplementedError, "#{self.class} has not implemented method '#{__method__}'"
  end

  def save_listings_to_database(jobs)
    new_jobs = 0
    updated_jobs = 0

    jobs.each do |job|
      begin
        job_listing = JobListing.find_or_initialize_by(listing_url: job[:listing_url])

        if job_listing.new_record?
          new_jobs += 1
        else
          updated_jobs += 1
        end

        # Find or create the company
        company = Company.find_or_create_by!(name: job[:company_name]) if job[:company_name]

        job_listing.assign_attributes(
          date_scraped: Date.today,
          listing_date: job[:listing_date],
          job_title: job[:job_title],
          company_id: company.id,  # Set company_id if company exists
          active: true,
          coverage: job[:coverage],
          platform: job[:platform],
          job_type: job[:job_type],
          job_category: job[:job_category],
          generated_on: nil,
          approval: job[:approval],
          review: job[:review],
          archive: false,
        )

        if job_listing.save
          @logger.info("#{job_listing.new_record? ? 'Created' : 'Updated'}: #{job_listing.job_title} from #{company&.name || 'Unknown Company'}")
          @logger.info("  Listing date: #{job_listing.listing_date}, Platform: #{job_listing.platform}, Coverage: #{job_listing.coverage}")
        else
          @logger.error("Failed to save job: #{job[:job_title]} from #{company&.name || 'Unknown Company'}. Error: #{job_listing.errors.full_messages.join(', ')}")
        end
      rescue StandardError => e
        @logger.error("Unexpected error while saving job: #{job[:job_title]} from #{job[:company_name]}. Error: #{e.message}")
      end
    end

    @logger.info("Scraping completed. New jobs: #{new_jobs}, Updated jobs: #{updated_jobs}, Total: #{jobs.size}")
  end

  def save_to_json(data, filename = 'job_listings.json')
    File.write(filename, JSON.pretty_generate(data))
    @logger.info("Saved job listings to #{filename}")
  end

  def limit_jobs(jobs, limit = @max_listings)
    return jobs unless limit
    jobs.take(limit)
  end

  def log_progress(current, total)
    @logger.info("Progress: #{current}/#{total} jobs processed")
  end
end