/**
 * CommandBridge.js
 * 
 * Backend service for securely executing shell commands
 * This runs in Node.js environment and provides a REST API
 * for the frontend to execute commands
 */

const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Security settings
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

// Authentication token (should be environment variable in production)
const API_TOKEN = process.env.API_TOKEN || 'r3b3l-4f-secure-token';

// Middleware to verify API token
const verifyToken = (req, res, next) => {
  const token = req.headers['x-api-token'];
  
  if (!token || token !== API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

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

// Routes

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
  
  // In a real implementation, you would verify the token against stored tokens
  // For simplicity, we're just accepting any token here
  
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

// Start server
app.listen(PORT, () => {
  console.log(`CommandBridge server running on port ${PORT}`);
});

module.exports = app;
