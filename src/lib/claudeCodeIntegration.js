/**
 * Claude Code Integration - Agentic coding capabilities for DataOps Terminal
 * Integrates Claude Opus 4 + Claude Code for autonomous development operations
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Claude Code Integration Class
 * Handles communication between DataOps Terminal and Claude Code CLI
 */
export class ClaudeCodeIntegration {
  constructor() {
    this.isAvailable = false;
    this.memoryPath = './CLAUDE.md';
    this.userMemoryPath = '~/.claude/CLAUDE.md';
    this.initializeIntegration();
  }

  /**
   * Initialize Claude Code integration
   */
  async initializeIntegration() {
    try {
      // Check if Claude Code is installed
      await execAsync('claude --version');
      this.isAvailable = true;
      console.log('✅ Claude Code integration available');
      
      // Initialize project memory
      await this.initializeProjectMemory();
      
    } catch (error) {
      console.log('⚠️ Claude Code not available:', error.message);
      this.isAvailable = false;
    }
  }

  /**
   * Initialize project memory file
   */
  async initializeProjectMemory() {
    const projectMemory = `# DataOps Terminal - Claude Code Memory

## Project Overview
DataOps Terminal is an autonomous web data operations platform featuring:
- GHOSTCLI: Natural language command processing
- Bright Data MCP API integration
- Four core operations: Discover, Access, Extract, Interact
- Professional enterprise-grade output

## Architecture
- Frontend: React + Vite
- Backend: Node.js with Express
- AI: GPT-4o-mini + Local Ollama models
- Data: Bright Data APIs + Wikipedia integration

## Development Guidelines
- Use semantic versioning
- Maintain professional Bright Data branding
- Focus on enterprise-grade output quality
- Prioritize autonomous operation capabilities

## Key Commands
- !ghost <natural language> - Autonomous operations
- !ghost-setup - System validation
- !help - Show available operations

## Security
- Sandbox all external API calls
- Validate all user inputs
- Use environment variables for API keys
- Implement proper error handling
`;

    try {
      const fs = await import('fs/promises');
      await fs.writeFile(this.memoryPath, projectMemory);
      console.log('✅ Claude Code project memory initialized');
    } catch (error) {
      console.log('⚠️ Could not initialize project memory:', error.message);
    }
  }

  /**
   * Execute Claude Code command
   * @param {string} prompt - Natural language prompt for Claude Code
   * @param {Object} options - Execution options
   */
  async executeClaudeCode(prompt, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Claude Code not available');
    }

    try {
      const { interactive = false, oneShot = true } = options;
      
      let command;
      if (interactive) {
        command = 'claude';
      } else if (oneShot) {
        command = `claude -p "${prompt.replace(/"/g, '\\"')}"`;
      } else {
        command = `echo "${prompt}" | claude`;
      }

      console.log('🧠 Executing Claude Code:', command);
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      if (stderr && !stderr.includes('Warning')) {
        console.warn('Claude Code stderr:', stderr);
      }

      return {
        success: true,
        output: stdout,
        error: null,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Claude Code execution error:', error);
      return {
        success: false,
        output: null,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze codebase with Claude Code
   * @param {string} query - Analysis query
   */
  async analyzeCodebase(query) {
    const prompt = `Analyze the DataOps Terminal codebase and ${query}. 
    Focus on the GHOSTCLI autonomous operations and Bright Data integration.
    Provide specific, actionable insights.`;
    
    return await this.executeClaudeCode(prompt);
  }

  /**
   * Fix bugs with Claude Code
   * @param {string} errorDescription - Description of the bug
   */
  async fixBug(errorDescription) {
    const prompt = `Fix this bug in the DataOps Terminal project: ${errorDescription}.
    Analyze the codebase, identify the root cause, and implement a fix.
    Maintain the professional Bright Data branding and autonomous operation capabilities.`;
    
    return await this.executeClaudeCode(prompt);
  }

  /**
   * Enhance features with Claude Code
   * @param {string} featureRequest - Description of feature to enhance
   */
  async enhanceFeature(featureRequest) {
    const prompt = `Enhance the DataOps Terminal with this feature: ${featureRequest}.
    Ensure it integrates seamlessly with GHOSTCLI and maintains enterprise-grade quality.
    Follow the existing architecture patterns and coding standards.`;
    
    return await this.executeClaudeCode(prompt);
  }

  /**
   * Run tests with Claude Code
   */
  async runTests() {
    const prompt = `Run all tests for the DataOps Terminal project.
    Analyze any failures and suggest fixes.
    Ensure GHOSTCLI autonomous operations are working correctly.`;
    
    return await this.executeClaudeCode(prompt);
  }

  /**
   * Manage Git operations with Claude Code
   * @param {string} operation - Git operation to perform
   */
  async gitOperation(operation) {
    const prompt = `Perform this Git operation for DataOps Terminal: ${operation}.
    Use professional commit messages that highlight Bright Data integration.
    Follow semantic versioning and maintain clean commit history.`;
    
    return await this.executeClaudeCode(prompt);
  }

  /**
   * Get Claude Code status
   */
  getStatus() {
    return {
      available: this.isAvailable,
      memoryPath: this.memoryPath,
      userMemoryPath: this.userMemoryPath,
      capabilities: [
        'Codebase Analysis',
        'Bug Fixing',
        'Feature Enhancement',
        'Test Management',
        'Git Operations',
        'Code Review',
        'Documentation Generation'
      ]
    };
  }
}

// Export singleton instance
export const claudeCode = new ClaudeCodeIntegration();
export default claudeCode;
