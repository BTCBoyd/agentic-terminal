# Lightning Network Technical Reference
*Prepared by Boyd for Maxi*

## Key Technical Concepts for AI Implementation

### Overview
The Lightning Network is a Layer 2 payment protocol built on top of Bitcoin that enables fast, low-cost transactions through off-chain payment channels. It solves Bitcoin's scalability limitations while maintaining the security guarantees of the base layer.

## Core Architecture

### Payment Channels
- **Bidirectional payment channels**: Two parties lock Bitcoin in a 2-of-2 multisig address on-chain, then conduct unlimited off-chain transactions by updating commitment transactions
- **Channel capacity**: Total amount of Bitcoin locked in the channel, determining maximum payment size
- **Local vs Remote balance**: Each party's current balance within the channel, which shifts with each payment
- **Channel states**: Updated with each transaction through revocable commitment transactions using HTLCs (Hash Time-Locked Contracts)

### Multi-Hop Routing
- **Onion routing**: Payments route through multiple nodes without revealing full path to intermediaries, preserving privacy
- **Source-based routing**: Sender determines entire payment path using local channel graph knowledge
- **Atomic payments**: HTLCs ensure payments either complete fully or fail completely across all hops
- **Routing fees**: Each intermediate node charges small fees (typically <1%) for forwarding payments

## Key Technical Components

### HTLCs (Hash Time-Locked Contracts)
HTLCs are the cryptographic mechanism enabling trustless multi-hop payments. They use hash preimages and time locks to ensure atomicity:
- **Hash lock**: Payment locked to hash of secret (preimage) only receiver knows
- **Time lock**: Payment automatically returns to sender after timeout if not claimed
- **Preimage revelation**: Receiver claims payment by revealing preimage, which propagates back through route

### BOLT11 Invoices
- Encoded payment requests containing: payment hash, amount, destination pubkey, expiry time, route hints
- **Human-readable format**: Starts with 'ln' prefix followed by bech32-encoded data
- **Single-use**: Each invoice should only be paid once to maintain privacy

## Network Topology & Liquidity

### Channel Graph
- **Gossiped through network**: Nodes broadcast channel announcements and updates
- **Public vs private channels**: Public channels advertised in gossip; private only known to participants
- **Channel updates**: Periodic updates broadcast fee policies and enabled/disabled status

### Liquidity Management
- **Inbound liquidity**: Remote balance allowing you to receive payments
- **Outbound liquidity**: Local balance allowing you to send payments
- **Rebalancing**: Moving liquidity through circular payments to maintain routing capacity
- **Submarine swaps**: Trustless exchanges between on-chain and Lightning for liquidity

## Implementation Standards (BOLTs)
Basis of Lightning Technology (BOLT) specifications define interoperability standards:
- **BOLT #1**: Base protocol and message format
- **BOLT #2**: Peer protocol for channel management
- **BOLT #3**: Bitcoin transaction and script formats
- **BOLT #4**: Onion routing protocol
- **BOLT #7**: P2P node and channel discovery (gossip protocol)
- **BOLT #11**: Invoice protocol for payments

## Major Node Implementations
- **LND (Lightning Network Daemon)**: Go implementation by Lightning Labs, most popular
- **Core Lightning (CLN)**: C implementation by Blockstream, highly customizable with plugins
- **Eclair**: Scala implementation by ACINQ, mobile-focused
- **LDK (Lightning Dev Kit)**: Rust library for building custom Lightning applications

## Advanced Features

### AMP (Atomic Multi-Path Payments)
Splits large payments across multiple routes to overcome individual channel capacity limits while maintaining atomicity.

### Keysend (Spontaneous Payments)
Enables payments without invoices by sender generating preimage and encrypting it in onion for receiver.

### Watchtowers
Third-party services monitoring for channel breaches when nodes are offline, broadcasting penalty transactions if counterparty publishes old state.

### Channel Types
- **Anchor channels**: Use anchor outputs for flexible fee bumping via CPFP
- **Zero-conf channels**: Channels usable before on-chain confirmation (requires trust)
- **Taproot channels**: Use Taproot for improved privacy and efficiency (emerging)

## Security Considerations
- **Hot wallet requirement**: Lightning nodes must be online with keys accessible for signing
- **Channel backup**: Static Channel Backups (SCB) enable recovery of on-chain funds if node lost
- **Force close penalties**: Broadcasting old channel states results in penalty transaction taking all funds
- **Time-locked funds**: Force-closed channels have CSV (CheckSequenceVerify) delays before funds spendable

## API Integration Points

### gRPC/REST APIs
- LND provides both gRPC and REST interfaces for application integration
- Core Lightning uses JSON-RPC and Unix socket communication
- Common operations: create invoice, pay invoice, open channel, close channel, query routes, decode invoice

### Macaroons (LND Authentication)
Bearer credentials with caveats enabling fine-grained permission delegation. Different macaroons for admin, invoice, readonly access.

## Practical Performance Metrics
- **Payment speed**: Typically 1-3 seconds for successful routes
- **Transaction costs**: Usually <1 satoshi per hop, orders of magnitude cheaper than on-chain
- **Network capacity**: ~5,000 BTC total public channel capacity (as of 2024)
- **Typical payment size**: Most payments under $100; larger amounts often split via AMP
- **Success rates**: Well-connected nodes achieve >95% payment success for amounts <$50

## Key Use Cases for AI Integration
- **Micropayments**: Sub-cent transactions for API calls, content access, computational resources
- **Streaming payments**: Continuous small payments for ongoing services (e.g., per-second video)
- **Machine-to-machine payments**: Automated payments between AI agents or IoT devices
- **Instant settlements**: Real-time finality without waiting for on-chain confirmations
- **Global remittances**: Low-cost cross-border transfers settling in seconds
