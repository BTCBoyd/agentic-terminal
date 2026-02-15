# Chat Function Code - For Debugging Response Length Issue

## PROBLEM
Maxi consistently returns 300-400+ word responses with headers/tables, despite strict 150-word limits in system prompt and token budgets.

## KEY CODE SECTIONS

### 1. TOKEN BUDGETS (Model Selection)

```javascript
// Dynamic token budgets - HARD LIMIT 150 words (~200 tokens)
const TOKEN_BUDGETS = {
  quickAnswer: 200,      // ~75-100 words - for direct questions
  explanation: 250,      // ~100-125 words - for "explain X" questions  
  analysis: 300,         // ~125-150 words - for complex multi-part questions
  default: 250           // Safe middle ground
};

function selectModel(message) {
  const words = message.trim().split(/\s+/).length;
  const lowerMessage = message.toLowerCase();
  
  // Determine token budget based on question type
  let maxTokens = TOKEN_BUDGETS.default;
  
  if (message.length < 50) {
    maxTokens = TOKEN_BUDGETS.quickAnswer;
  } else if (lowerMessage.includes('explain') || lowerMessage.includes('how') || 
             lowerMessage.includes('what') || lowerMessage.includes('why')) {
    maxTokens = TOKEN_BUDGETS.explanation;
  } else if (lowerMessage.includes('compare') || lowerMessage.includes('analyze') || 
             lowerMessage.includes('difference')) {
    maxTokens = TOKEN_BUDGETS.analysis;
  }
  
  // Model selection
  const faqPatterns = [
    /^what is/i,
    /^why (is|does)/i,
    /^how (does|do)/i,
    /^can you (explain|tell)/i,
    /^define/i,
  ];
  
  const isFAQ = faqPatterns.some(pattern => pattern.test(message));
  const isShort = words < CONFIG.SIMPLE_MESSAGE_THRESHOLD;
  
  if (isFAQ || isShort) {
    return {
      model: 'claude-haiku-4-5',
      maxTokens: Math.min(maxTokens, TOKEN_BUDGETS.explanation),
      reasoning: 'Simple FAQ or short query'
    };
  }
  
  return {
    model: 'claude-sonnet-4-5',
    maxTokens: maxTokens,
    reasoning: 'Complex query requiring depth'
  };
}
```

### 2. SYSTEM PROMPT (First 100 lines of MAXI_PERSONALITY)

See main chat.js file starting line 19 - includes:
- Core identity
- Response format rules (150 word max, structure template)
- FORBIDDEN list (headers, tables, long paragraphs)
- Good/bad examples
- Strategy guidance

### 3. MAIN API CALL FUNCTION

```javascript
function callAnthropic(messages, model, maxTokens, leadContext, language) {
  return new Promise((resolve, reject) => {
    // Build system prompt with cache control
    const languageInstruction = language === 'es' 
      ? '\n\n**IMPORTANT: The user is writing in Spanish. You MUST respond in Spanish (Español).**'
      : language === 'pt'
      ? '\n\n**IMPORTANT: The user is writing in Portuguese. You MUST respond in Portuguese (Português).**'
      : '';
    
    const systemPrompt = [
      {
        type: 'text',
        text: MAXI_PERSONALITY + languageInstruction,
        cache_control: { type: 'ephemeral' }
      },
      {
        type: 'text',
        text: BITCOIN_SINGULARITY_THESIS,
        cache_control: { type: 'ephemeral' }
      },
      {
        type: 'text',
        text: WHY_AI_AGENTS_CHOOSE_BITCOIN,
        cache_control: { type: 'ephemeral' }
      },
      {
        type: 'text',
        text: AUSTRIAN_ECONOMICS_AI,
        cache_control: { type: 'ephemeral' }
      }
    ];
    
    // Add dynamic context if lead intent detected
    if (leadContext.shouldMentionArcadiaB) {
      systemPrompt.push({
        type: 'text',
        text: `**CURRENT CONTEXT:** User is asking about implementation...`
      });
    }
    
    const requestBody = JSON.stringify({
      model: model,
      max_tokens: maxTokens,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages
    });
    
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
    
    // ... standard HTTPS request handling
  });
}
```

### 4. POST-PROCESSING ENFORCEMENT

```javascript
function enforceResponseLength(responseText, maxWords = 400) {
  const words = responseText.trim().split(/\s+/);
  
  if (words.length <= maxWords) return responseText;
  
  // Find last complete sentence within limit
  const truncated = words.slice(0, maxWords).join(' ');
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastSentenceEnd > maxWords * 0.8) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}
```

### 5. MAIN HANDLER (Response Flow)

```javascript
// Inside handler after getting user message:

const modelSelection = selectModel(message);

const startTime = Date.now();
const anthropicResponse = await callAnthropic(
  session.messages,
  modelSelection.model,
  modelSelection.maxTokens,
  leadContext,
  language
);

const responseTime = Date.now() - startTime;
let assistantMessage = anthropicResponse.content[0].text;

// Enforce response length (post-processing safety net) - HARD 150 WORD LIMIT
assistantMessage = enforceResponseLength(assistantMessage, 150);

// Log response metrics
logResponseMetrics(assistantMessage, sessionId);
```

## OBSERVATIONS

1. **maxTokens is being passed correctly** (200-300 range)
2. **System prompt explicitly forbids headers/tables**
3. **Post-processing enforces 150 word max**
4. **BUT: User still receives 400+ word responses with headers/tables**

## WHAT WE TRIED (FAILED)

1. ✗ Reducing token budgets progressively (started at 600/800, now at 200/300)
2. ✗ Stricter system prompt language
3. ✗ Adding "GOOD EXAMPLE" and "BAD EXAMPLE" to system prompt
4. ✗ Post-processing enforcement at 150 words
5. ✗ Two-pass approach (generate full, then compress) - didn't execute properly

## QUESTIONS FOR DEBUG

1. **Is maxTokens actually limiting output?** Or does Claude ignore it when system prompt is long?
2. **Does cache_control interfere with format instructions?** Are cached blocks ignoring new format rules?
3. **Is temperature: 0.7 too high?** Does lower temp help with instruction following?
4. **Should headers/tables be stripped via regex post-processing** instead of relying on instruction?
5. **Is the system prompt too long/complex** for the model to follow all rules simultaneously?

## FULL FILE LOCATION

Complete chat.js: `/home/futurebit/.openclaw/workspace/bitcoinsingularity-website/netlify/functions/chat.js`
