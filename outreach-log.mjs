#!/usr/bin/env node
/**
 * Outreach Log Manager
 * 
 * Safely appends new entries to outreach-log.json without
 * relying on exact text matching (which fails with whitespace issues)
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_FILE = join(__dirname, 'outreach-log.json');

function loadLog() {
  try {
    const data = readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load outreach log:', e.message);
    process.exit(1);
  }
}

function saveLog(log) {
  try {
    writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to save outreach log:', e.message);
    return false;
  }
}

function addB2BOutreach(company, status, method, url, priority, notes, extra = {}) {
  const log = loadLog();
  
  const entry = {
    company,
    status,
    method,
    url,
    priority,
    notes,
    attemptedAt: new Date().toISOString(),
    ...extra
  };
  
  log.b2bOutreach.push(entry);
  log.lastUpdated = new Date().toISOString();
  
  if (saveLog(log)) {
    console.log(`✅ Added B2B outreach: ${company} (${status})`);
    return true;
  }
  return false;
}

function addIndividualOutreach(target, type, status, method, url, notes, extra = {}) {
  const log = loadLog();
  
  const entry = {
    target,
    type,
    status,
    method,
    url,
    notes,
    attemptedAt: new Date().toISOString(),
    ...extra
  };
  
  log.individualOutreach.push(entry);
  log.lastUpdated = new Date().toISOString();
  
  if (saveLog(log)) {
    console.log(`✅ Added individual outreach: ${target} (${status})`);
    return true;
  }
  return false;
}

function addSessionHistory(date, action, summary, deliverables = [], contactsMade = 0, b2bContacts = 0, individualContacts = 0) {
  const log = loadLog();
  
  const entry = {
    date,
    action,
    summary,
    deliverables,
    contactsMade,
    b2bContacts,
    individualContacts
  };
  
  log.sessionHistory.push(entry);
  log.lastUpdated = new Date().toISOString();
  
  if (saveLog(log)) {
    console.log(`✅ Added session history: ${date} - ${action}`);
    return true;
  }
  return false;
}

function updateDailyGoal(date, individualTarget, individualActual, b2bTarget, b2bActual, reason) {
  const log = loadLog();
  
  log.previousDailyGoalStatus = log.dailyGoalStatus;
  log.dailyGoalStatus = {
    date,
    individualAgentsTarget: individualTarget,
    individualAgentsActual: individualActual,
    b2bTouchpointsTarget: b2bTarget,
    b2bTouchpointsActual: b2bActual,
    reason
  };
  
  log.lastUpdated = new Date().toISOString();
  
  if (saveLog(log)) {
    console.log(`✅ Updated daily goal status for ${date}`);
    return true;
  }
  return false;
}

function updateStats() {
  const log = loadLog();
  
  log.stats = {
    totalB2BTargets: log.b2bOutreach.length,
    totalIndividualTargets: log.individualOutreach.length,
    contactsMade: log.b2bOutreach.filter(e => e.status === 'contacted').length + 
                  log.individualOutreach.filter(e => e.status === 'contacted').length,
    contactsPendingManualSubmission: log.b2bOutreach.filter(e => e.status === 'attempted_needs_manual_completion').length,
    responsesReceived: log.individualOutreach.filter(e => e.responseReceived).length,
    byMethod: {
      nostr_dm: log.individualOutreach.filter(e => e.method === 'nostr_dm').length,
      github_issue: [...log.b2bOutreach, ...log.individualOutreach].filter(e => e.method === 'github_issue').length,
      business_form: log.b2bOutreach.filter(e => e.method === 'business_contact_form').length
    }
  };
  
  log.lastUpdated = new Date().toISOString();
  
  if (saveLog(log)) {
    console.log('✅ Updated stats');
    return true;
  }
  return false;
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'add-b2b': {
    const [company, status, method, url, priority, notes] = process.argv.slice(3);
    if (!company || !status || !method) {
      console.error('Usage: node outreach-log.mjs add-b2b <company> <status> <method> <url> <priority> <notes>');
      process.exit(1);
    }
    addB2BOutreach(company, status, method, url, priority, notes);
    break;
  }
  
  case 'add-individual': {
    const [target, type, status, method, url, notes] = process.argv.slice(3);
    if (!target || !status || !method) {
      console.error('Usage: node outreach-log.mjs add-individual <target> <type> <status> <method> <url> <notes>');
      process.exit(1);
    }
    addIndividualOutreach(target, type, status, method, url, notes);
    break;
  }
  
  case 'add-session': {
    const [date, action, summary] = process.argv.slice(3);
    if (!date || !action) {
      console.error('Usage: node outreach-log.mjs add-session <date> <action> <summary>');
      process.exit(1);
    }
    addSessionHistory(date, action, summary);
    break;
  }
  
  case 'update-goals': {
    const [date, indTarget, indActual, b2bTarget, b2bActual, reason] = process.argv.slice(3);
    updateDailyGoal(date, parseInt(indTarget), parseInt(indActual), parseInt(b2bTarget), parseInt(b2bActual), reason);
    break;
  }
  
  case 'update-stats': {
    updateStats();
    break;
  }
  
  case 'show': {
    const log = loadLog();
    console.log(JSON.stringify(log, null, 2));
    break;
  }
  
  default:
    console.log(`
Outreach Log Manager

Usage:
  node outreach-log.mjs add-b2b <company> <status> <method> <url> <priority> <notes>
  node outreach-log.mjs add-individual <target> <type> <status> <method> <url> <notes>
  node outreach-log.mjs add-session <date> <action> <summary>
  node outreach-log.mjs update-goals <date> <indTarget> <indActual> <b2bTarget> <b2bActual> <reason>
  node outreach-log.mjs update-stats
  node outreach-log.mjs show

Examples:
  node outreach-log.mjs add-b2b "MoonPay" "contacted" "github_issue" "https://github.com/..." "high" "Created issue proposing integration"
  node outreach-log.mjs add-session "2026-03-03" "outreach_execution" "5 contacts made via GitHub"
  node outreach-log.mjs update-goals "2026-03-03" 3 5 1 0 "Exceeded individual target"
`);
}
