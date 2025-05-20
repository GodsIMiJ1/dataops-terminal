/**
 * server.js
 *
 * Combined server that runs both the CommandBridge and OllamaProxy servers
 * This allows running both services from a single process
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const COMMAND_PORT = process.env.COMMAND_PORT || 3001;

// Allowed origins for CORS - local only for sovereign operation
const ALLOWED_ORIGINS = [
  'http://localhost:5173',         // Default Vite development server
  'http://127.0.0.1:5173',         // Alternative localhost
  'http://localhost:3000',         // Alternative local development
  'http://127.0.0.1:3000'          // Alternative localhost
];

// Ollama API endpoint
const OLLAMA_API = 'http://localhost:11434/api';

// Authentication token (should be environment variable in production)
const API_TOKEN = process.env.API_TOKEN || 'r3b3l-4f-secure-token';

// Request size limit (10MB)
const REQUEST_SIZE_LIMIT = '10mb';

// Security settings for command execution
const DANGEROUS_COMMANDS = [
  'rm -rf',
  'curl | sh',
  'wget | sh',
  'curl | bash',
  'wget | bash',
  'sudo',
  '> /dev/',
  '| sh',
  '| bash',
  'mkfs',
  'dd if=',
  'format',
  ':(){:|:&};:',
  'chmod -R 777 /',
  'mv /* /dev/null'
];

// Command execution queue
const commandQueue = [];
let isProcessingQueue = false;

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
app.use(bodyParser.json());
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

// ===== OLLAMA PROXY ROUTES =====

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

// ===== COMMAND BRIDGE ROUTES =====

/**
 * Check if a command contains dangerous operations
 * @param {string} command - The command to check
 * @returns {boolean} - True if dangerous, false otherwise
 */
const isDangerousCommand = (command) => {
  return DANGEROUS_COMMANDS.some(dangerousCmd => command.includes(dangerousCmd));
};

/**
 * Generate a confirmation token for dangerous commands
 * @param {string} command - The command to generate a token for
 * @returns {string} - The confirmation token
 */
const generateConfirmationToken = (command) => {
  return crypto.createHash('sha256').update(command + Date.now()).digest('hex');
};

/**
 * Execute a shell command
 * @param {string} command - The command to execute
 * @returns {Promise<Object>} - The command execution result
 */
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          output: stderr || error.message,
          error: error.message,
          exitCode: error.code || 1
        });
      } else {
        resolve({
          output: stdout,
          error: stderr || null,
          exitCode: 0
        });
      }
    });
  });
};

/**
 * Process the command queue
 */
const processQueue = async () => {
  if (isProcessingQueue || commandQueue.length === 0) return;

  isProcessingQueue = true;

  const { command, res } = commandQueue.shift();

  try {
    const result = await executeCommand(command);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      output: '',
      error: `Failed to execute command: ${error.message}`,
      exitCode: 1
    });
  }

  isProcessingQueue = false;
  processQueue(); // Process next command in queue
};

/**
 * Execute a command
 * POST /api/execute
 * Body: { command: string, autonomy: boolean }
 */
app.post('/api/execute', verifyToken, (req, res) => {
  const { command, autonomy = false } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  // Check if command is dangerous
  if (isDangerousCommand(command) && !autonomy) {
    const confirmationToken = generateConfirmationToken(command);

    return res.status(403).json({
      requiresConfirmation: true,
      confirmationToken,
      message: `This command (${command}) is potentially dangerous. Confirm execution with token.`
    });
  }

  // Add command to queue
  commandQueue.push({ command, res });

  // Process queue
  processQueue();
});

/**
 * Confirm execution of a dangerous command
 * POST /api/confirm
 * Body: { command: string, confirmationToken: string }
 */
app.post('/api/confirm', verifyToken, (req, res) => {
  const { command, confirmationToken } = req.body;

  if (!command || !confirmationToken) {
    return res.status(400).json({ error: 'Command and confirmation token are required' });
  }

  // Add command to queue
  commandQueue.push({ command, res });

  // Process queue
  processQueue();
});

/**
 * Get system information
 * GET /api/system
 */
app.get('/api/system', verifyToken, async (req, res) => {
  try {
    const osInfo = await executeCommand('uname -a');
    const userInfo = await executeCommand('whoami');
    const dirInfo = await executeCommand('pwd');

    res.json({
      os: osInfo.output.trim(),
      user: userInfo.output.trim(),
      directory: dirInfo.output.trim()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check Ollama status
 * @returns {Promise<boolean>} - True if Ollama is running, false otherwise
 */
const checkOllamaStatus = async () => {
  try {
    const response = await fetch(`${OLLAMA_API}/version`);
    return response.ok;
  } catch (error) {
    console.error('Failed to check Ollama status:', error);
    return false;
  }
};

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  const ollamaRunning = await checkOllamaStatus();

  res.json({
    status: ollamaRunning ? 'ok' : 'warning',
    timestamp: new Date().toISOString(),
    services: {
      ollama: ollamaRunning,
      commandBridge: true
    },
    message: ollamaRunning ? 'All systems operational' : 'WARNING: Ollama is not running. AI features will not work.'
  });
});

/**
 * Ollama status check endpoint
 * GET /api/status
 */
app.get('/api/status', async (req, res) => {
  const ollamaRunning = await checkOllamaStatus();

  res.json({
    ollama: {
      running: ollamaRunning,
      endpoint: OLLAMA_API,
      model: 'r3b3l-4f-godmode'
    },
    server: {
      running: true,
      port: PORT
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`R3B3L 4F Server running on port ${PORT}`);
  console.log(`Proxying Ollama requests to ${OLLAMA_API}`);
  console.log(`Command execution bridge active`);
  console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

module.exports = app;
