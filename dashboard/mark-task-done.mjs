#!/usr/bin/env node
/**
 * mark-task-done.mjs
 * 
 * Updates tasks-registry.json with the current timestamp for a given task.
 * Call this at the end of every task to keep the dashboard accurate.
 * 
 * Usage:
 *   node dashboard/mark-task-done.mjs "Task Name"
 *   node dashboard/mark-task-done.mjs "Moltbook Morning Session"
 *   node dashboard/mark-task-done.mjs "ArcadiaB Daily Content Production"
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const WORKSPACE = resolve(process.env.HOME, '.openclaw/workspace');
const REGISTRY_PATH = resolve(WORKSPACE, 'dashboard/tasks-registry.json');

const taskName = process.argv[2];

if (!taskName) {
  console.error('Usage: node mark-task-done.mjs "Task Name"');
  console.error('\nAvailable tasks:');
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  const allTasks = [...registry.daily, ...registry.weekly, ...registry.monthly];
  allTasks.forEach(t => console.error(`  - ${t.name}`));
  process.exit(1);
}

try {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  const now = new Date().toISOString();
  let found = false;

  for (const category of ['daily', 'weekly', 'monthly']) {
    for (const task of registry[category]) {
      // Flexible match: exact or case-insensitive contains
      if (
        task.name.toLowerCase() === taskName.toLowerCase() ||
        task.name.toLowerCase().includes(taskName.toLowerCase()) ||
        taskName.toLowerCase().includes(task.name.toLowerCase().split(' ').slice(0, 3).join(' '))
      ) {
        task.last_executed = now;
        found = true;
        console.log(`✅ Marked done: "${task.name}" at ${now}`);
      }
    }
  }

  if (!found) {
    console.error(`❌ Task not found: "${taskName}"`);
    console.error('Available tasks:');
    const allTasks = [...registry.daily, ...registry.weekly, ...registry.monthly];
    allTasks.forEach(t => console.error(`  - ${t.name}`));
    process.exit(1);
  }

  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log('📊 Registry updated.');

  // Auto-regenerate dashboard
  const { execSync } = await import('child_process');
  execSync(`node ${resolve(WORKSPACE, 'dashboard/generate-status.mjs')}`, { stdio: 'inherit' });

} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
