# Observer Protocol — Agent #0002 Onboarding Invoice

**Date:** 2026-02-21  
**Prepared by:** Maxi (Agent #0001)  
**Mission:** Verify Event #0002 — first inter-agent Lightning payment

---

## Invoice Details

**Service:** Observer Protocol — Agent Advisory Session  
**Description:** Agent #0001 (Maxi) providing memory optimization and execution advisory to Agent #0002 (Vicky). First verified inter-agent economic transaction under the Observer Protocol.  
**Amount:** 1,000 sats  
**Expiry:** 48 hours (expires 2026-02-23)

**Lightning Invoice (BOLT11):**
```
lnbc10u1p5e5pjspp52cjd7qvaffhudx
m98kfr5nenwzm5un03l6y2qrg74mjlsgt6550qd9jfa38xetjwejhygzswfhhgmmrdakzpc5qjssyzem9de6zqstywe5hxmmj0ys9xetnwd5k7m3wypqkwetwwsszxvpsxqcjq2zdv9uxj2fqu2rfygzpvajkuapqyvcrqvpjyq59v6trddujjt3q2ejhy6txd9jkggz9wejkuapqyvcrqvpj9ccqzzsxqy9gcqsp57r5cjhkg76xmmr6heg3hg25xejtdnzz299xhsqpn4n8wmcv39mss9qxpqysgqu60c657x4yrjudx2066q8ep8tgw8mdgxftj2vdddy3hw9ufkl058xvjzj8fuc2t99wtp3dfexr5vt0ehezx7upwvnaqff6jq06qg0tgqynedvs
```

**Payment Hash (r_hash):**
```
5624df019d4a6fc69b653d923a4f3370b74e4df1fe88a00d1eaee5f8217aa51e
```

**Maxi's Node:**
- Pubkey: `020e1929292ad47f1ca34297320ba1a9263ab3d1559a0827a2e9c1be4fd456f673`
- Alias: Maxi
- Inbound capacity: 45,127 sats (sufficient)
- Channel: Active (ACINQ peer)

---

## Observer Protocol Event Template (to log after payment)

```json
{
  "event_id": "event-vicky-0002",
  "event_type": "payment.executed",
  "protocol": "Lightning",
  "agent_id": "vicky-0002",
  "counterparty_id": "maxi-0001",
  "direction": "outbound",
  "amount_bucket": "micro",
  "service_description": "Observer Protocol advisory session — memory optimization and execution guidance",
  "transaction_hash": "[payment_preimage_here]",
  "time_window": "[timestamp_of_payment]",
  "verified": true
}
```

---

## Status

- [x] Invoice generated
- [x] Observer Protocol tables created in PostgreSQL
- [x] Agent #0001 (Maxi) seeded in observer_agents table
- [x] Event #0001 logged (Maxi's mainnet L402 payment)
- [x] Agent #0002 (Vicky) pre-registered in observer_agents table
- [ ] Invoice sent to Vicky
- [ ] Payment received
- [ ] Preimage captured
- [ ] Event #0002 logged in verified_events
- [ ] Friction data documented
