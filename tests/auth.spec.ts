import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('complete magic link authentication flow', async ({ page, context }) => {
    // Enable console logging to catch any JavaScript errors
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Enable network logging
    const networkRequests: any[] = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    });

    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/RemoteJobs/);
    console.log('✅ Homepage loaded successfully');

    // Step 2: Navigate to login page
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('.auth-card h1')).toContainText('Login');
    console.log('✅ Navigated to login page');

    // Step 3: Fill in email field
    const testEmail = 'test@example.com';
    await page.fill('#email', testEmail);
    await expect(page.locator('#email')).toHaveValue(testEmail);
    console.log('✅ Email field filled with:', testEmail);

    // Step 4: Click "Send Magic Link" button
    const loginBtn = page.locator('#loginBtn');
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();
    console.log('✅ Clicked "Send Magic Link" button');

    // Wait for button state change
    await expect(loginBtn).toHaveText('Sending...');
    console.log('✅ Button state changed to "Sending..."');

    // Step 5: Check API response and magic link generation
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/auth/login') && response.status() === 200
    );
    
    const responseData = await response.json();
    console.log('📡 API Response:', responseData);

    // Verify response structure
    expect(responseData).toHaveProperty('message');
    expect(responseData).toHaveProperty('link');
    expect(responseData.link).toContain('http://localhost:4321/api/auth/verify?token=');
    
    const magicLink = responseData.link;
    console.log('✅ Magic link generated:', magicLink);

    // Check success message display
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toBeVisible();
    await expect(messageDiv).toHaveClass(/success/);
    await expect(messageDiv).toContainText('Magic link sent!');
    console.log('✅ Success message displayed to user');

    // Step 6: Visit the magic link URL
    // The API should now return the correct URL with /api/auth/verify
    console.log('🔗 Visiting magic link:', magicLink);

    // Visit magic link in a new context to test session handling
    const page2 = await context.newPage();
    await page2.goto(magicLink);

    // Step 7: Check verification and redirect behavior
    // Should redirect to dashboard
    await page2.waitForURL('/dashboard');
    await expect(page2).toHaveURL('/dashboard');
    console.log('✅ Redirected to dashboard after verification');

    // Check if session cookie is set
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'session_token');
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie!.httpOnly).toBe(true);
    expect(sessionCookie!.sameSite).toBe('Lax');
    console.log('✅ Session cookie set correctly:', {
      name: sessionCookie?.name,
      httpOnly: sessionCookie?.httpOnly,
      sameSite: sessionCookie?.sameSite,
      secure: sessionCookie?.secure
    });

    // Verify we're actually logged in by checking dashboard content
    await expect(page2.locator('main h1').first()).toContainText('Dashboard');
    console.log('✅ Dashboard content loaded - user is authenticated');

    // Check for any JavaScript errors
    const errors = consoleMessages.filter(msg => msg.includes('[error]') || msg.includes('[warning]'));
    if (errors.length > 0) {
      console.log('⚠️ Console errors/warnings found:', errors);
    } else {
      console.log('✅ No JavaScript errors or warnings detected');
    }

    // Log network requests for debugging
    console.log('📊 Network requests summary:');
    networkRequests.forEach(req => {
      if (req.status) {
        console.log(`  ${req.method || 'GET'} ${req.url} -> ${req.status} ${req.statusText}`);
      }
    });

    // Test session persistence by visiting dashboard directly
    await page2.goto('/dashboard');
    await expect(page2).toHaveURL('/dashboard');
    console.log('✅ Session persists when visiting dashboard directly');

    await page2.close();
  });

  test('handle invalid magic link', async ({ page }) => {
    // Test with invalid token
    await page.goto('/api/auth/verify?token=invalid-token');
    
    // Should show error message
    await expect(page.locator('body')).toContainText('Invalid or expired magic link');
    console.log('✅ Invalid token handled correctly');
  });

  test('handle missing token', async ({ page }) => {
    // Test with missing token
    await page.goto('/api/auth/verify');
    
    // Should show error message
    await expect(page.locator('body')).toContainText('Invalid magic link');
    console.log('✅ Missing token handled correctly');
  });

  test('form validation', async ({ page }) => {
    await page.goto('/login');
    
    // Try submitting empty form
    await page.click('#loginBtn');
    
    // HTML5 validation should prevent submission
    await expect(page.locator('#email')).toBeFocused();
    console.log('✅ Form validation works for empty email');
  });

  test('network error handling', async ({ page }) => {
    await page.goto('/login');
    
    // Mock network failure
    await page.route('/api/auth/login', route => route.abort());
    
    await page.fill('#email', 'test@example.com');
    await page.click('#loginBtn');
    
    // Should show network error message
    const messageDiv = page.locator('#message');
    await expect(messageDiv).toBeVisible();
    await expect(messageDiv).toHaveClass(/error/);
    await expect(messageDiv).toContainText('Network error');
    console.log('✅ Network error handled correctly');
  });
});