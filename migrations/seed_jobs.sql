-- Seed sample job data for testing

-- Insert companies
INSERT INTO companies (name, website) VALUES
  ('Acme Technologies', 'https://acme.com'),
  ('Global Innovations Inc', 'https://globalinnovations.com'),
  ('TechCorp Asia', 'https://techcorp.asia'),
  ('Remote First Co', 'https://remotefirst.co'),
  ('Creative Studios', 'https://creativestudios.com');

-- Insert approved jobs
INSERT INTO job_listings (
  listing_url,
  job_title,
  company_id,
  category,
  coverage,
  job_type,
  platform,
  listing_date,
  date_scraped,
  status,
  visible
) VALUES
  (
    'https://weworkremotely.com/remote-jobs/acme-technologies-senior-fullstack-developer',
    'Senior Fullstack Developer',
    1,
    'tech-development',
    'worldwide',
    'remote',
    'WeWorkRemotely',
    date('now', '-2 days'),
    date('now'),
    'approved',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/global-innovations-content-writer',
    'Content Writer (Asia Pacific)',
    2,
    'writing-content',
    'asia',
    'remote',
    'WeWorkRemotely',
    date('now', '-1 day'),
    date('now'),
    'approved',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/techcorp-asia-ui-ux-designer',
    'UI/UX Designer',
    3,
    'design-creative',
    'asia',
    'remote',
    'WeWorkRemotely',
    date('now', '-3 days'),
    date('now'),
    'approved',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/remote-first-customer-support-specialist',
    'Customer Support Specialist',
    4,
    'customer-support',
    'worldwide',
    'remote',
    'WeWorkRemotely',
    date('now', '-5 days'),
    date('now'),
    'approved',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/creative-studios-social-media-manager',
    'Social Media Manager',
    5,
    'marketing-social-media',
    'asia',
    'remote',
    'WeWorkRemotely',
    date('now', '-1 day'),
    date('now'),
    'approved',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/acme-technologies-virtual-assistant',
    'Virtual Assistant',
    1,
    'admin-virtual-assistant',
    'worldwide',
    'remote',
    'WeWorkRemotely',
    date('now', '-4 days'),
    date('now'),
    'approved',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/techcorp-backend-engineer',
    'Backend Engineer (Node.js)',
    3,
    'tech-development',
    'asia',
    'remote',
    'WeWorkRemotely',
    date('now'),
    date('now'),
    'approved',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/global-innovations-technical-writer',
    'Technical Writer',
    2,
    'writing-content',
    'worldwide',
    'remote',
    'WeWorkRemotely',
    date('now', '-6 days'),
    date('now'),
    'approved',
    1
  );

-- Insert some pending jobs for admin to review
INSERT INTO job_listings (
  listing_url,
  job_title,
  company_id,
  category,
  coverage,
  job_type,
  platform,
  listing_date,
  date_scraped,
  status,
  visible
) VALUES
  (
    'https://weworkremotely.com/remote-jobs/new-company-product-manager',
    'Product Manager',
    NULL,
    'other',
    'worldwide',
    'remote',
    'WeWorkRemotely',
    date('now'),
    date('now'),
    'pending',
    1
  ),
  (
    'https://weworkremotely.com/remote-jobs/another-company-data-analyst',
    'Data Analyst',
    NULL,
    'tech-development',
    'asia',
    'remote',
    'WeWorkRemotely',
    date('now'),
    date('now'),
    'pending',
    1
  );
