#!/usr/bin/env node
/**
 * Hootsuite CSV Bulk Upload Generator
 * Creates CSV files for manual upload to Hootsuite
 * Works on any plan — no API needed
 */
import fs from 'fs';
import path from 'path';

const CSV_DIR = '/home/futurebit/.openclaw/workspace/hootsuite-csv';

// Ensure directory exists
if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
}

/**
 * Generate Hootsuite bulk upload CSV
 * @param {Array} posts - Array of {date, time, message, link, network}
 * @param {string} filename - Output filename
 */
export function generateCSV(posts, filename = 'hootsuite-posts.csv') {
  // Hootsuite CSV format:
  // Date (MM/DD/YYYY), Time (HH:MM), Message, Link, Network, Profile
  const headers = ['Date', 'Time', 'Message', 'Link', 'Network', 'Profile'];
  
  const rows = posts.map(post => {
    const date = post.date || new Date().toLocaleDateString('en-US');
    const time = post.time || '09:00';
    const message = post.message || '';
    const link = post.link || '';
    const network = post.network || 'Twitter'; // Twitter, Facebook, LinkedIn
    const profile = post.profile || ''; // Optional: specific profile name
    
    return [date, time, message, link, network, profile].map(f => 
      // Escape commas and quotes
      f.includes(',') || f.includes('"') ? `"${f.replace(/"/g, '""')}"` : f
    ).join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  const filepath = path.join(CSV_DIR, filename);
  fs.writeFileSync(filepath, csv);
  
  console.log(`✅ CSV created: ${filepath}`);
  console.log(`Posts: ${posts.length}`);
  return filepath;
}

/**
 * Create a single post CSV for immediate upload
 */
export function createSinglePost(message, options = {}) {
  const post = {
    date: options.date || new Date().toLocaleDateString('en-US'),
    time: options.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    message: message,
    link: options.link || '',
    network: options.network || 'Twitter',
    profile: options.profile || ''
  };
  
  return generateCSV([post], `post-${Date.now()}.csv`);
}

/**
 * Schedule multiple posts
 */
export function schedulePosts(posts) {
  return generateCSV(posts, `scheduled-${new Date().toISOString().split('T')[0]}.csv`);
}

// CLI usage
if (process.argv[2]) {
  const message = process.argv[2];
  const network = process.argv[3] || 'Twitter';
  const filepath = createSinglePost(message, { network });
  console.log(`\nUpload this file to Hootsuite:`);
  console.log(`1. Go to https://hootsuite.com/dashboard`);
  console.log(`2. Click Publisher → Bulk Composer`);
  console.log(`3. Upload: ${filepath}`);
  console.log(`4. Select your ${network} profile(s)`);
  console.log(`5. Schedule`);
}
