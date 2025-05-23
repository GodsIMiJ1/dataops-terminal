/**
 * BrightDataService.ts
 * 
 * Service for interacting with Bright Data collectors and APIs
 * Provides methods for extracting data from various sources using Bright Data's infrastructure
 */

// Environment variables for Bright Data configuration
const BRIGHT_DATA_API_KEY = import.meta.env.VITE_BRIGHT_DATA_API_KEY || 'hl_77b8d574';
const BRIGHT_DATA_COLLECTOR_ID = import.meta.env.VITE_BRIGHT_DATA_COLLECTOR_ID || 'c_maxhmeem10gh3pyrh8';

/**
 * Run the DOI collector to extract metadata from scientific articles
 * @param doi - Digital Object Identifier for the scientific article
 * @returns Structured data including title, authors, publication date, abstract, and URL
 */
export async function runDoiCollector(doi: string) {
  try {
    console.log(`Running DOI collector for: ${doi}`);
    
    const response = await fetch(`https://api.brightdata.com/collector/${BRIGHT_DATA_COLLECTOR_ID}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
      },
      body: JSON.stringify({ doi })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bright Data Collector Failed:', errorText);
      throw new Error(`Bright Data Collector Failed: ${response.status} ${response.statusText}`);
    }
    
    const jobData = await response.json();
    console.log('Collection job started:', jobData);
    
    // Wait for the job to complete and get results
    return await waitForCollectionResults(jobData.job_id);
  } catch (error) {
    console.error('Error running DOI collector:', error);
    throw error;
  }
}

/**
 * Wait for a collection job to complete and retrieve the results
 * @param jobId - The ID of the collection job
 * @returns The results of the collection
 */
async function waitForCollectionResults(jobId: string, maxAttempts = 10, delayMs = 1000) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      // Check job status
      const statusResponse = await fetch(`https://api.brightdata.com/collector/${BRIGHT_DATA_COLLECTOR_ID}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to get job status: ${statusResponse.status} ${statusResponse.statusText}`);
      }
      
      const statusData = await statusResponse.json();
      console.log(`Job status (attempt ${attempts}):`, statusData.status);
      
      // If job is completed, get the results
      if (statusData.status === 'completed') {
        const resultsResponse = await fetch(`https://api.brightdata.com/collector/${BRIGHT_DATA_COLLECTOR_ID}/jobs/${jobId}/results`, {
          headers: {
            'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
          }
        });
        
        if (!resultsResponse.ok) {
          throw new Error(`Failed to get job results: ${resultsResponse.status} ${resultsResponse.statusText}`);
        }
        
        return await resultsResponse.json();
      }
      
      // If job failed, throw an error
      if (statusData.status === 'failed') {
        throw new Error(`Collection job failed: ${statusData.error || 'Unknown error'}`);
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`Error checking job status (attempt ${attempts}):`, error);
      
      // On last attempt, throw the error
      if (attempts >= maxAttempts) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error(`Collection job did not complete after ${maxAttempts} attempts`);
}

/**
 * Run a general web scraping collector
 * @param url - URL to scrape
 * @param selectors - CSS selectors to extract data from
 * @returns Structured data based on the provided selectors
 */
export async function runWebScraper(url: string, selectors: Record<string, string>) {
  try {
    console.log(`Running web scraper for: ${url}`);
    
    const response = await fetch(`https://api.brightdata.com/collector/${BRIGHT_DATA_COLLECTOR_ID}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
      },
      body: JSON.stringify({ url, selectors })
    });

    if (!response.ok) {
      throw new Error(`Bright Data Web Scraper Failed: ${response.status} ${response.statusText}`);
    }
    
    const jobData = await response.json();
    return await waitForCollectionResults(jobData.job_id);
  } catch (error) {
    console.error('Error running web scraper:', error);
    throw error;
  }
}

export default {
  runDoiCollector,
  runWebScraper
};
