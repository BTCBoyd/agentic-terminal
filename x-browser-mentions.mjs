#!/usr/bin/env node
/**
 * X Browser-based Mention Monitor
 * Uses Playwright to check mentions via web UI (no API needed)
 */

import { chromium } from 'playwright';
import fs from 'fs';

const COOKIES_FILE = '/home/futurebit/.openclaw/workspace/.x-cookies-maxibtc.json';
const LOG_FILE = '/home/futurebit/.openclaw/workspace/x-browser-mentions.json';

async function checkMentions() {
  console.log('🔍 Checking X mentions via browser...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Load cookies if they exist
  if (fs.existsSync(COOKIES_FILE)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf8'));
    await context.addCookies(cookies);
    console.log('✅ Loaded existing cookies');
  } else {
    console.log('⚠️  No cookies found — need to log in manually first');
    await browser.close();
    return;
  }
  
  const page = await context.newPage();
  
  try {
    // Go to notifications/mentions
    await page.goto('https://x.com/notifications/mentions', { waitUntil: 'networkidle' });
    
    // Wait for mentions to load
    await page.waitForTimeout(3000);
    
    // Extract mention data
    const mentions = await page.evaluate(() => {
      const items = [];
      const tweets = document.querySelectorAll('[data-testid="cellInnerDiv"]');
      
      tweets.forEach((tweet, index) => {
        if (index > 10) return; // Limit to 10
        
        const userEl = tweet.querySelector('[data-testid="User-Name"] a');
        const textEl = tweet.querySelector('[data-testid="tweetText"]');
        const timeEl = tweet.querySelector('time');
        
        if (userEl && textEl) {
          items.push({
            username: userEl.textContent.trim().split('\n')[0],
            handle: userEl.getAttribute('href')?.replace('/', '') || 'unknown',
            text: textEl.textContent.trim(),
            time: timeEl?.getAttribute('datetime') || 'unknown',
            id: `mention-${Date.now()}-${index}`
          });
        }
      });
      
      return items;
    });
    
    console.log(`✅ Found ${mentions.length} mentions\n`);
    
    // Load existing log
    let existing = [];
    if (fs.existsSync(LOG_FILE)) {
      existing = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')).mentions || [];
    }
    
    // Filter for new mentions
    const existingTexts = new Set(existing.map(m => m.text));
    const newMentions = mentions.filter(m => !existingTexts.has(m.text));
    
    if (newMentions.length > 0) {
      console.log('🆕 NEW MENTIONS:');
      newMentions.forEach((m, i) => {
        console.log(`\n${i + 1}. @${m.handle} (${m.username})`);
        console.log(`   Time: ${m.time}`);
        console.log(`   Text: ${m.text}`);
      });
      
      // Save updated log
      const allMentions = [...newMentions, ...existing].slice(0, 100);
      fs.writeFileSync(LOG_FILE, JSON.stringify({ 
        lastCheck: new Date().toISOString(),
        mentions: allMentions 
      }, null, 2));
      
      console.log(`\n💾 Saved to ${LOG_FILE}`);
    } else {
      console.log('✨ No new mentions');
    }
    
    // Save cookies for next time
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (process.argv[1].endsWith('x-browser-mentions.mjs')) {
  checkMentions();
}

export { checkMentions };
