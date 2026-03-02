import { chromium } from 'playwright';

const BROWSER_EXEC = '/media/nvme/playwright-browsers/chromium-1208/chrome-linux/chrome';
const USER_DATA_DIR = '/home/futurebit/.openclaw/browser/openclaw/user-data';
const EMAIL = 'boyd@arcadiab.com';

(async () => {
  console.log('Launching browser with openclaw profile...');

  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    executablePath: BROWSER_EXEC,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log('Navigating to Substack sign-in page...');
  await page.goto('https://substack.com/sign-in', { waitUntil: 'networkidle' });

  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());

  // Take a screenshot to see the current state
  await page.screenshot({ path: '/tmp/substack-signin-initial.png' });
  console.log('Screenshot saved to /tmp/substack-signin-initial.png');

  // Check if already logged in
  const content = await page.content();
  if (content.includes('Sign out') || content.includes('Dashboard') || page.url().includes('dashboard')) {
    console.log('STATUS: Already logged in!');
    console.log('LOGGED_IN: true');
  } else {
    console.log('STATUS: Not logged in, need to request magic link');
    console.log('LOGGED_IN: false');

    // Try to find and fill email field
    try {
      // Look for email input
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="Email" i]',
      ];

      let emailInput = null;
      for (const sel of emailSelectors) {
        try {
          emailInput = await page.waitForSelector(sel, { timeout: 3000 });
          if (emailInput) {
            console.log(`Found email input with selector: ${sel}`);
            break;
          }
        } catch (e) {
          // continue
        }
      }

      if (emailInput) {
        await emailInput.fill(EMAIL);
        console.log(`Filled email: ${EMAIL}`);
        await page.screenshot({ path: '/tmp/substack-email-filled.png' });

        // Try to find continue/sign-in button
        const buttonSelectors = [
          'button[type="submit"]',
          'button:has-text("Continue")',
          'button:has-text("Sign in")',
          'button:has-text("Send")',
          'button:has-text("Get link")',
        ];

        let btn = null;
        for (const sel of buttonSelectors) {
          try {
            btn = await page.$(sel);
            if (btn) {
              console.log(`Found button with selector: ${sel}`);
              break;
            }
          } catch (e) {
            // continue
          }
        }

        if (btn) {
          await btn.click();
          console.log('Clicked sign-in button');
          await page.waitForTimeout(3000);
          await page.screenshot({ path: '/tmp/substack-after-submit.png' });
          console.log('Screenshot after submit saved');
          console.log('Current URL after submit:', page.url());
          const afterContent = await page.content();
          if (afterContent.includes('magic link') || afterContent.includes('check your email') || afterContent.includes('sent')) {
            console.log('MAGIC_LINK_REQUESTED: true - Check boyd@arcadiab.com for magic link');
          } else {
            console.log('MAGIC_LINK_REQUESTED: unknown - check screenshot');
          }
        } else {
          console.log('ERROR: Could not find submit button');
          console.log('Page HTML (first 2000 chars):', content.substring(0, 2000));
        }
      } else {
        console.log('ERROR: Could not find email input');
        console.log('Page HTML (first 3000 chars):', content.substring(0, 3000));
      }
    } catch (err) {
      console.log('ERROR during form interaction:', err.message);
    }
  }

  await browser.close();
  console.log('Browser closed');
})();
