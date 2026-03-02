#!/usr/bin/env node
/**
 * check-channel-active.mjs
 * Polls LND for active channels. When ACINQ channel goes active,
 * notifies Boyd via WhatsApp and exits.
 * Run by cron every 5 minutes until channel is live.
 */

import { execSync } from 'child_process';

const LNCLI = '/media/nvme/lnd-install/lnd-linux-arm64-v0.18.5-beta/lncli';
const LNCLI_FLAGS = '--lnddir=/media/nvme/lnd-data --network=mainnet';
const ACINQ_PUBKEY = '03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f';

function lncli(cmd) {
  return JSON.parse(execSync(`${LNCLI} ${LNCLI_FLAGS} ${cmd}`, { encoding: 'utf-8' }));
}

const info = lncli('getinfo');
const activeChannels = info.num_active_channels;
const pendingChannels = info.num_pending_channels;

if (activeChannels === 0) {
  // Still pending — check confirmations
  const pending = lncli('pendingchannels');
  const ch = pending.pending_open_channels?.[0];
  const confirmations = ch?.confirmations || 0;
  console.log(`Channel still pending. Confirmations: ${confirmations}. Active: ${activeChannels}. Pending: ${pendingChannels}.`);
  process.exit(0); // exit cleanly — cron will retry
}

// Channel went active! Check if it's the ACINQ one
const channels = lncli('listchannels');
const acinqChannel = channels.channels?.find(ch => ch.remote_pubkey === ACINQ_PUBKEY && ch.active);

if (acinqChannel) {
  console.log('🎉 ACINQ channel is ACTIVE!');
  console.log('Channel ID:', acinqChannel.chan_id);
  console.log('Capacity:', acinqChannel.capacity, 'sats');
  console.log('Local balance:', acinqChannel.local_balance, 'sats');
  console.log('Remote balance:', acinqChannel.remote_balance, 'sats');

  // Write a flag file so cron knows to stop
  import('fs').then(fs => {
    fs.writeFileSync('/home/futurebit/.openclaw/workspace/.channel-active', JSON.stringify({
      activatedAt: new Date().toISOString(),
      chanId: acinqChannel.chan_id,
      capacity: acinqChannel.capacity,
      localBalance: acinqChannel.local_balance,
    }));
  });

  process.exit(42); // special exit code — cron uses this to trigger WhatsApp notification
} else {
  console.log(`Active channels found but ACINQ not among them yet. Total active: ${activeChannels}`);
  process.exit(0);
}
