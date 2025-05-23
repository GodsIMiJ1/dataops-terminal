/**
 * dataCollector.js - Netlify Serverless Function
 *
 * This function interfaces with Bright Data's Data Collector to retrieve
 * structured data from pre-configured collectors.
 */

const axios = require('axios');

// Bright Data Data Collector Configuration
const COLLECTOR_ID = process.env.VITE_BRIGHT_DATA_COLLECTOR_ID || 'c_maxhmeem10gh3pyrh8';
const BRIGHT_DATA_API_KEY = process.env.VITE_BRIGHT_DATA_API_KEY || 'hl_77b8d574';
const BRIGHT_DATA_API_URL = `https://brightdata.com/api/data_collector/collector/${COLLECTOR_ID}`;

/**
 * Run a data collection job
 * @param {Object} params - Collection parameters
 * @returns {Promise<Object>} - Collection results
 */
const runCollection = async (params) => {
  try {
    const response = await axios.post(`${BRIGHT_DATA_API_URL}/start`, params, {
      headers: {
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error running collection:', error);
    throw error;
  }
};

/**
 * Get the status of a collection job
 * @param {string} jobId - Collection job ID
 * @returns {Promise<Object>} - Job status
 */
const getCollectionStatus = async (jobId) => {
  try {
    const response = await axios.get(`${BRIGHT_DATA_API_URL}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting collection status:', error);
    throw error;
  }
};

/**
 * Get the results of a collection job
 * @param {string} jobId - Collection job ID
 * @returns {Promise<Object>} - Job results
 */
const getCollectionResults = async (jobId) => {
  try {
    const response = await axios.get(`${BRIGHT_DATA_API_URL}/jobs/${jobId}/results`, {
      headers: {
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting collection results:', error);
    throw error;
  }
};

/**
 * Get collector metadata
 * @returns {Promise<Object>} - Collector metadata
 */
const getCollectorMetadata = async () => {
  try {
    const response = await axios.get(`${BRIGHT_DATA_API_URL}`, {
      headers: {
        'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting collector metadata:', error);
    throw error;
  }
};

/**
 * Wait for a collection job to complete
 * @param {string} jobId - Collection job ID
 * @param {number} maxWaitTime - Maximum wait time in milliseconds
 * @param {number} checkInterval - Check interval in milliseconds
 * @returns {Promise<Object>} - Job status
 */
const waitForCompletion = async (jobId, maxWaitTime = 60000, checkInterval = 2000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getCollectionStatus(jobId);

    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }

    // Wait for the check interval
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }

  // If we've reached here, the job hasn't completed within the max wait time
  return { status: 'timeout', message: 'Job did not complete within the maximum wait time' };
};

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
    const { action, params = {}, jobId } = JSON.parse(event.body || "{}");

    if (!action) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Action is required' })
      };
    }

    let result;

    switch (action) {
      case 'metadata':
        result = await getCollectorMetadata();
        break;

      case 'run':
        result = await runCollection(params);
        break;

      case 'status':
        if (!jobId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Job ID is required for status action' })
          };
        }
        result = await getCollectionStatus(jobId);
        break;

      case 'results':
        if (!jobId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Job ID is required for results action' })
          };
        }
        result = await getCollectionResults(jobId);
        break;

      case 'collect':
        // Run a collection and wait for results
        const runResult = await runCollection(params);
        const jobStatus = await waitForCompletion(runResult.job_id);

        if (jobStatus.status === 'completed') {
          const collectionResults = await getCollectionResults(runResult.job_id);
          result = {
            job_id: runResult.job_id,
            status: jobStatus,
            results: collectionResults
          };
        } else {
          result = {
            job_id: runResult.job_id,
            status: jobStatus,
            message: 'Collection did not complete successfully'
          };
        }
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Unknown action: ${action}` })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result)
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
