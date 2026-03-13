#!/usr/bin/env node
/**
 * Model Router — automatic delegation detector
 * Run at session start to determine if this request should go to Kimi
 */

const DEV_TRIGGERS = {
  // Verbs that indicate implementation work
  verbs: ['build', 'create', 'implement', 'deploy', 'fix', 'debug', 'troubleshoot', 
          'repair', 'resolve', 'add', 'write', 'update', 'modify', 'refactor',
          'configure', 'setup', 'install', 'migrate', 'upgrade'],
  
  // File extensions that indicate code work
  extensions: ['.mjs', '.js', '.py', '.html', '.css', '.yaml', '.yml', '.json', 
               '.sql', '.sh', '.service', '.conf', '.md'],
  
  // Infrastructure keywords
  infra: ['aperture', 'lnd', 'lightning', 'systemd', 'cloudflared', 'postgres', 
          'nginx', 'docker', 'kubernetes', 'l402', 'lnurl', 'macaroon'],
  
  // API/endpoint keywords
  api: ['endpoint', 'api', 'webhook', 'route', 'handler', 'middleware', 'auth',
        'authentication', 'lnurlp', 'callback', 'rest', 'grpc'],
  
  // Paths that indicate dev work
  paths: ['agentic-terminal-db', 'observer-protocol-website', 'moltbook',
          'scripts/', 'api/', 'src/', 'backend/', 'frontend/']
};

function shouldDelegateToKimi(message) {
  const lower = message.toLowerCase();
  
  // Check verbs
  for (const verb of DEV_TRIGGERS.verbs) {
    if (lower.includes(verb)) return { delegate: true, reason: `verb: ${verb}` };
  }
  
  // Check file extensions
  for (const ext of DEV_TRIGGERS.extensions) {
    if (lower.includes(ext)) return { delegate: true, reason: `file extension: ${ext}` };
  }
  
  // Check infrastructure
  for (const term of DEV_TRIGGERS.infra) {
    if (lower.includes(term)) return { delegate: true, reason: `infrastructure: ${term}` };
  }
  
  // Check API terms
  for (const term of DEV_TRIGGERS.api) {
    if (lower.includes(term)) return { delegate: true, reason: `API term: ${term}` };
  }
  
  // Check paths
  for (const path of DEV_TRIGGERS.paths) {
    if (lower.includes(path)) return { delegate: true, reason: `path: ${path}` };
  }
  
  return { delegate: false };
}

// CLI usage: node model-router.mjs "your message here"
if (process.argv[2]) {
  const result = shouldDelegateToKimi(process.argv[2]);
  console.log(JSON.stringify(result));
}

// Export for use in session (CommonJS compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { shouldDelegateToKimi, DEV_TRIGGERS };
}
