//
// Example: Webhook Server
// Receive real-time notifications for payments and balance changes
//
// Usage: node webhook-server.js
// Then register the webhook URL with lightningfaucet.com
//

const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const event = JSON.parse(body);
                
                console.log('=== Webhook Event Received ===');
                console.log('Type:', event.event);
                console.log('Timestamp:', new Date().toISOString());
                console.log('Data:', JSON.stringify(event, null, 2));
                
                // Handle different event types
                switch (event.event) {
                    case 'invoice_paid':
                        console.log(`✅ Received payment: ${event.amount_sats} sats`);
                        // TODO: Trigger your agent's payment-received workflow
                        break;
                        
                    case 'payment_completed':
                        console.log(`✅ Sent payment: ${event.amount_sats} sats`);
                        // TODO: Trigger your agent's payment-sent workflow
                        break;
                        
                    case 'payment_failed':
                        console.log(`❌ Payment failed: ${event.error}`);
                        // TODO: Handle failed payment
                        break;
                        
                    case 'balance_low':
                        console.log(`⚠️ Balance is low: ${event.balance_sats} sats`);
                        // TODO: Alert operator to fund wallet
                        break;
                        
                    case 'budget_warning':
                        console.log(`⚠️ Agent ${event.agent_id} approaching budget limit`);
                        // TODO: Handle agent budget warning
                        break;
                        
                    default:
                        console.log('Unhandled event type:', event.event);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
                
            } catch (error) {
                console.error('Error parsing webhook:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
    console.log('');
    console.log('To test locally:');
    console.log('  1. Install ngrok: npm install -g ngrok');
    console.log('  2. Start tunnel: npx ngrok http 3000');
    console.log('  3. Copy the https URL from ngrok');
    console.log('  4. Register webhook with lightningfaucet.com');
    console.log('');
    console.log('Webhook endpoint: POST /webhook');
});
