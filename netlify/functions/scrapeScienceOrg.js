/**
 * scrapeScienceOrg.js - Netlify Serverless Function
 * 
 * This function scrapes Science.org for research articles based on a search query
 * and returns structured data about the articles found.
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Keywords that might indicate sensitive or controversial research
const FLAME_KEYWORDS = [
  'controversial', 'debate', 'disputed', 'retracted', 'withdrawn',
  'conspiracy', 'classified', 'censored', 'banned', 'restricted',
  'sensitive', 'confidential', 'classified', 'secret', 'undisclosed',
  'bioweapon', 'warfare', 'military', 'intelligence', 'surveillance',
  'privacy', 'tracking', 'monitoring', 'espionage', 'hacking',
  'vulnerability', 'exploit', 'backdoor', 'zero-day', 'breach',
  'pandemic', 'epidemic', 'outbreak', 'virus', 'pathogen',
  'genetic', 'modification', 'crispr', 'gene', 'editing'
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
 * Scrape Science.org for research articles
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} - Array of article data
 */
async function scrapeScienceOrg(query, limit = 10) {
  try {
    // Construct the search URL
    const searchUrl = `https://www.science.org/action/doSearch?AllField=${encodeURIComponent(query)}`;
    
    // Make the request with a browser-like user agent
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.science.org/'
      }
    });
    
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract articles
    const articles = [];
    
    // Find all article items on the page
    $('.searchResultItem').each((index, element) => {
      if (articles.length >= limit) return false; // Stop if we've reached the limit
      
      const $element = $(element);
      
      // Extract article data
      const title = $element.find('.hlFld-Title a').text().trim();
      const url = $element.find('.hlFld-Title a').attr('href');
      const fullUrl = url ? (url.startsWith('http') ? url : `https://www.science.org${url}`) : '';
      
      const authors = $element.find('.hlFld-ContribAuthor').text().trim();
      const journal = $element.find('.meta__journalName').text().trim();
      const publicationDate = $element.find('.meta__epubDate').text().trim();
      
      // Extract DOI if available
      let doi = '';
      const doiElement = $element.find('.meta__doi');
      if (doiElement.length) {
        doi = doiElement.text().replace('DOI:', '').trim();
      }
      
      // Extract abstract if available
      const abstract = $element.find('.hlFld-Abstract').text().trim();
      
      // Detect flame content
      const flameDetected = detectFlameContent(`${title} ${abstract}`);
      
      // Add to articles array
      articles.push({
        title,
        url: fullUrl,
        authors,
        journal,
        publicationDate,
        doi,
        abstract,
        flameDetected
      });
    });
    
    return articles;
  } catch (error) {
    console.error('Error scraping Science.org:', error);
    throw error;
  }
}

/**
 * Netlify serverless function handler
 */
exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    // Parse the request body
    const { query, limit = 10 } = JSON.parse(event.body || "{}");
    
    if (!query) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Search query is required' })
      };
    }
    
    // Scrape Science.org
    const articles = await scrapeScienceOrg(query, limit);
    
    // Return the results
    return {
      statusCode: 200,
      body: JSON.stringify({
        query,
        count: articles.length,
        articles
      })
    };
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: `Internal server error: ${error.message}`
      })
    };
  }
};
