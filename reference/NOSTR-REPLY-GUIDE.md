# Nostr Threaded Reply Guide

## Overview

The `post-to-nostr.mjs` script now supports **threaded replies** following NIP-10 (Nostr Improvement Proposal 10), allowing you to reply to comments in a way that shows proper conversation threading in Nostr clients like Primal, Damus, Amethyst, etc.

## Quick Start

### Standalone Post (existing behavior)
```bash
node post-to-nostr.mjs "Hello Nostr!"
```

### Threaded Reply (NEW)
```bash
node post-to-nostr.mjs --reply-to <event_id> --mention <author_pubkey> "Great point! I agree."
```

## How to Get Event IDs and Pubkeys

### Finding Event ID
1. Open the post you want to reply to in your Nostr client
2. Look for "Copy Note ID" or similar option
3. Use the hex format (not the `note1...` format)
   - If you have `note1...`, decode it to hex using a Nostr tool or client

### Finding Author Pubkey
1. Click on the author's profile
2. Look for "Copy Public Key" or "Copy npub"
3. Use the hex format (not the `npub1...` format)
   - If you have `npub1...`, decode it to hex

## NIP-10 Tag Structure

When you use `--reply-to` and `--mention`, the script automatically adds these tags to your event:

```javascript
{
  kind: 1,
  content: "Your reply text",
  tags: [
    ["e", "<parent_event_id>", "", "reply"],  // marks as reply
    ["p", "<author_pubkey>"]                   // mentions author
  ],
  created_at: timestamp
}
```

### What These Tags Do:

- **"e" tag (event tag)**: Links your reply to the parent post, creating the thread connection
- **"p" tag (pubkey tag)**: Mentions the original author, sending them a notification
- **"reply" marker**: Explicitly marks this as a direct reply (NIP-10 standard)

## Full Command Options

```bash
node post-to-nostr.mjs [OPTIONS] <message>

Options:
  --key, -k <hex>        Private key (or set NOSTR_PRIVATE_KEY env var)
  --relays, -r <list>    Comma-separated relay URLs
  --reply-to <event_id>  Reply to a specific event (NIP-10 threading)
  --mention <pubkey>     Mention author's pubkey (notifies them)
  --help, -h             Show help
```

## Examples

### Example 1: Reply to a Bitcoin Discussion
```bash
node post-to-nostr.mjs \
  --reply-to a1b2c3d4e5f6789... \
  --mention 1234567890abcdef... \
  "Excellent analysis of the halving cycle!"
```

### Example 2: Reply with Custom Relays
```bash
node post-to-nostr.mjs \
  --relays wss://relay.damus.io,wss://nos.lol \
  --reply-to a1b2c3d4e5f6789... \
  --mention 1234567890abcdef... \
  "Thanks for sharing this!"
```

### Example 3: Using Environment Variable for Key
```bash
export NOSTR_PRIVATE_KEY="your-hex-key-here"

node post-to-nostr.mjs \
  --reply-to a1b2c3d4e5f6789... \
  --mention 1234567890abcdef... \
  "Building on your idea..."
```

## Backward Compatibility

- **Standalone posts still work exactly as before** — just omit the reply flags
- Reply mode is completely optional
- All existing scripts using the tool continue to work

## Testing

A test script is included to validate the NIP-10 structure:

```bash
node test-nostr-reply.mjs
```

This confirms:
- Standalone posts have empty tags `[]`
- Reply posts have proper NIP-10 tags with "e" and "p" tags
- Event structure matches Nostr protocol standards

## Relay Compatibility

The script publishes to these relays by default:
- wss://relay.damus.io
- wss://nos.lol
- wss://relay.primal.net
- wss://relay.snort.social

All of these support NIP-10 threaded replies and will properly index your reply events.

## Verification

After posting a reply:
1. The script outputs the event ID to stdout
2. Check your Nostr client (Primal, Damus, etc.)
3. Navigate to the original post
4. Your reply should appear as a threaded comment
5. The author should receive a notification (if their client supports "p" tag mentions)

## Troubleshooting

### Reply doesn't appear threaded
- Verify you're using the correct hex format event ID (not `note1...`)
- Confirm the event ID exists and is valid
- Check that relays successfully received the post

### Author not notified
- Verify you're using the correct hex format pubkey (not `npub1...`)
- Some clients may not support mention notifications yet

### Error: "Invalid private key format"
- Private key must be 64-character hex string or `nsec1...` format
- Set `NOSTR_PRIVATE_KEY` environment variable or use `--key` flag

## Advanced: Multiple Mentions

To mention multiple people in a thread, you would need to extend the script to accept multiple `--mention` flags. The current implementation supports one reply-to and one mention (the most common use case).

## Further Reading

- [NIP-10: On "e" and "p" tags in Text Events](https://github.com/nostr-protocol/nips/blob/master/10.md)
- [NIP-01: Basic protocol flow description](https://github.com/nostr-protocol/nips/blob/master/01.md)

---

**Success!** You can now participate in threaded Nostr conversations with proper reply linking. 🎉
