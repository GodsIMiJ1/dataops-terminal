/**
 * OpenAIProxyServer.js
 * 
 * Secure proxy server for relaying requests from the frontend to OpenAI API
 * This runs in Node.js environment and provides a REST API for the frontend to interact with OpenAI
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PROXY_PORT || 5000;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://r3b3l-4f.netlify.app',  // Main Netlify site
  'https://r3b3l-4f-dev.netlify.app', // Development Netlify site
  'http://localhost:5173',         // Local Vite development
  'http://localhost:3000'          // Alternative local development
];

// OpenAI API endpoint
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Authentication token (should be environment variable in production)
const API_TOKEN = process.env.API_TOKEN || 'r3b3l-4f-secure-token';

// OpenAI API key (should be environment variable)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Request size limit (10MB)
const REQUEST_SIZE_LIMIT = '10mb';

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(helmet()); // Security headers
app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));
app.use(apiLimiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Token'],
  credentials: true
}));

// Middleware to verify API token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-api-token'] || req.headers['authorization']?.split(' ')[1];
  
  if (!token || token !== API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  next();
};

// Input sanitization
const sanitizeInput = (input) => {
  // Basic sanitization - remove any potentially harmful characters
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, '');
  } else if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
};

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

/**
 * Proxy endpoint for OpenAI chat completions API
 * POST /api/openai/chat
 */
app.post('/api/openai/chat', verifyToken, async (req, res) => {
  try {
    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured on the server' });
    }
    
    // Sanitize input
    const sanitizedBody = sanitizeInput(req.body);
    
    // Validate required fields
    if (!sanitizedBody.messages || !Array.isArray(sanitizedBody.messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    // Prepare request for OpenAI
    const openaiRequest = {
      model: sanitizedBody.model || 'gpt-4o',
      messages: sanitizedBody.messages,
      temperature: sanitizedBody.temperature || 0.7,
      max_tokens: sanitizedBody.max_tokens || 2000,
      top_p: sanitizedBody.top_p || 1,
      frequency_penalty: sanitizedBody.frequency_penalty || 0,
      presence_penalty: sanitizedBody.presence_penalty || 0
    };
    
    // Log the request (excluding sensitive data)
    console.log(`Proxying request to OpenAI for model: ${openaiRequest.model}`);
    
    // Forward the request to OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(openaiRequest)
    });
    
    // Check if the response is OK
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Unknown error' };
      }
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json(errorData);
    }
    
    // Forward the response back to the client
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: OPENAI_API_KEY ? 'ok' : 'warning',
    timestamp: new Date().toISOString(),
    message: OPENAI_API_KEY ? 'OpenAI proxy is operational' : 'OpenAI API key is not configured'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`OpenAIProxyServer running on port ${PORT}`);
  console.log(`Proxying requests to OpenAI API`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`OpenAI API key configured: ${Boolean(OPENAI_API_KEY)}`);
});

module.exports = app;
