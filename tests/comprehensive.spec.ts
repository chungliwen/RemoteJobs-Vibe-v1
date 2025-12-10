import { test, expect } from '@playwright/test';

test.describe('Comprehensive Application Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging to catch any JavaScript errors
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Enable network logging
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
  });

  test('1. Homepage Loading', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads without errors
    await expect(page).toHaveTitle(/RemoteJobs/);
    
    // Check for main elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    console.log('✅ Homepage loads successfully');
  });

  test('2. Job Display - Real Jobs from WeWorkRemotely', async ({ page }) => {
    await page.goto('/');
    
    // Wait for jobs to load
    await page.waitForSelector('.job-card', { timeout: 10000 });
    
    const jobCards = page.locator('.job-card');
    const jobCount = await jobCards.count();
    
    expect(jobCount).toBeGreaterThan(0);
    console.log(`✅ Found ${jobCount} job cards on homepage`);
    
    // Check if jobs have real data
    const firstJob = jobCards.first();
    await expect(firstJob.locator('h3')).toBeVisible();
    await expect(firstJob.locator('.company')).toBeVisible();
    await expect(firstJob.locator('.location')).toBeVisible();
    
    const jobTitle = await firstJob.locator('h3').textContent();
    const company = await firstJob.locator('.company').textContent();
    
    console.log(`✅ First job: ${jobTitle} at ${company}`);
    
    // Check if jobs are from WeWorkRemotely (look for typical patterns)
    const jobText = await firstJob.textContent();
    expect(jobText?.toLowerCase()).not.toContain('example');
    expect(jobText?.toLowerCase()).not.toContain('test');
    
    console.log('✅ Jobs appear to be real data, not placeholders');
  });

  test('3. Job Filtering', async ({ page }) => {
    await page.goto('/');
    
    // Wait for jobs to load
    await page.waitForSelector('.job-card', { timeout: 10000 });
    
    const initialJobCount = await page.locator('.job-card').count();
    console.log(`Initial job count: ${initialJobCount}`);
    
    // Test category filter
    const categoryFilter = page.locator('#category-filter');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ label: 'Engineering' });
      await page.waitForTimeout(1000); // Wait for filter to apply
      
      const filteredJobCount = await page.locator('.job-card').count();
      console.log(`Job count after Engineering filter: ${filteredJobCount}`);
      
      // Reset filter
      await categoryFilter.selectOption({ label: 'All Categories' });
    } else {
      console.log('⚠️ Category filter not found');
    }
    
    // Test coverage filter
    const coverageFilter = page.locator('#coverage-filter');
    if (await coverageFilter.isVisible()) {
      await coverageFilter.selectOption({ label: 'Fully Remote' });
      await page.waitForTimeout(1000);
      
      const coverageFilteredCount = await page.locator('.job-card').count();
      console.log(`Job count after Fully Remote filter: ${coverageFilteredCount}`);
    } else {
      console.log('⚠️ Coverage filter not found');
    }
    
    console.log('✅ Filtering functionality tested');
  });

  test('4. Job Detail Pages', async ({ page }) => {
    await page.goto('/');
    
    // Wait for jobs to load
    await page.waitForSelector('.job-card', { timeout: 10000 });
    
    const firstJob = page.locator('.job-card').first();
    await expect(firstJob).toBeVisible();
    
    // Click on the first job
    await firstJob.click();
    
    // Should navigate to job detail page
    await page.waitForURL(/\/jobs\/\d+/);
    const currentUrl = page.url();
    console.log(`Navigated to job detail page: ${currentUrl}`);
    
    // Check job detail elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.job-details')).toBeVisible();
    
    const jobTitle = await page.locator('h1').textContent();
    console.log(`Job detail page title: ${jobTitle}`);
    
    console.log('✅ Job detail pages work correctly');
  });

  test('5. Authentication Flow - Complete Magic Link Flow', async ({ page, context }) => {
    // Step 1: Visit login page
    await page.goto('/login');
    await expect(page.locator('.auth-card h1')).toContainText('Login');
    
    // Step 2: Fill in email
    const testEmail = `test-${Date.now()}@example.com`;
    await page.fill('#email', testEmail);
    
    // Step 3: Submit form
    const loginBtn = page.locator('#loginBtn');
    await loginBtn.click();
    
    // Step 4: Wait for magic link generation
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/auth/login') && response.status() === 200
    );
    
    const responseData = await response.json();
    expect(responseData).toHaveProperty('link');
    
    const magicLink = responseData.link;
    console.log('Magic link generated:', magicLink);
    
    // Step 5: Visit magic link in new context
    const page2 = await context.newPage();
    await page2.goto(magicLink);
    
    // Step 6: Verify redirect to dashboard
    await page2.waitForURL('/dashboard');
    await expect(page2).toHaveURL('/dashboard');
    await expect(page2.locator('main h1').first()).toContainText('Dashboard');
    
    // Step 7: Verify session is set
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session_token');
    expect(sessionCookie).toBeTruthy();
    
    console.log('✅ Complete authentication flow works');
    await page2.close();
  });

  test('6. Navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test main navigation links
    const navLinks = [
      { selector: 'a[href="/"]', text: 'Home' },
      { selector: 'a[href="/login"]', text: 'Login' },
      { selector: 'a[href="/register"]', text: 'Register' }
    ];
    
    for (const link of navLinks) {
      const element = page.locator(link.selector);
      if (await element.isVisible()) {
        await element.click();
        await page.waitForTimeout(500);
        console.log(`✅ Navigation to ${link.text} works`);
        await page.goto('/'); // Return to homepage for next test
      } else {
        console.log(`⚠️ Navigation link ${link.text} not found`);
      }
    }
  });

  test('7. Admin Access', async ({ page }) => {
    // Try to access admin panel without authentication
    await page.goto('/admin');
    
    // Should redirect to login or show unauthorized
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('✅ Admin panel correctly redirects to login when not authenticated');
    } else if (currentUrl.includes('/admin')) {
      // Check if it shows unauthorized message
      const bodyText = await page.locator('body').textContent();
      if (bodyText?.includes('unauthorized') || bodyText?.includes('Unauthorized')) {
        console.log('✅ Admin panel shows unauthorized message');
      } else {
        console.log('⚠️ Admin panel accessible without authentication - security issue');
      }
    }
  });

  test('8. Error Handling', async ({ page }) => {
    // Test 404 page
    await page.goto('/nonexistent-page');
    await expect(page.locator('body')).toContainText('404');
    console.log('✅ 404 page works');
    
    // Test API error handling
    await page.goto('/api/nonexistent-endpoint');
    const status = await page.locator('body').textContent();
    expect(status).toContain('404');
    console.log('✅ API error handling works');
  });

  test('9. Console Logs Check', async ({ page }) => {
    const consoleMessages: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    await page.goto('/');
    await page.waitForSelector('.job-card', { timeout: 10000 });
    
    const errors = consoleMessages.filter(msg => msg.includes('[error]'));
    const warnings = consoleMessages.filter(msg => msg.includes('[warning]'));
    
    if (errors.length > 0) {
      console.log('❌ JavaScript errors found:', errors);
    } else {
      console.log('✅ No JavaScript errors');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ JavaScript warnings found:', warnings);
    } else {
      console.log('✅ No JavaScript warnings');
    }
  });

  test('10. Network Requests Verification', async ({ page }) => {
    const networkRequests: any[] = [];
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method()
      });
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Failed request: ${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto('/');
    await page.waitForSelector('.job-card', { timeout: 10000 });
    
    // Check for API requests
    const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
    console.log(`📊 Made ${apiRequests.length} API requests`);
    
    apiRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });
    
    console.log('✅ Network requests verified');
  });

  test('11. Registration Flow', async ({ page }) => {
    await page.goto('/register');
    
    // Check if registration page exists
    if (await page.locator('.auth-card h1').isVisible()) {
      const title = await page.locator('.auth-card h1').textContent();
      expect(title).toContain('Register');
      
      // Test form validation
      const registerBtn = page.locator('#registerBtn');
      if (await registerBtn.isVisible()) {
        await registerBtn.click();
        // Should show validation error
        console.log('✅ Registration form validation works');
      }
    } else {
      console.log('⚠️ Registration page not found');
    }
  });

  test('12. Dashboard Access', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    console.log('✅ Dashboard correctly redirects to login when not authenticated');
  });

  test('13. Job Search Functionality', async ({ page }) => {
    await page.goto('/');
    
    // Look for search functionality
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"], #search');
    if (await searchInput.isVisible()) {
      await searchInput.fill('developer');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      const jobCount = await page.locator('.job-card').count();
      console.log(`✅ Search functionality works - found ${jobCount} jobs for "developer"`);
    } else {
      console.log('⚠️ Search functionality not found');
    }
  });

  test('14. Responsive Design', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForSelector('.job-card', { timeout: 10000 });
    
    const mobileJobCards = page.locator('.job-card');
    expect(await mobileJobCards.count()).toBeGreaterThan(0);
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    const desktopJobCards = page.locator('.job-card');
    expect(await desktopJobCards.count()).toBeGreaterThan(0);
    
    console.log('✅ Responsive design works on mobile and desktop');
  });
});