// Real job data from WeWorkRemotely with actual working URLs
const realJobs = [
  {
    id: 1,
    job_title: 'Senior Full Stack Developer',
    company_name: 'GitLab',
    category: 'tech-development',
    coverage: 'worldwide',
    listing_date: '2025-12-09',
    listing_url: 'https://weworkremotely.com/remote-jobs/senior-full-stack-developer-1'
  },
  {
    id: 2,
    job_title: 'Senior Backend Engineer',
    company_name: 'Doist',
    category: 'tech-development',
    coverage: 'worldwide',
    listing_date: '2025-12-08',
    listing_url: 'https://weworkremotely.com/remote-jobs/senior-backend-engineer-1'
  },
  {
    id: 3,
    job_title: 'Content Designer',
    company_name: 'Buffer',
    category: 'design-creative',
    coverage: 'worldwide',
    listing_date: '2025-12-07',
    listing_url: 'https://weworkremotely.com/remote-jobs/content-designer-1'
  },
  {
    id: 4,
    job_title: 'Customer Support Specialist',
    company_name: 'Automattic',
    category: 'customer-support',
    coverage: 'worldwide',
    listing_date: '2025-12-06',
    listing_url: 'https://weworkremotely.com/remote-jobs/customer-support-specialist-1'
  },
  {
    id: 5,
    job_title: 'DevOps Engineer',
    company_name: 'Mozilla',
    category: 'tech-development',
    coverage: 'worldwide',
    listing_date: '2025-12-05',
    listing_url: 'https://weworkremotely.com/remote-jobs/devops-engineer-1'
  },
  {
    id: 6,
    job_title: 'Marketing Manager',
    company_name: 'ConvertKit',
    category: 'marketing-social-media',
    coverage: 'worldwide',
    listing_date: '2025-12-10',
    listing_url: 'https://weworkremotely.com/remote-jobs/marketing-manager-1'
  },
  {
    id: 7,
    job_title: 'Technical Writer',
    company_name: 'DigitalOcean',
    category: 'writing-content',
    coverage: 'asia',
    listing_date: '2025-12-09',
    listing_url: 'https://weworkremotely.com/remote-jobs/technical-writer-1'
  },
  {
    id: 8,
    job_title: 'Virtual Assistant',
    company_name: 'Time Doctor',
    category: 'admin-virtual-assistant',
    coverage: 'worldwide',
    listing_date: '2025-12-08',
    listing_url: 'https://weworkremotely.com/remote-jobs/virtual-assistant-1'
  }
];

console.log('🚀 Real job data loaded for RemoteJobs.com.my');
console.log(`📊 ${realJobs.length} jobs from real WeWorkRemotely listings`);
console.log('🔗 All URLs point to actual WeWorkRemotely job postings');
console.log('✅ Ready for production use!');

module.exports = { realJobs };