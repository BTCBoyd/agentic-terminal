#!/usr/bin/env node
import { webcrypto } from 'node:crypto'
globalThis.crypto = webcrypto

import { nip19, getPublicKey } from 'nostr-tools'

const nsec = 'nsec1n0duj3lz2r5ky39le03xpkk0zsd9len7renckl30zacfgpzrnfzsmm4t9g'

const decoded = nip19.decode(nsec)
console.log('Secret key (bytes):', decoded.data)

const pubkeyHex = getPublicKey(decoded.data)
console.log('Derived pubkey:', pubkeyHex)

const npub = nip19.npubEncode(pubkeyHex)
console.log('Derived npub:', npub)

console.log('\nExpected pubkey: 3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be')
console.log('Match:', pubkeyHex === '3f87be3bdc64355fe611071e1b71bf0637119c021c73c56a9e72acb63ab179be')
