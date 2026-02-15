/**
 * Maxi Dashboard Update Helper
 * 
 * Use this script to programmatically update Boyd's Command Center
 * Can be injected via browser automation or run in console
 */

// ============================================================================
// QUICK UPDATE FUNCTIONS
// ============================================================================

/**
 * Update Tier 1 deliverable progress
 */
function updateDeliverableProgress(id, progress, status = null) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  const deliverable = data.tier1Deliverables.find(d => d.id === id);
  
  if (!deliverable) {
    console.error(`Deliverable with id ${id} not found`);
    return false;
  }
  
  deliverable.progress = progress;
  if (status) deliverable.status = status;
  
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Updated deliverable ${id}: ${progress}% ${status || ''}`);
  return true;
}

/**
 * Add new Tier 1 deliverable
 */
function addDeliverable(title, dueDate, details = '', status = 'QUEUED') {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  
  const newDeliverable = {
    id: Date.now(),
    title,
    dueDate: new Date(dueDate).toISOString(),
    status,
    progress: 0,
    details
  };
  
  data.tier1Deliverables.push(newDeliverable);
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Added deliverable: ${title}`);
  return newDeliverable.id;
}

/**
 * Mark deliverable as complete
 */
function completeDeliverable(id, onTime = true, rootCause = null) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  const deliverable = data.tier1Deliverables.find(d => d.id === id);
  
  if (!deliverable) {
    console.error(`Deliverable with id ${id} not found`);
    return false;
  }
  
  deliverable.status = 'COMPLETE';
  deliverable.progress = 100;
  
  // Add to weekDelivered
  const completion = {
    item: deliverable.title,
    timestamp: new Date().toISOString(),
    status: onTime ? 'ON_TIME' : 'MISSED'
  };
  
  if (!onTime && rootCause) {
    completion.rootCause = rootCause;
  }
  
  data.weekDelivered.unshift(completion);
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Completed deliverable: ${deliverable.title} - ${completion.status}`);
  return true;
}

/**
 * Update Nostr post count
 */
function updateNostrCount(count) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  data.dailyOperations.nostr.todayCount = count;
  data.dailyOperations.nostr.lastPost = new Date().toISOString();
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Updated Nostr count: ${count}/5`);
  return true;
}

/**
 * Update BTC price
 */
function updateBTCPrice(price) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  data.dailyOperations.btc.price = price;
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Updated BTC price: $${price.toLocaleString()}`);
  return true;
}

/**
 * Update mining status
 */
function updateMiningStatus(rig, status, hashrate) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  
  if (rig === 'solo' || rig === 'apolloSolo') {
    data.dailyOperations.mining.apolloSolo.status = status;
    data.dailyOperations.mining.apolloSolo.hashrate = hashrate;
  } else if (rig === 'ii' || rig === 'apolloII') {
    data.dailyOperations.mining.apolloII.status = status;
    data.dailyOperations.mining.apolloII.hashrate = hashrate;
  } else {
    console.error('Invalid rig name. Use "solo" or "ii"');
    return false;
  }
  
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Updated ${rig} mining: ${status} ${hashrate}`);
  return true;
}

/**
 * Update fundraise stage
 */
function updateFundraiseStage(stage) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  data.arcadiabStrategic.fundraise.stage = stage;
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Updated fundraise stage: ${stage}`);
  return true;
}

/**
 * Update investor pipeline
 */
function updateInvestorPipeline(hot, warm, cold) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  data.arcadiabStrategic.investors.hot = hot;
  data.arcadiabStrategic.investors.warm = warm;
  data.arcadiabStrategic.investors.cold = cold;
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Updated investor pipeline: Hot=${hot} Warm=${warm} Cold=${cold}`);
  return true;
}

/**
 * Add milestone
 */
function addMilestone(text, date) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  data.arcadiabStrategic.nextMilestones.push({ text, date });
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Added milestone: ${text} on ${date}`);
  return true;
}

/**
 * Update writing progress
 */
function updateWritingProgress(title, progress) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  const writing = data.contentPipeline.writing.find(w => w.title.includes(title));
  
  if (!writing) {
    console.error(`Writing project containing "${title}" not found`);
    return false;
  }
  
  writing.progress = progress;
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Updated writing "${writing.title}": ${progress}%`);
  return true;
}

// ============================================================================
// BATCH UPDATE HELPER
// ============================================================================

/**
 * Apply multiple updates at once
 */
function batchUpdate(updates) {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  
  updates.forEach(update => {
    const { type, ...params } = update;
    
    switch(type) {
      case 'deliverableProgress':
        const d = data.tier1Deliverables.find(x => x.id === params.id);
        if (d) {
          d.progress = params.progress;
          if (params.status) d.status = params.status;
        }
        break;
        
      case 'nostrCount':
        data.dailyOperations.nostr.todayCount = params.count;
        data.dailyOperations.nostr.lastPost = new Date().toISOString();
        break;
        
      case 'btcPrice':
        data.dailyOperations.btc.price = params.price;
        break;
        
      case 'fundraiseStage':
        data.arcadiabStrategic.fundraise.stage = params.stage;
        break;
        
      // Add more as needed
    }
  });
  
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log(`Applied ${updates.length} batch updates`);
  return true;
}

// ============================================================================
// BROWSER AUTOMATION EXAMPLE (for Maxi)
// ============================================================================

/**
 * Example: Update dashboard via OpenClaw browser tool
 * 
 * Usage:
 * 1. Open dashboard in browser
 * 2. Use browser.act with evaluate kind to run these functions
 */

/*
// Example browser automation call:
await browser({
  action: 'act',
  profile: 'openclaw',
  targetId: '[DASHBOARD_TAB_ID]',
  request: {
    kind: 'evaluate',
    fn: `
      // Update Nostr count
      const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
      data.dailyOperations.nostr.todayCount = 3;
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
      window.location.reload();
    `
  }
});
*/

// ============================================================================
// DAILY RESET HELPER
// ============================================================================

/**
 * Reset daily counters (run this at midnight or start of day)
 */
function resetDailyCounters() {
  const data = JSON.parse(localStorage.getItem('boyd-command-center-data'));
  
  // Reset Nostr count
  data.dailyOperations.nostr.todayCount = 0;
  
  // Clean up old weekDelivered items (keep last 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  data.weekDelivered = data.weekDelivered.filter(item => {
    return new Date(item.timestamp).getTime() > sevenDaysAgo;
  });
  
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem('boyd-command-center-data', JSON.stringify(data));
  
  console.log('Daily counters reset');
  return true;
}

// ============================================================================
// EXPORT FOR USE
// ============================================================================

// If running in browser console, these are now available globally
// If using via script injection, they're in the global scope

console.log('✅ Maxi Update Helper loaded');
console.log('Available functions:');
console.log('  - updateDeliverableProgress(id, progress, status?)');
console.log('  - addDeliverable(title, dueDate, details?, status?)');
console.log('  - completeDeliverable(id, onTime?, rootCause?)');
console.log('  - updateNostrCount(count)');
console.log('  - updateBTCPrice(price)');
console.log('  - updateMiningStatus(rig, status, hashrate)');
console.log('  - updateFundraiseStage(stage)');
console.log('  - updateInvestorPipeline(hot, warm, cold)');
console.log('  - addMilestone(text, date)');
console.log('  - updateWritingProgress(title, progress)');
console.log('  - batchUpdate(updates[])');
console.log('  - resetDailyCounters()');
