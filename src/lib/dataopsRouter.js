/**
 * DataOps Router - Maps GPT output to Bright Data API calls
 * Handles the execution of structured commands via Bright Data MCP
 */

import { runDoiCollector } from './BrightDataService';

const BRIGHT_DATA_API_KEY = import.meta.env.VITE_BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_COLLECTOR_ID = import.meta.env.VITE_BRIGHT_DATA_COLLECTOR_ID;

/**
 * Execute a structured command via Bright Data APIs
 * @param {Object} parsedCommand - Structured command from GPT parser
 * @returns {Promise<Object>} Execution result
 */
export async function executeCommand(parsedCommand) {
  const { command, query, url, schema, actions, confidence } = parsedCommand;

  console.log(`🔄 Executing ${command.toUpperCase()} command...`);

  try {
    let result;

    switch (command) {
      case 'discover':
        result = await executeDiscover(query);
        break;

      case 'access':
        result = await executeAccess(url || query);
        break;

      case 'extract':
        result = await executeExtract(url, schema);
        break;

      case 'interact':
        result = await executeInteract(url, actions);
        break;

      default:
        throw new Error(`Unknown command: ${command}`);
    }

    return {
      success: true,
      command,
      data: result,
      confidence,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Command execution failed:`, error);

    // Return mock data if API fails
    return {
      success: false,
      command,
      error: error.message,
      mockData: generateMockData(command, query, url),
      confidence,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Execute discover command - Find content across the web
 */
async function executeDiscover(query) {
  if (!BRIGHT_DATA_API_KEY) {
    console.warn('No Bright Data API key, using mock data');
    return generateMockDiscoverData(query);
  }

  try {
    // Try multiple API endpoints for discovery
    const endpoints = [
      `https://api.brightdata.com/dca/trigger_immediate`,
      `https://api.brightdata.com/datasets/trigger`,
      `https://brightdata.com/api/trigger`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
          },
          body: JSON.stringify({
            query: query,
            limit: 10,
            format: 'json'
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Bright Data API success:', endpoint);
          return data;
        }
      } catch (e) {
        console.warn(`Endpoint ${endpoint} failed:`, e.message);
        continue;
      }
    }

    throw new Error('All Bright Data endpoints failed');

  } catch (error) {
    console.warn(`Bright Data discovery failed: ${error.message}, using mock data`);
    return generateMockDiscoverData(query);
  }
}

/**
 * Execute access command - Navigate complex websites
 */
async function executeAccess(url) {
  if (!BRIGHT_DATA_API_KEY) {
    return generateMockAccessData(url);
  }

  const response = await fetch('https://api.brightdata.com/sessions/browser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
    },
    body: JSON.stringify({
      url,
      render: true,
      wait_for: 'networkidle'
    })
  });

  if (!response.ok) {
    throw new Error(`Bright Data API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Execute extract command - Pull structured data
 */
async function executeExtract(url, schema) {
  if (!BRIGHT_DATA_API_KEY) {
    return generateMockExtractData(url, schema);
  }

  // Check if this is a DOI extraction
  if (url && (url.includes('doi.org') || url.includes('arxiv.org')) || schema === 'doi') {
    const doiMatch = url.match(/10\.\d{4,}\/[^\s]+/) || url.match(/arxiv\.org\/abs\/([^\/\s]+)/);
    if (doiMatch) {
      return await runDoiCollector(doiMatch[0]);
    }
  }

  // Use the collector with URL input
  const response = await fetch(`https://brightdata.com/api/collector/${BRIGHT_DATA_COLLECTOR_ID}/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
    },
    body: JSON.stringify({
      input: {
        url: url,
        selectors: schema ? schema.split(',') : ['title', 'content', 'links']
      }
    })
  });

  if (!response.ok) {
    console.warn(`Bright Data API error: ${response.status}, falling back to mock data`);
    return generateMockExtractData(url, schema);
  }

  return await response.json();
}

/**
 * Execute interact command - Simulate user actions
 */
async function executeInteract(url, actions) {
  if (!BRIGHT_DATA_API_KEY) {
    return generateMockInteractData(url, actions);
  }

  const response = await fetch('https://api.brightdata.com/sessions/interact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
    },
    body: JSON.stringify({
      url,
      actions: parseActions(actions)
    })
  });

  if (!response.ok) {
    throw new Error(`Bright Data API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Parse action string into structured actions
 */
function parseActions(actionsString) {
  if (!actionsString) return [];

  // Simple action parsing - can be enhanced
  return actionsString.split(',').map(action => {
    const [type, selector, value] = action.split(':');
    return { type: type?.trim(), selector: selector?.trim(), value: value?.trim() };
  });
}

/**
 * Generate mock data for different commands
 */
function generateMockData(command, query, url) {
  switch (command) {
    case 'discover':
      return generateMockDiscoverData(query);
    case 'access':
      return generateMockAccessData(url);
    case 'extract':
      return generateMockExtractData(url);
    case 'interact':
      return generateMockInteractData(url);
    default:
      return { message: 'Mock data not available' };
  }
}

function generateMockDiscoverData(query) {
  return {
    results: [
      {
        title: `Research on ${query}`,
        url: 'https://example.com/research-1',
        snippet: `Comprehensive study about ${query} and its applications...`,
        source: 'Academic Journal'
      },
      {
        title: `${query} - Industry Report`,
        url: 'https://example.com/report-2',
        snippet: `Latest trends and developments in ${query}...`,
        source: 'Industry Publication'
      },
      {
        title: `Best Practices for ${query}`,
        url: 'https://example.com/guide-3',
        snippet: `Expert recommendations and guidelines for ${query}...`,
        source: 'Professional Blog'
      }
    ],
    total: 3,
    query,
    mock: true
  };
}

function generateMockAccessData(url) {
  return {
    url,
    status: 'success',
    title: 'Website Title',
    content: 'Successfully accessed website content...',
    screenshots: ['screenshot1.png'],
    mock: true
  };
}

function generateMockExtractData(url, schema) {
  return {
    url,
    schema,
    data: [
      {
        title: 'Sample Title',
        price: '$99/month',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      }
    ],
    mock: true
  };
}

function generateMockInteractData(url, actions) {
  return {
    url,
    actions,
    result: 'Interaction completed successfully',
    screenshots: ['before.png', 'after.png'],
    mock: true
  };
}

/**
 * Test Bright Data API connection
 */
export async function testBrightDataConnection() {
  if (!BRIGHT_DATA_API_KEY) {
    return { success: false, error: 'No API key configured' };
  }

  try {
    // Test with a simple request
    const response = await fetch('https://api.brightdata.com/dca/datasets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
      }
    });

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      apiKey: BRIGHT_DATA_API_KEY ? `${BRIGHT_DATA_API_KEY.substring(0, 8)}...` : 'Not set'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      apiKey: BRIGHT_DATA_API_KEY ? `${BRIGHT_DATA_API_KEY.substring(0, 8)}...` : 'Not set'
    };
  }
}

export default { executeCommand, testBrightDataConnection };
