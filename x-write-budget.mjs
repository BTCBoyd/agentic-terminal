#!/usr/bin/env node
/**
 * x-write-budget.mjs — Daily X write budget manager
 *
 * X pay-as-you-go limit: 17 writes per 24 hours per user account.
 *
 * PRIORITY TIERS (enforced — lower tiers only write if budget remains):
 *
 *   TIER 1 — RESERVED (4 writes/day): High-signal replies
 *     - Elizabeth Stark, Lightning Labs, a16z, Coinbase, major Bitcoin accounts
 *     - Threads where Boyd is tagged by influential accounts
 *     - Never burned by automated monitors
 *
 *   TIER 2 — HIGH (5 writes/day): Organic engagement
 *     - Replies to genuine questions about L402/Observer Protocol/AT
 *     - Threads with >100 likes where we add real value
 *
 *   TIER 3 — NORMAL (5 writes/day): Routine conversation monitor
 *     - X Conversation Monitor replies (capped at 2/session max, not 3)
 *
 *   TIER 4 — LOW (remaining): Automated/bulk
 *     - Anything else
 *
 * Total budgeted: 14/17 (3 buffer for safety)
 *
 * Usage:
 *   import { canWrite, recordWrite, getBudgetStatus } from './x-write-budget.mjs';
 *
 *   if (await canWrite('normal')) {
 *     await postReply(...);
 *     await recordWrite('normal', 'replied to @xyz about L402');
 *   }
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const STATE_FILE = resolve(process.env.HOME, '.openclaw/workspace/.x-write-budget.json');

const DAILY_LIMIT = 17;
const BUFFER = 3; // Never use last 3 — keep for emergencies
const USABLE_LIMIT = DAILY_LIMIT - BUFFER; // 14

const TIER_LIMITS = {
  reserved: 4,  // High-signal: Liz Stark, Lightning Labs, etc.
  high: 5,       // Organic valuable engagement
  normal: 5,     // Routine conversation monitor
  low: 0,        // Uses whatever's left (0 guaranteed)
};

// Accounts that always qualify for TIER 1 (reserved)
const RESERVED_ACCOUNTS = [
  'lightning', 'lightninglabs', 'elizabethstarks',
  'a16zcrypto', 'coinbase', 'starkness',
  'jack', 'saylor', 'breedlove22', 'BTCBoyd',
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return { date: todayKey(), writes: [], total: 0, byTier: {} };
  }
  try {
    const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    // Reset if new day
    if (state.date !== todayKey()) {
      return { date: todayKey(), writes: [], total: 0, byTier: {} };
    }
    return state;
  } catch (_) {
    return { date: todayKey(), writes: [], total: 0, byTier: {} };
  }
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Check if a write is allowed at this priority tier.
 * @param {'reserved'|'high'|'normal'|'low'} tier
 * @returns {boolean}
 */
export function canWrite(tier = 'normal') {
  const state = loadState();
  
  // Hard cap
  if (state.total >= USABLE_LIMIT) return false;

  // Tier-specific budget check
  const tierUsed = state.byTier[tier] || 0;
  const tierLimit = TIER_LIMITS[tier];
  
  // 'low' tier: only if 3+ writes remain after all guaranteed tiers
  if (tier === 'low') {
    const guaranteedTotal = Object.entries(TIER_LIMITS)
      .filter(([t]) => t !== 'low')
      .reduce((sum, [, l]) => sum + l, 0);
    const remainingForLow = USABLE_LIMIT - guaranteedTotal - (state.total - tierUsed);
    return remainingForLow > 0;
  }

  return tierUsed < tierLimit;
}

/**
 * Record a write operation.
 * @param {'reserved'|'high'|'normal'|'low'} tier
 * @param {string} description - What was written (for logging)
 */
export async function recordWrite(tier = 'normal', description = '') {
  const state = loadState();
  state.total = (state.total || 0) + 1;
  state.byTier[tier] = (state.byTier[tier] || 0) + 1;
  state.writes.push({
    tier,
    description: description.slice(0, 100),
    at: new Date().toISOString(),
  });
  saveState(state);
}

/**
 * Get full budget status for reporting.
 */
export function getBudgetStatus() {
  const state = loadState();
  const remaining = USABLE_LIMIT - state.total;
  
  return {
    date: state.date,
    used: state.total,
    remaining,
    limit: USABLE_LIMIT,
    hardLimit: DAILY_LIMIT,
    byTier: {
      reserved: { used: state.byTier.reserved || 0, limit: TIER_LIMITS.reserved },
      high:     { used: state.byTier.high || 0,     limit: TIER_LIMITS.high },
      normal:   { used: state.byTier.normal || 0,   limit: TIER_LIMITS.normal },
      low:      { used: state.byTier.low || 0,      limit: '∞ if available' },
    },
    recentWrites: state.writes.slice(-5),
  };
}

/**
 * Determine tier for a given reply context.
 * @param {object} context - { authorHandle, likes, isReplyToBoyd }
 */
export function determineTier(context = {}) {
  const { authorHandle = '', likes = 0, isReplyToBoyd = false } = context;
  const handle = authorHandle.toLowerCase().replace('@', '');
  
  if (RESERVED_ACCOUNTS.includes(handle)) return 'reserved';
  if (isReplyToBoyd) return 'reserved';
  if (likes >= 500) return 'high';
  if (likes >= 100) return 'high';
  return 'normal';
}

// ─── CLI mode ────────────────────────────────────────────────────────────────
if (process.argv[1] === (await import('url')).fileURLToPath(import.meta.url)) {
  const status = getBudgetStatus();
  console.log('\n📊 X Write Budget Status (@Maxibtc2009)');
  console.log('════════════════════════════════════════');
  console.log(`Date:      ${status.date}`);
  console.log(`Used:      ${status.used} / ${status.limit} (hard limit: ${status.hardLimit})`);
  console.log(`Remaining: ${status.remaining}`);
  console.log('\nBy tier:');
  for (const [tier, data] of Object.entries(status.byTier)) {
    const bar = '█'.repeat(data.used) + '░'.repeat(Math.max(0, (typeof data.limit === 'number' ? data.limit : 3) - data.used));
    console.log(`  ${tier.padEnd(8)} ${bar} ${data.used}/${data.limit}`);
  }
  if (status.recentWrites.length) {
    console.log('\nRecent writes:');
    status.recentWrites.forEach(w => console.log(`  [${w.tier}] ${w.at.slice(11,16)} — ${w.description}`));
  }
  console.log('');
}
