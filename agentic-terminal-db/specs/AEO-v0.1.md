# Agentic Economy Ontology (AEO) v0.1

**Status:** Draft  
**Author:** Boyd Cohen & Maxi  
**Date:** 2026-02-20

## Why Ontology Matters

Without controlled vocabulary, datasets degrade. AEO ensures consistency, query integrity, cross-protocol comparability, and long-term data value.

## Layer 1: Protocol

lightning | l402 | x402 | erc8004 | ark | stablecoin_api

## Layer 2: Economic Activity

payment | revenue | cost | liquidity | capital | compute | subscription | governance | reward

## Layer 3: Role

payer | payee | router | infrastructure_provider | end_user_agent | service_agent

## Layer 4: Counterparty Type

agent | human_user | api_provider | wallet | exchange | mining_node | liquidity_node | unknown

## Layer 5: Context Tag

inference_compute | api_call | model_training | liquidity_rebalance | subscription_fee | governance_vote | reward_distribution

## Layer 6: Economic Intent

operational | capital_allocation | infrastructure_cost | experimental | arbitrage | yield

## Implementation Rules

1. No new metric name enters the database without definition
2. No free-text protocol identifiers
3. Event types must match ontology values
4. Vocabulary updates must be versioned

## Version History

- v0.1 (2026-02-20): Initial draft, all 6 layers defined
