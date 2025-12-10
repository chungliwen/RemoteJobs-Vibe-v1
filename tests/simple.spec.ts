import { test, expect } from '@playwright/test';

test('basic homepage test', async ({ page }) => {
  console.log('Starting test...');
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Enable network logging
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`HTTP ${response.status()}: ${response.url()}`);
    }
  });

  try {
    await page.goto('http://localhost:4321/', { timeout: 10000 });
    console.log('Page loaded successfully');
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check if any content is visible
    const body = await page.locator('body').textContent();
    console.log(`Body content length: ${body?.length || 0}`);
    
    if (body && body.length > 0) {
      console.log('✅ Homepage has content');
    } else {
      console.log('❌ Homepage appears to be empty');
    }
    
  } catch (error) {
    console.log(`❌ Error loading page: ${error}`);
  }
});