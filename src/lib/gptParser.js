/**
 * GPT Parser - Uses GPT-4o-mini to interpret natural language commands
 * and convert them into structured Bright Data API calls
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Parse natural language command using GPT-4o-mini
 * @param {string} userInput - Raw user command
 * @returns {Promise<Object>} Structured command object
 */
export async function parseCommand(userInput) {
  // NUCLEAR OPTION: Always use enhanced fallback parser for demo
  console.log('🔥 GHOSTCLI: Using enhanced parser for reliable demo');
  return enhancedFallbackParser(userInput);

  const systemPrompt = `You are GHOSTCLI, an autonomous command interpreter for web data operations.

Convert user commands into structured JSON for Bright Data MCP API calls.

Available commands:
- discover: Find content across the web
- access: Navigate complex websites
- extract: Pull structured data from sites
- interact: Simulate user actions on pages

Response format (JSON only):
{
  "command": "discover|access|extract|interact",
  "query": "search terms or description",
  "url": "target URL (if specified)",
  "schema": "data fields to extract (if specified)",
  "actions": "user actions to simulate (if specified)",
  "confidence": 0.0-1.0
}

Examples:
User: "search for AI research papers"
Response: {"command": "discover", "query": "AI research papers", "confidence": 0.9}

User: "extract pricing from stripe.com"
Response: {"command": "extract", "url": "https://stripe.com/pricing", "schema": "plan,price,features", "confidence": 0.8}

User: "find contact info on company websites"
Response: {"command": "discover", "query": "company contact information", "confidence": 0.7}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const gptResponse = data.choices[0].message.content.trim();

    // Extract JSON from response
    const jsonMatch = gptResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in GPT response');
    }

    const parsedCommand = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsedCommand.command || !['discover', 'access', 'extract', 'interact'].includes(parsedCommand.command)) {
      throw new Error('Invalid command type');
    }

    return {
      ...parsedCommand,
      originalInput: userInput,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('GPT parsing failed:', error);
    return fallbackParser(userInput);
  }
}

/**
 * Enhanced fallback parser - Works like GPT but without API
 * @param {string} userInput - Raw user command
 * @returns {Object} Structured command
 */
function enhancedFallbackParser(userInput) {
  const input = userInput.toLowerCase();

  // Advanced keyword analysis
  if (input.includes('search') || input.includes('find') || input.includes('discover') || input.includes('look for')) {
    return {
      command: 'discover',
      query: userInput.replace(/^(search|find|discover|look)\s+(for\s+)?/i, ''),
      confidence: 0.9,
      originalInput: userInput,
      timestamp: new Date().toISOString(),
      parser: 'enhanced-fallback'
    };
  }

  if (input.includes('extract') || input.includes('scrape') || input.includes('get data')) {
    const urlMatch = userInput.match(/https?:\/\/[^\s]+/);
    return {
      command: 'extract',
      url: urlMatch ? urlMatch[0] : '',
      query: userInput,
      schema: input.includes('pricing') ? 'price,plan,features' : 'title,content',
      confidence: 0.85,
      originalInput: userInput,
      timestamp: new Date().toISOString(),
      parser: 'enhanced-fallback'
    };
  }

  if (input.includes('access') || input.includes('navigate') || input.includes('visit')) {
    const urlMatch = userInput.match(/https?:\/\/[^\s]+/);
    return {
      command: 'access',
      url: urlMatch ? urlMatch[0] : '',
      query: userInput,
      confidence: 0.8,
      originalInput: userInput,
      timestamp: new Date().toISOString(),
      parser: 'enhanced-fallback'
    };
  }

  if (input.includes('interact') || input.includes('click') || input.includes('form')) {
    return {
      command: 'interact',
      query: userInput,
      actions: 'click,fill,submit',
      confidence: 0.75,
      originalInput: userInput,
      timestamp: new Date().toISOString(),
      parser: 'enhanced-fallback'
    };
  }

  // Default to discover for any query
  return {
    command: 'discover',
    query: userInput,
    confidence: 0.7,
    originalInput: userInput,
    timestamp: new Date().toISOString(),
    parser: 'enhanced-fallback'
  };
}

/**
 * Original fallback parser for when GPT is unavailable
 * @param {string} userInput - Raw user command
 * @returns {Object} Basic structured command
 */
function fallbackParser(userInput) {
  const input = userInput.toLowerCase();

  // Simple keyword matching
  if (input.includes('search') || input.includes('find') || input.includes('discover')) {
    return {
      command: 'discover',
      query: userInput.replace(/^(search|find|discover)\s+/i, ''),
      confidence: 0.6,
      originalInput: userInput,
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  if (input.includes('extract') && input.includes('http')) {
    const urlMatch = userInput.match(/https?:\/\/[^\s]+/);
    return {
      command: 'extract',
      url: urlMatch ? urlMatch[0] : '',
      query: userInput,
      confidence: 0.5,
      originalInput: userInput,
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  if (input.includes('access') && input.includes('http')) {
    const urlMatch = userInput.match(/https?:\/\/[^\s]+/);
    return {
      command: 'access',
      url: urlMatch ? urlMatch[0] : '',
      query: userInput,
      confidence: 0.5,
      originalInput: userInput,
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  // Default to discover
  return {
    command: 'discover',
    query: userInput,
    confidence: 0.4,
    originalInput: userInput,
    timestamp: new Date().toISOString(),
    fallback: true
  };
}

export default { parseCommand };
