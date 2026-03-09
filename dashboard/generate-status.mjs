#!/usr/bin/env node
/**
 * Dashboard Status Generator
 * Generates maxi-status.json for the operations dashboard
 * Updated March 9, 2026 - Includes Social Engagement & Observer Protocol
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const WORKSPACE = resolve(process.env.HOME, '.openclaw/workspace');

function generateStatus() {
  const now = new Date();
  
  // Load task registry
  const tasksRegistry = JSON.parse(readFileSync(resolve(WORKSPACE, 'dashboard/tasks-registry.json'), 'utf8'));
  
  // Parse queue
  const queue = parseQueue();
  
  // Build needs_boyd list
  const needsBoyd = parseNeedsBoyd();
  
  // Build activity log
  const activityLog = buildActivityLog(tasksRegistry);
  
  // Get social engagement stats
  const socialEngagement = getSocialEngagementStats();
  
  const status = {
    generated_at: now.toISOString(),
    needs_boyd: needsBoyd,
    content_queue: queue,
    tasks: {
      high_frequency: tasksRegistry.high_frequency || [],
      daily: tasksRegistry.daily || [],
      weekly: tasksRegistry.weekly || [],
      monthly: tasksRegistry.monthly || []
    },
    observer_protocol: tasksRegistry.observer_protocol || {},
    social_engagement: socialEngagement,
    metrics: tasksRegistry.metrics || {},
    activity_log: activityLog
  };
  
  writeFileSync(resolve(WORKSPACE, 'dashboard/maxi-status.json'), JSON.stringify(status, null, 2));
  console.log('✅ Dashboard status updated:', now.toISOString());
}

function parseQueue() {
  try {
    const queueFile = readFileSync(resolve(WORKSPACE, 'maxisuite-queue.json'), 'utf8');
    const queue = JSON.parse(queueFile);
    
    const arcadiabX = queue.filter(p => p.account === '@arcadiabtc' && p.status === 'scheduled').length;
    const maxiX = queue.filter(p => p.account === '@Maxibtc2009' && p.status === 'scheduled').length;
    const maxiNostr = queue.filter(p => p.account === 'Maxi Nostr' && p.status === 'scheduled').length;
    
    return {
      arcadiab_x: { scheduled: arcadiabX, min_threshold: 8, target: 20 },
      arcadiab_linkedin: { scheduled: 0, min_threshold: 3, target: 6 },
      arcadiab_facebook: { scheduled: 0, min_threshold: 3, target: 6 },
      maxi_x: { scheduled: maxiX, min_threshold: 4, target: 10 },
      maxi_nostr: { scheduled: maxiNostr, min_threshold: 4, target: 10 },
      capital_duro: { scheduled: 0, min_threshold: 2, target: 5 }
    };
  } catch (err) {
    console.error('Failed to parse queue:', err);
    return {
      arcadiab_x: { scheduled: 0, min_threshold: 8, target: 20 },
      arcadiab_linkedin: { scheduled: 0, min_threshold: 3, target: 6 },
      arcadiab_facebook: { scheduled: 0, min_threshold: 3, target: 6 },
      maxi_x: { scheduled: 0, min_threshold: 4, target: 10 },
      maxi_nostr: { scheduled: 0, min_threshold: 4, target: 10 },
      capital_duro: { scheduled: 0, min_threshold: 2, target: 5 }
    };
  }
}

function parseNeedsBoyd() {
  const needs = [];
  
  // Check for stale items in various systems
  try {
    // Check OP outreach for blockers
    const outreachLog = resolve(WORKSPACE, 'observer-protocol/outreach-log.json');
    if (existsSync(outreachLog)) {
      const log = JSON.parse(readFileSync(outreachLog, 'utf8'));
      const manualActions = log.b2b?.filter(b => b.status === 'needs_manual');
      if (manualActions && manualActions.length > 0) {
        needs.push(`${manualActions.length} B2B outreach items need manual action (MoonPay form, Discord outreach)`);
      }
    }
    
    // Check for old newsletter drafts not published
    const newsletterDir = resolve(WORKSPACE, 'agentic-terminal-newsletter');
    if (existsSync(newsletterDir)) {
      // This would need more sophisticated checking
      needs.push('Newsletter may need publication - check drafts');
    }
  } catch (err) {
    // Ignore errors
  }
  
  return needs.length > 0 ? needs : ['No items requiring immediate attention'];
}

function getSocialEngagementStats() {
  try {
    // Check queue size
    const queueFile = resolve(WORKSPACE, 'social-engagement/state/nostr-queue.json');
    let opportunitiesInQueue = 0;
    if (existsSync(queueFile)) {
      const queue = JSON.parse(readFileSync(queueFile, 'utf8'));
      opportunitiesInQueue = queue.queue?.length || 0;
    }
    
    // Check drafts
    const draftsFile = resolve(WORKSPACE, 'social-engagement/queue/drafts.json');
    let draftsPending = 0;
    let autoPostsToday = 0;
    if (existsSync(draftsFile)) {
      const drafts = JSON.parse(readFileSync(draftsFile, 'utf8'));
      draftsPending = drafts.filter(d => d.status === 'pending_review').length;
      autoPostsToday = drafts.filter(d => {
        if (d.status !== 'posted' || !d.postedAt) return false;
        const posted = new Date(d.postedAt);
        const today = new Date();
        return posted.toDateString() === today.toDateString();
      }).length;
    }
    
    // Check threads
    const threadsFile = resolve(WORKSPACE, 'social-engagement/state/active-threads.json');
    let threadsMonitored = 0;
    if (existsSync(threadsFile)) {
      const threads = JSON.parse(readFileSync(threadsFile, 'utf8'));
      threadsMonitored = threads.threads?.length || 0;
    }
    
    // Check screenshots
    const screenshotDir = resolve(WORKSPACE, 'social-engagement/screenshots');
    let screenshotsToday = 0;
    if (existsSync(screenshotDir)) {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const files = readFileSync(resolve(screenshotDir), 'utf8');
      // This is simplified - would need proper directory reading
    }
    
    return {
      opportunities_in_queue: opportunitiesInQueue,
      drafts_pending: draftsPending,
      auto_posts_today: autoPostsToday,
      threads_monitored: threadsMonitored,
      last_discovery: null,
      last_drafting: null
    };
  } catch (err) {
    return {
      opportunities_in_queue: 0,
      drafts_pending: 0,
      auto_posts_today: 0,
      threads_monitored: 0
    };
  }
}

function buildActivityLog(tasksRegistry) {
  const log = [];
  const allTasks = [
    ...(tasksRegistry.high_frequency || []),
    ...(tasksRegistry.daily || []),
    ...(tasksRegistry.weekly || []),
    ...(tasksRegistry.monthly || [])
  ];
  
  allTasks
    .filter(t => t.last_executed)
    .sort((a, b) => new Date(b.last_executed) - new Date(a.last_executed))
    .slice(0, 20)
    .forEach(t => {
      log.push({
        task: t.name,
        completed_at: t.last_executed,
        category: t.category || 'general'
      });
    });
  
  return log;
}

// Run
generateStatus();
