/**
 * GHOSTCLI Universal Web Data Collector
 * Simple, reliable collector for web scraping operations
 */

async function scrapePage(context, dependencies) {
  const { url, query, selectors } = context.input;
  
  try {
    // Create new page
    const page = await context.newPage();
    
    // If we have a URL, navigate to it
    if (url) {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract data based on selectors or default elements
      const data = await page.evaluate((selectors) => {
        const result = {};
        
        // Default selectors if none provided
        const defaultSelectors = {
          title: 'h1, title, .title, .headline, .article-title',
          content: 'p, .content, .description, .abstract, .summary',
          links: 'a[href]',
          price: '.price, .cost, .pricing, [class*="price"]',
          email: '[href^="mailto:"], [class*="email"], [id*="email"]'
        };
        
        const selectorsToUse = selectors || defaultSelectors;
        
        for (const [key, selector] of Object.entries(selectorsToUse)) {
          try {
            if (key === 'links') {
              const links = Array.from(document.querySelectorAll(selector));
              result[key] = links.slice(0, 5).map(link => ({
                text: link.textContent?.trim() || '',
                url: link.href || ''
              }));
            } else {
              const element = document.querySelector(selector);
              result[key] = element ? element.textContent?.trim() || element.innerText?.trim() || '' : '';
            }
          } catch (e) {
            result[key] = '';
          }
        }
        
        return result;
      }, selectors);
      
      return {
        url: page.url(),
        data,
        timestamp: new Date().toISOString(),
        success: true
      };
    }
    
    // If we have a search query, perform a Google search
    if (query) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract search results
      const results = await page.evaluate(() => {
        const searchResults = [];
        const resultElements = document.querySelectorAll('div.g, .search-result');
        
        for (let i = 0; i < Math.min(resultElements.length, 5); i++) {
          const element = resultElements[i];
          const titleElement = element.querySelector('h3, .title');
          const linkElement = element.querySelector('a[href]');
          const snippetElement = element.querySelector('.VwiC3b, .snippet, .description');
          
          if (titleElement && linkElement) {
            searchResults.push({
              title: titleElement.textContent?.trim() || '',
              url: linkElement.href || '',
              snippet: snippetElement?.textContent?.trim() || ''
            });
          }
        }
        
        return searchResults;
      });
      
      return {
        query,
        results,
        total: results.length,
        timestamp: new Date().toISOString(),
        success: true
      };
    }
    
    throw new Error('No URL or query provided');
    
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
      success: false
    };
  }
}

// Export for Bright Data
module.exports = { scrapePage };
