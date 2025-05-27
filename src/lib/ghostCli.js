/**
 * GHOSTCLI - Unified autonomous CLI entry point
 * Combines GPT parsing, Bright Data routing, and rich terminal output
 */

import { parseCommand } from './gptParser.js';
import { executeCommand } from './dataopsRouter.js';
import { renderResult, renderError, renderLoading } from './resultRenderer.js';
import { ClaudeCodeIntegration } from './claudeCodeIntegration.js';

/**
 * Main GHOSTCLI processor
 * @param {string} userInput - Raw natural language command
 * @returns {Promise<string>} Formatted terminal output
 */
export async function processCommand(userInput) {
  try {
    // Step 1: Parse natural language with GPT
    console.log('🧠 Parsing command with GPT-4o-mini...');
    const parsedCommand = await parseCommand(userInput);

    if (parsedCommand.fallback) {
      console.log('⚠️  Using fallback parser (OpenAI API unavailable)');
    }

    // Step 2: Show loading message
    const loadingMessage = renderLoading(parsedCommand.command, parsedCommand.query || parsedCommand.url);

    // Step 3: Execute command via Bright Data
    console.log(`🚀 Executing ${parsedCommand.command} command...`);
    const result = await executeCommand(parsedCommand);

    // Step 4: Render results for terminal
    const output = renderResult(result);

    return output;

  } catch (error) {
    console.error('GHOSTCLI Error:', error);
    return renderError(error, 'unknown');
  }
}

/**
 * Process multiple commands in sequence
 * @param {string[]} commands - Array of natural language commands
 * @returns {Promise<string[]>} Array of formatted outputs
 */
export async function processBatch(commands) {
  const results = [];

  for (const command of commands) {
    console.log(`\n📝 Processing: "${command}"`);
    const result = await processCommand(command);
    results.push(result);
  }

  return results;
}

/**
 * Interactive CLI session
 * @param {Function} outputCallback - Function to handle output
 * @param {Function} inputCallback - Function to get user input
 */
export async function startInteractiveSession(outputCallback, inputCallback) {
  outputCallback(`
🤖 GHOSTCLI v1.0 - Autonomous Web Data Operations
${'='.repeat(60)}

Available commands:
• "search for AI research papers"
• "extract pricing from stripe.com"
• "access complex website with login"
• "interact with search form on site"

Type 'exit' to quit, 'help' for more info.
${'='.repeat(60)}
`);

  while (true) {
    try {
      const userInput = await inputCallback('ghostcli> ');

      if (userInput.toLowerCase() === 'exit') {
        outputCallback('\n👋 GHOSTCLI session ended. Stay autonomous!\n');
        break;
      }

      if (userInput.toLowerCase() === 'help') {
        outputCallback(getHelpText());
        continue;
      }

      if (!userInput.trim()) {
        continue;
      }

      const result = await processCommand(userInput);
      outputCallback(result);

    } catch (error) {
      outputCallback(renderError(error, 'interactive'));
    }
  }
}

/**
 * Get help text
 */
function getHelpText() {
  return `
🤖 GHOSTCLI - BRIGHT DATA MCP OPERATIONS
${'='.repeat(50)}

GHOSTCLI converts natural language into Bright Data MCP API calls:

📍 DISCOVER - Find relevant content across the open web
   Examples:
   • "search for AI research papers"
   • "find pricing information for SaaS tools"
   • "discover contact pages on company sites"

🌐 ACCESS - Navigate even the most complex or protected websites
   Examples:
   • "access https://example.com with authentication"
   • "navigate to protected dashboard"
   • "access site behind login wall"

📊 EXTRACT - Pull structured, real-time data at scale
   Examples:
   • "extract pricing from stripe.com"
   • "get contact info from company website"
   • "extract article metadata from DOI"

🤖 INTERACT - Engage with dynamic, JavaScript-rendered pages as a human would
   Examples:
   • "fill out contact form on website"
   • "search for products on ecommerce site"
   • "click through multi-step process"

🔧 SYSTEM COMMANDS:
   • !ghost-setup - Validate Bright Data integration
   • !help - Show this help text

${'='.repeat(50)}
`;
}

/**
 * Validate environment setup
 */
export function validateSetup() {
  const issues = [];

  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    issues.push('❌ OpenAI API key not configured (VITE_OPENAI_API_KEY)');
  } else {
    console.log('✅ OpenAI API key configured');
  }

  if (!import.meta.env.VITE_BRIGHT_DATA_API_KEY) {
    issues.push('⚠️  Bright Data API key not configured (will use mock data)');
  } else {
    console.log('✅ Bright Data API key configured');
  }

  if (!import.meta.env.VITE_BRIGHT_DATA_COLLECTOR_ID) {
    issues.push('⚠️  Bright Data Collector ID not configured');
  } else {
    console.log('✅ Bright Data Collector ID configured');
  }

  return {
    ready: issues.filter(i => i.includes('❌')).length === 0,
    issues
  };
}

export default {
  processCommand,
  processBatch,
  startInteractiveSession,
  validateSetup
};
