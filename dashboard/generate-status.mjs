#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const WORKSPACE = resolve(process.env.HOME, '.openclaw/workspace');

// Generate dashboard status JSON from DAILY-OPERATIONS.md
function generateStatus() {
  const now = new Date();
  
  // Parse DAILY-OPERATIONS.md
  const dailyOps = readFileSync(resolve(WORKSPACE, 'DAILY-OPERATIONS.md'), 'utf8');
  
  // Parse queue
  const queue = parseQueue();
  
  // Parse tasks
  const tasks = parseTasks(dailyOps);
  
  // Build needs_boyd list
  const needsBoyd = parseNeedsBoyd(dailyOps);
  
  // Build activity log
  const activityLog = buildActivityLog(tasks);
  
  const status = {
    generated_at: now.toISOString(),
    needs_boyd: needsBoyd,
    content_queue: queue,
    tasks: tasks,
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

function parseTasks(content) {
  const daily = [];
  const weekly = [];
  const monthly = [];
  
  // Parse task tables from DAILY-OPERATIONS.md
  const taskRegex = /\|\s*\*\*(.*?)\*\*\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g;
  let match;
  
  while ((match = taskRegex.exec(content)) !== null) {
    const [_, name, freq, lastExec, hasCron, owner] = match;
    
    if (name === 'Task Name' || !name.trim()) continue; // Skip header
    
    const task = {
      name: name.trim(),
      last_executed: lastExec.includes('NEVER') ? null : parseLastExecuted(lastExec),
      has_cron: hasCron.includes('YES')
    };
    
    if (freq.includes('Daily') || freq.includes('9 AM') || freq.includes('PM')) {
      task.scheduled_time = extractTime(freq);
      task.threshold_hours = 26;
      daily.push(task);
    } else if (freq.includes('Weekly') || freq.includes('Monday') || freq.includes('Friday')) {
      task.scheduled_day = extractDay(freq);
      task.threshold_hours = 168;
      weekly.push(task);
    } else if (freq.includes('Monthly') || freq.includes('First')) {
      task.scheduled_day = extractDay(freq);
      task.threshold_hours = 744;
      monthly.push(task);
    }
  }
  
  return { daily, weekly, monthly };
}

function parseLastExecuted(str) {
  if (!str || str.includes('NEVER')) return null;
  
  // Try to extract ISO date
  const isoMatch = str.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    return new Date(isoMatch[1]).toISOString();
  }
  
  // Try to extract relative time
  const hoursMatch = str.match(/(\d+)h ago/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  }
  
  const daysMatch = str.match(/(\d+)d ago/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  }
  
  return null;
}

function extractTime(str) {
  const match = str.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
  if (match) {
    return match[0].trim();
  }
  return 'daily';
}

function extractDay(str) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (const day of days) {
    if (str.includes(day)) return day;
  }
  if (str.includes('First')) return 'First Monday';
  return 'weekly';
}

function parseNeedsBoyd(content) {
  const needs = [];
  
  // Look for "Needs Boyd" section or similar markers
  const needsSection = content.match(/##.*Needs Boyd.*?\n([\s\S]*?)(?=\n##|$)/i);
  if (needsSection) {
    const lines = needsSection[1].split('\n');
    lines.forEach(line => {
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const item = line.replace(/^[\s\-\*]+/, '').trim();
        if (item && !item.startsWith('#')) {
          needs.push(item);
        }
      }
    });
  }
  
  return needs;
}

function buildActivityLog(tasks) {
  const log = [];
  const allTasks = [...tasks.daily, ...tasks.weekly, ...tasks.monthly];
  
  allTasks
    .filter(t => t.last_executed)
    .sort((a, b) => new Date(b.last_executed) - new Date(a.last_executed))
    .slice(0, 15)
    .forEach(t => {
      log.push({
        task: t.name,
        completed_at: t.last_executed
      });
    });
  
  return log;
}

// Run
generateStatus();
