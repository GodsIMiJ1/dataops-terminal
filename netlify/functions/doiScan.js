
/**
 * doiScan.js - Netlify Serverless Function
 *
 * This function scans a DOI (Digital Object Identifier) and retrieves metadata
 * from the CrossRef API. It also performs a basic "flame detection" analysis
 * to identify potentially controversial or sensitive research.
 */

const axios = require("axios");

// Keywords that might indicate sensitive or controversial research
const FLAME_KEYWORDS = [
  'controversial', 'debate', 'disputed', 'retracted', 'withdrawn',
  'conspiracy', 'classified', 'censored', 'banned', 'restricted',
  'sensitive', 'confidential', 'classified', 'secret', 'undisclosed',
  'bioweapon', 'warfare', 'military', 'intelligence', 'surveillance',
  'privacy', 'tracking', 'monitoring', 'espionage', 'hacking',
  'vulnerability', 'exploit', 'backdoor', 'zero-day', 'breach'
];

/**
 * Analyzes text for potentially sensitive or controversial content
 * @param {string} text - The text to analyze
 * @returns {string} - Threat level assessment
 */
function detectFlameContent(text) {
  if (!text) return 'UNKNOWN';

  const textLower = text.toLowerCase();
  const matches = FLAME_KEYWORDS.filter(keyword => textLower.includes(keyword.toLowerCase()));

  if (matches.length === 0) return 'LOW';
  if (matches.length <= 2) return 'MODERATE';
  if (matches.length <= 5) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Formats author names from CrossRef data
 * @param {Array} authors - The authors array from CrossRef
 * @returns {Array} - Formatted author names
 */
function formatAuthors(authors) {
  if (!authors || !Array.isArray(authors)) return ['Unknown'];

  return authors.map(author => {
    if (author.given && author.family) {
      return `${author.given} ${author.family}`;
    } else if (author.name) {
      return author.name;
    } else if (author.family) {
      return author.family;
    }
    return 'Unknown';
  });
}

/**
 * Extracts and formats the publication date
 * @param {Object} data - The CrossRef data
 * @returns {string} - Formatted date
 */
function extractDate(data) {
  if (!data) return 'Unknown';

  // Try different date fields
  const dateFields = [
    'published-print',
    'published-online',
    'created',
    'issued'
  ];

  for (const field of dateFields) {
    if (data[field] && data[field]['date-parts'] && data[field]['date-parts'][0]) {
      const dateParts = data[field]['date-parts'][0];
      if (dateParts.length >= 3) {
        return `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}`;
      } else if (dateParts.length >= 2) {
        return `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}`;
      } else if (dateParts.length >= 1) {
        return `${dateParts[0]}`;
      }
    }
  }

  return 'Unknown';
}

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { doi } = JSON.parse(event.body || "{}");

    if (!doi) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'DOI is required' })
      };
    }

    // Clean the DOI
    const cleanDoi = doi.trim().replace(/^https?:\/\/doi.org\//i, '');

    // Fetch metadata from CrossRef API
    const response = await axios.get(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
      headers: {
        'User-Agent': 'R3B3L-4F-Research-Scanner/1.0 (https://github.com/GodsIMiJ1/R3B3L-4F; mailto:research@r3b3l4f.ai)'
      }
    });

    const data = response.data.message;

    // Extract relevant metadata
    const title = data.title ? data.title[0] : 'Unknown Title';
    const authors = formatAuthors(data.author);
    const journal = data['container-title'] ? data['container-title'][0] : 'Unknown Journal';
    const publisher = data.publisher || 'Unknown Publisher';
    const date = extractDate(data);
    const url = data.URL || `https://doi.org/${cleanDoi}`;
    const abstract = data.abstract || '';

    // Perform flame detection
    const titleAndAbstract = `${title} ${abstract}`;
    const flameDetected = detectFlameContent(titleAndAbstract);

    // Prepare the response
    const result = {
      doi: cleanDoi,
      title,
      authors,
      journal,
      publisher,
      date,
      url,
      abstract,
      flameDetected,
      type: data.type || 'unknown',
      subjects: data.subject || [],
      citations: data['is-referenced-by-count'] || 0,
      references: data['references-count'] || 0,
      license: data.license ? data.license[0].URL : null
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error processing DOI:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Internal server error: ${error.message}`
      })
    };
  }
};
