# we_work_remotely_scraper.rb
require 'nokogiri'
require 'httparty'
require 'logger'

class WeWorkRemotelyScraper
  BASE_URL = 'https://weworkremotely.com'
  MAX_LISTINGS = 3 # WWR seems to display max 50 listings per page

  def initialize(max_listings: MAX_LISTINGS)
    @max_listings = max_listings
    @platform = 'WeWorkRemotely'
    @jobs = []
    @urls = [
      "#{BASE_URL}/100-percent-remote-jobs",
      "#{BASE_URL}/remote-asia-jobs"
    ]
    @logger = Logger.new(STDOUT)
    @logger.level = Logger::INFO
  end

  def scrape
    @logger.info("Starting to scrape listings from WeWorkRemotely")
    @urls.each do |url|
      fetch_jobs(url)
      break if @jobs.size >= @max_listings
    end
    
    @logger.info("Finished scraping. Total listings processed: #{@jobs.size}")
    @jobs
  rescue StandardError => e
    @logger.error("An error occurred in scrape: #{e.message}")
    @logger.error(e.backtrace.join("\n"))
    []
  end

  private

  def fetch_jobs(start_url)
    url = start_url
    
    loop do
      @logger.info("Fetching page: #{url}")
      response = HTTParty.get(url)
      parsed_page = Nokogiri::HTML(response.body)
      job_listings = parsed_page.css('li.feature, li[class=""]')
      
      process_listings(job_listings)
      
      break if @jobs.size >= @max_listings
      next_page_link = parsed_page.at_css('a[rel=next]')
      break unless next_page_link
      url = BASE_URL + next_page_link['href']
    end
  end

  def process_listings(job_listings)
    job_listings.each do |job|
      break if @jobs.size >= @max_listings
      
      processed_job = process_job(job)
      @jobs << processed_job if processed_job
    end
  end

  def process_job(job)
    job_url_element = job.css('a').find { |a| a['href']&.start_with?('/remote-jobs/') }
    return nil unless job_url_element
    job_title = job.css('span.title').text.strip
    company_name = job.css('span.company').first.text.strip
    tags = job.css('.region.company').text.strip
    listing_date = extract_listing_date(job)
    
    {
      listing_url: BASE_URL + job_url_element['href'],
      job_title: job_title,
      company_name: company_name,
      date_scraped: Date.today,
      listing_date: listing_date,
      active: true,  # Set as true by default when scraped
      coverage: determine_coverage(tags),
      job_type: 'Remote', # All jobs from WeWorkRemotely are fully remote from what I see. There is no hybrid.
      job_category: '',
      approval: 'New',
      review: 'None',
      platform: @platform
    }
  end

  def determine_coverage(tags)
    if tags.include?('Malaysia')
      'Malaysia'
    elsif tags.include?('Asia')
      'Asia'
    elsif tags.include?('Anywhere in the World')
      'Worldwide'
    else
      'Other'
    end
  end

  def extract_listing_date(job)
    date_element = job.at_css('.listing-date__date')
    return nil unless date_element
    date_text = date_element.text.strip
    today = Date.today
    case date_text
    when /(\d+)h/
      today
    when /(\d+)d/
      days_ago = $1.to_i
      today - days_ago
    else
      @logger.warn("Unable to parse date: #{date_text}")
      nil
    end
  end
end