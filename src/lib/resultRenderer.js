/**
 * Result Renderer - Formats API results for rich terminal display
 * Creates beautiful, readable output for different command types
 */

/**
 * Render command results for terminal display
 * @param {Object} result - Command execution result
 * @returns {string} Formatted terminal output
 */
export function renderResult(result) {
  const { success, command, data, error, mockData, confidence, timestamp } = result;
  
  let output = '';
  
  // Header
  output += `\n${'='.repeat(60)}\n`;
  output += `🤖 GHOSTCLI - ${command.toUpperCase()} OPERATION\n`;
  output += `${'='.repeat(60)}\n`;
  
  if (!success && error) {
    output += `❌ ERROR: ${error}\n`;
    if (mockData) {
      output += `📋 SHOWING MOCK DATA:\n\n`;
      return output + renderCommandData(command, mockData);
    }
    return output;
  }
  
  // Success indicator
  output += `✅ STATUS: SUCCESS\n`;
  output += `🎯 CONFIDENCE: ${Math.round(confidence * 100)}%\n`;
  output += `⏰ TIMESTAMP: ${new Date(timestamp).toLocaleString()}\n\n`;
  
  // Render command-specific data
  output += renderCommandData(command, data || mockData);
  
  // Footer
  output += `\n${'='.repeat(60)}\n`;
  
  return output;
}

/**
 * Render data based on command type
 */
function renderCommandData(command, data) {
  switch (command) {
    case 'discover':
      return renderDiscoverResults(data);
    case 'access':
      return renderAccessResults(data);
    case 'extract':
      return renderExtractResults(data);
    case 'interact':
      return renderInteractResults(data);
    default:
      return renderGenericResults(data);
  }
}

/**
 * Render discover command results
 */
function renderDiscoverResults(data) {
  let output = `🔍 DISCOVERY RESULTS\n`;
  output += `-`.repeat(40) + '\n\n';
  
  if (data.mock) {
    output += `⚠️  MOCK DATA (API key not configured)\n\n`;
  }
  
  if (data.results && data.results.length > 0) {
    data.results.forEach((result, index) => {
      output += `[${index + 1}] ${result.title}\n`;
      output += `    🔗 ${result.url}\n`;
      output += `    📝 ${result.snippet}\n`;
      if (result.source) {
        output += `    📊 Source: ${result.source}\n`;
      }
      output += '\n';
    });
    
    output += `📈 Total Results: ${data.total || data.results.length}\n`;
  } else {
    output += `❌ No results found\n`;
  }
  
  return output;
}

/**
 * Render access command results
 */
function renderAccessResults(data) {
  let output = `🌐 WEBSITE ACCESS REPORT\n`;
  output += `-`.repeat(40) + '\n\n';
  
  if (data.mock) {
    output += `⚠️  MOCK DATA (API key not configured)\n\n`;
  }
  
  output += `🎯 Target URL: ${data.url}\n`;
  output += `📊 Status: ${data.status || 'Unknown'}\n`;
  
  if (data.title) {
    output += `📄 Page Title: ${data.title}\n`;
  }
  
  if (data.content) {
    output += `📝 Content Preview:\n`;
    output += `    ${data.content.substring(0, 200)}${data.content.length > 200 ? '...' : ''}\n`;
  }
  
  if (data.screenshots && data.screenshots.length > 0) {
    output += `📸 Screenshots: ${data.screenshots.length} captured\n`;
  }
  
  return output;
}

/**
 * Render extract command results
 */
function renderExtractResults(data) {
  let output = `📊 DATA EXTRACTION RESULTS\n`;
  output += `-`.repeat(40) + '\n\n';
  
  if (data.mock) {
    output += `⚠️  MOCK DATA (API key not configured)\n\n`;
  }
  
  if (data.url) {
    output += `🎯 Source URL: ${data.url}\n`;
  }
  
  if (data.schema) {
    output += `📋 Schema: ${Array.isArray(data.schema) ? data.schema.join(', ') : data.schema}\n`;
  }
  
  output += '\n';
  
  // Handle different data formats
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach((item, index) => {
      output += `📦 Record ${index + 1}:\n`;
      Object.entries(item).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          output += `    ${key}: ${value.join(', ')}\n`;
        } else {
          output += `    ${key}: ${value}\n`;
        }
      });
      output += '\n';
    });
  } else if (data.title || data.authors) {
    // Handle DOI/scientific paper format
    output += `📄 Scientific Paper:\n`;
    if (data.title) output += `    Title: ${data.title}\n`;
    if (data.authors) output += `    Authors: ${Array.isArray(data.authors) ? data.authors.join(', ') : data.authors}\n`;
    if (data.publicationDate) output += `    Published: ${data.publicationDate}\n`;
    if (data.abstract) {
      output += `    Abstract: ${data.abstract.substring(0, 300)}${data.abstract.length > 300 ? '...' : ''}\n`;
    }
    if (data.link) output += `    Link: ${data.link}\n`;
  } else {
    output += `📋 Raw Data:\n`;
    output += JSON.stringify(data, null, 2);
  }
  
  return output;
}

/**
 * Render interact command results
 */
function renderInteractResults(data) {
  let output = `🤖 INTERACTION RESULTS\n`;
  output += `-`.repeat(40) + '\n\n';
  
  if (data.mock) {
    output += `⚠️  MOCK DATA (API key not configured)\n\n`;
  }
  
  output += `🎯 Target URL: ${data.url}\n`;
  
  if (data.actions) {
    output += `⚡ Actions: ${data.actions}\n`;
  }
  
  if (data.result) {
    output += `📊 Result: ${data.result}\n`;
  }
  
  if (data.screenshots && data.screenshots.length > 0) {
    output += `📸 Screenshots: ${data.screenshots.join(', ')}\n`;
  }
  
  return output;
}

/**
 * Render generic results
 */
function renderGenericResults(data) {
  let output = `📋 RESULTS\n`;
  output += `-`.repeat(40) + '\n\n';
  
  if (typeof data === 'string') {
    output += data;
  } else {
    output += JSON.stringify(data, null, 2);
  }
  
  return output;
}

/**
 * Render error message
 */
export function renderError(error, command) {
  let output = '';
  
  output += `\n${'='.repeat(60)}\n`;
  output += `❌ GHOSTCLI - ERROR\n`;
  output += `${'='.repeat(60)}\n`;
  output += `Command: ${command || 'Unknown'}\n`;
  output += `Error: ${error.message || error}\n`;
  output += `Time: ${new Date().toLocaleString()}\n`;
  output += `${'='.repeat(60)}\n`;
  
  return output;
}

/**
 * Render loading message
 */
export function renderLoading(command, query) {
  return `\n🔄 Processing ${command.toUpperCase()} command: "${query}"\n⏳ Please wait...\n`;
}

export default { renderResult, renderError, renderLoading };
