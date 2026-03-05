// Create a Lightning invoice with Observer Protocol metadata using native fetch
async function createOPInvoice() {
    const LIGHTNING_WALLET_API_KEY = process.env.LIGHTNING_WALLET_API_KEY;
    
    if (!LIGHTNING_WALLET_API_KEY) {
        console.error('Error: LIGHTNING_WALLET_API_KEY not set');
        process.exit(1);
    }
    
    const amount = 21000; // 21,000 sats
    const memo = 'Observer Protocol Test: Maxi verification payment';
    
    try {
        // Use lightningfaucet.com API to create invoice
        const response = await fetch('https://lightningfaucet.com/ai-agents/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create_invoice',
                api_key: LIGHTNING_WALLET_API_KEY,
                amount: amount,
                memo: memo
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        console.log('=== Observer Protocol Lightning Invoice ===\n');
        console.log('Amount:', amount, 'sats (21,000)');
        console.log('Memo:', memo);
        console.log('\nBOLT11 Invoice:');
        console.log(data.invoice);
        console.log('\nPayment Hash:', data.payment_hash);
        console.log('\n=== Observer Protocol Metadata ===');
        console.log(JSON.stringify({
            protocol: 'L402',
            agent_id: '03d93f27052c55ca636442f5b3432598978016738cd1cb4bd18705f1eb4552896f',
            agent_name: 'Maxi',
            verification_status: 'verified',
            invoice_challenge: data.payment_hash,
            amount_sats: amount,
            timestamp: new Date().toISOString(),
            purpose: 'cryptographic_verification_test'
        }, null, 2));
        console.log('\n=== Instructions ===');
        console.log('1. Pay this invoice with any Lightning wallet');
        console.log('2. Send me the payment preimage (proof of payment)');
        console.log('3. I will verify it cryptographically and attest to Observer Protocol');
        console.log('4. This becomes a verified transaction in my reputation graph');
        
    } catch (error) {
        console.error('Error creating invoice:', error.message);
    }
}

createOPInvoice();
