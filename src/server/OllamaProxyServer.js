/**
 * OllamaProxyServer.js
 * 
 * Secure proxy server for relaying requests from Netlify frontend to local Ollama instance
 * This runs in Node.js environment and provides a REST API for the frontend to interact with Ollama
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
  'http://localhost:8081',         // Local development
  'http://localhost:3000'          // Alternative local development
];

// Ollama API endpoint
const OLLAMA_API = 'http://localhost:11434/api';

// Authentication token (should be environment variable in production)
const API_TOKEN = process.env.API_TOKEN || 'r3b3l-4f-secure-token';

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
  // This is a simple example - in production, use a proper sanitization library
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
 * Proxy endpoint for Ollama generate API
 * POST /api/ollama/generate
 */
app.post('/api/ollama/generate', verifyToken, async (req, res) => {
  try {
    // Sanitize input
    const sanitizedBody = sanitizeInput(req.body);
    
    // Validate required fields
    if (!sanitizedBody.model || !sanitizedBody.prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }
    
    // Log the request (excluding sensitive data)
    console.log(`Proxying request to Ollama for model: ${sanitizedBody.model}`);
    
    // Forward the request to Ollama
    const response = await fetch(`${OLLAMA_API}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedBody)
    });
    
    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Ollama API error:', errorData);
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
 * Proxy endpoint for Ollama API version check
 * GET /api/ollama/version
 */
app.get('/api/ollama/version', verifyToken, async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_API}/version`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to get Ollama version' });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Version check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`OllamaProxyServer running on port ${PORT}`);
  console.log(`Proxying requests to Ollama API at ${OLLAMA_API}`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

module.exports = app;
