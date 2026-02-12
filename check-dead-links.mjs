#!/usr/bin/env node
/**
 * Dead Link Checker for capitalduro.mx and aprenderbitcoin.mx
 * Crawls HTML files and checks all internal links
 */

import { readFile, readdir } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

const siteDirs = [
  '/home/futurebit/.openclaw/workspace/capitalduro-mx',
  '/home/futurebit/.openclaw/workspace/aprenderbitcoin-mx'
];

async function checkDeadLinks(siteDir) {
  console.log(`\n🔍 Checking ${basename(siteDir)}...`);
  
  const files = await readdir(siteDir);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  
  let totalLinks = 0;
  let deadLinks = 0;
  const brokenLinks = [];
  
  for (const file of htmlFiles) {
    const content = await readFile(join(siteDir, file), 'utf-8');
    
    // Extract all href links
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    
    while ((match = hrefRegex.exec(content)) !== null) {
      const link = match[1];
      
      // Skip external links, anchors, mailto, and links with anchors
      if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:') || link === '/' || link.includes('#')) {
        continue;
      }
      
      totalLinks++;
      
      // Normalize link (remove leading slash, add .html if needed)
      let checkPath = link.replace(/^\//, '');
      
      // If it's a directory-style link, try index.html
      if (!checkPath.includes('.')) {
        checkPath = checkPath + '.html';
      }
      
      const fullPath = join(siteDir, checkPath);
      
      if (!existsSync(fullPath)) {
        deadLinks++;
        brokenLinks.push({
          file,
          link,
          expectedPath: checkPath
        });
      }
    }
  }
  
  console.log(`📊 Total internal links: ${totalLinks}`);
  console.log(`❌ Dead links found: ${deadLinks}`);
  
  if (brokenLinks.length > 0) {
    console.log('\n🚨 BROKEN LINKS:');
    brokenLinks.forEach(({ file, link, expectedPath }) => {
      console.log(`  ${file} → ${link}`);
      console.log(`    Expected: ${expectedPath}`);
    });
  } else {
    console.log('✅ No dead links found!');
  }
  
  return deadLinks;
}

async function main() {
  console.log('🔗 Dead Link Checker');
  console.log('=' .repeat(50));
  
  let totalDead = 0;
  
  for (const dir of siteDirs) {
    if (existsSync(dir)) {
      const dead = await checkDeadLinks(dir);
      totalDead += dead;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 TOTAL DEAD LINKS ACROSS ALL SITES: ${totalDead}`);
  
  if (totalDead > 0) {
    console.log('⚠️  ACTION REQUIRED: Fix broken links');
    process.exit(1);
  } else {
    console.log('✅ All links are healthy!');
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
