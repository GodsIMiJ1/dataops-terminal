import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Zap, Shield, Terminal as TerminalIcon, Save, Lock, Unlock, Database, Search, Key, ArrowLeft, FileText, Moon, Sun, Brain, Split, User, Settings } from 'lucide-react';
import TerminalComponent from './TerminalComponent';
import { executeAndFormatCommand, confirmCommandExecution } from '@/services/CommandExecutionService';
import { parseNaturalLanguageCommand } from '@/services/CommandParserService';
import { useChatAI } from '@/hooks/useChatAI';
import mcpHandler from '@/lib/mcpHandler';
import { createScroll } from '@/lib/scrollManager';
import BrightDataPanel from '@/components/BrightDataPanel';
import { runDoiCollector } from '@/lib/BrightDataService';
import { processCommand as processGhostCommand, validateSetup } from '@/lib/ghostCli.js';
import { testBrightDataConnection } from '@/lib/dataopsRouter.js';
import {
  initScrollSession,
  logEntry,
  saveSessionToFile
} from '@/services/ScrollLoggerService';
import claudeAPIService, { ClaudeResponse } from '@/services/ClaudeAPIService';
import {
  initMission,
  updateCurrentMission,
  updateLastCommand,
  getCurrentMission
} from '@/services/MissionMemoryService';
import {
  isAirlockActive,
  activateAirlock,
  deactivateAirlock
} from '@/services/AirlockService';
import {
  isEncryptionEnabled,
  toggleEncryption
} from '@/services/ScrollVaultService';
import { cn } from '@/lib/utils';

interface CommandTerminalProps {
  className?: string;
}

// Theme state management
const THEME_KEY = 'dataops-terminal-theme';
const getInitialTheme = (): 'suit' | 'ghost' => {
  // Always default to 'suit' theme unless explicitly set to 'ghost'
  const savedTheme = localStorage.getItem(THEME_KEY);
  return (savedTheme === 'ghost') ? 'ghost' : 'suit';
};

const CommandTerminal: React.FC<CommandTerminalProps> = ({ className }) => {
  const { sendMessage, messages, isLoading } = useChatAI();
  const [internetEnabled, setInternetEnabled] = useState(false);
  const [autonomyMode, setAutonomyMode] = useState(false);
  const [currentMission, setCurrentMission] = useState<string>('AWAITING ORDERS');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [pendingCommand, setPendingCommand] = useState<{command: string, token: string} | null>(null);
  const [nlpMode, setNlpMode] = useState(false);
  const [airlockActive, setAirlockActive] = useState(isAirlockActive());
  const [encryptionEnabled, setEncryptionEnabled] = useState(isEncryptionEnabled());
  const [showBrightDataPanel, setShowBrightDataPanel] = useState(false);
  const [theme, setTheme] = useState<'ghost' | 'rebel'>(getInitialTheme() === 'suit' ? 'ghost' : 'rebel');

  // Chat Interface State for Claude AI Models
  const [selectedModel, setSelectedModel] = useState<'opus' | 'haiku'>('haiku'); // Default to cost-effective model
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'user' | 'opus' | 'haiku' | 'system';
    content: string;
    timestamp: Date;
    command?: string;
    model?: 'opus' | 'haiku';
  }>>([
    {
      id: '1',
      type: 'system',
      content: '🔥 DUAL-SCREEN FLAME VIEW ACTIVATED\n\n• Strategic Command Interface Online\n• Architecture: DataOps Terminal with autonomous capabilities\n• Integration: GHOSTCLI + Claude Code dual-AI system\n• AI Models: Claude Opus 4 (Strategic) + Claude Haiku 3.5 (Lite)\n• Status: Ready for strategic operations',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Initialize mission and scroll session
  useEffect(() => {
    // Initialize mission memory
    initMission('DataOps Terminal');

    // Initialize scroll session
    initScrollSession();

    // Get current mission
    const mission = getCurrentMission();
    if (mission.objective) {
      setCurrentMission(mission.objective);
    }

    // Log terminal initialization
    logEntry('system', 'DataOps Terminal initialized. Type !help for available commands.');
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    // Apply theme to body for global styling
    document.body.classList.toggle('theme-ghost', theme === 'ghost');
    document.body.classList.toggle('theme-rebel', theme === 'rebel');
  }, [theme]);

  // Handle chat message submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Process the natural language input with selected Claude model
    try {
      const aiResponse = await processClaudeCommand(chatInput, selectedModel);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: selectedModel as const,
        content: aiResponse.response,
        timestamp: new Date(),
        command: aiResponse.command,
        model: selectedModel
      };

      setChatMessages(prev => [...prev, aiMessage]);

      // If AI generated a CLI command, execute it in the terminal
      if (aiResponse.command) {
        const result = await handleCommandExecute(aiResponse.command);

        const systemMessage = {
          id: (Date.now() + 2).toString(),
          type: 'system' as const,
          content: `Command executed: ${aiResponse.command}\n\nResult:\n${result}`,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system' as const,
        content: `Error processing request: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Process natural language with selected Claude model
  const processClaudeCommand = async (input: string, model: 'opus' | 'haiku'): Promise<ClaudeResponse> => {
    const apiKey = claudeAPIService.getAPIKey();

    if (apiKey) {
      try {
        // Use real Claude API
        return await claudeAPIService.callClaude(input, { apiKey, model });
      } catch (error) {
        console.warn('Claude API failed, falling back to simulation:', error);
        // Add system message about API failure
        const errorMessage = {
          id: Date.now().toString(),
          type: 'system' as const,
          content: `⚠️ Claude API unavailable. Using simulation mode.\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    }

    // Fallback to simulation
    return claudeAPIService.simulateResponse(input, model);
  };

  // Handle command execution
  const handleCommandExecute = async (command: string): Promise<string> => {
    // Check if this is a command confirmation
    if (pendingCommand && command.toLowerCase() === 'confirm') {
      return handleCommandConfirmation();
    }

    // Clear any pending command if a new command is entered
    if (pendingCommand && command !== 'confirm') {
      setPendingCommand(null);
    }

    // Log the command
    logEntry('command', command);

    // Update last command in mission memory
    updateLastCommand(command);

    // Check for special commands
    if (command.startsWith('!')) {
      return handleSpecialCommand(command);
    }

    // Check if this is an AI query or a system command
    if (command.startsWith('?') || command.startsWith('ask ')) {
      return handleAiQuery(command);
    }

    // If NLP mode is enabled, try to parse natural language commands
    if (nlpMode && !command.startsWith('!') && !command.startsWith('?') && !command.startsWith('ask ')) {
      try {
        const parsedCommand = await parseNaturalLanguageCommand(command);

        if (parsedCommand) {
          logEntry('system', `Parsed as: ${parsedCommand}`);

          // If the parsed command is a special command, handle it
          if (parsedCommand.startsWith('!')) {
            return handleSpecialCommand(parsedCommand);
          }

          // Otherwise, execute the parsed command
          const result = await executeAndFormatCommand(parsedCommand, { autonomyMode });

          // Check if command requires confirmation
          if (result.requiresConfirmation && result.confirmationToken) {
            setPendingCommand({
              command: parsedCommand,
              token: result.confirmationToken
            });

            logEntry('system', 'Command requires confirmation. Type "confirm" to execute.');
            return `Parsed as: ${parsedCommand}\n\n${result.output}\n\nThis command requires confirmation due to potential security risks.\nType "confirm" to execute or enter a different command to cancel.`;
          }

          logEntry('response', result.output);
          return `Parsed as: ${parsedCommand}\n\n${result.output}`;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logEntry('error', `Failed to parse command: ${errorMessage}`);
        return `Failed to parse command: ${errorMessage}`;
      }
    }

    // Execute as system command
    try {
      const result = await executeAndFormatCommand(command, { autonomyMode });

      // Check if command requires confirmation
      if (result.requiresConfirmation && result.confirmationToken) {
        setPendingCommand({
          command,
          token: result.confirmationToken
        });

        logEntry('system', 'Command requires confirmation. Type "confirm" to execute.');
        return `${result.output}\n\nThis command requires confirmation due to potential security risks.\nType "confirm" to execute or enter a different command to cancel.`;
      }

      logEntry('response', result.output);
      return result.output;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `Error: ${errorMessage}`;
    }
  };

  // Handle command confirmation
  const handleCommandConfirmation = async (): Promise<string> => {
    if (!pendingCommand) {
      return 'No command pending confirmation.';
    }

    try {
      const result = await confirmCommandExecution(pendingCommand.command, pendingCommand.token);
      logEntry('response', result.output);
      setPendingCommand(null);
      return result.output;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      setPendingCommand(null);
      return `Error: ${errorMessage}`;
    }
  };

  // Handle special commands
  const handleSpecialCommand = async (command: string): Promise<string> => {
    const parts = command.split(' ');
    const mainCommand = parts[0].toLowerCase();

    // Handle mode command for theme switching
    if (mainCommand === '!mode') {
      const mode = parts[1]?.toLowerCase();
      if (mode === 'ghost' || mode === 'rebel') {
        setTheme(mode as 'ghost' | 'rebel');
        return `Theme switched to ${mode} mode.`;
      } else {
        return 'Invalid mode. Available modes: ghost, rebel';
      }
    }

    // Handle internet command
    if (mainCommand === '!internet') {
      const action = parts[1]?.toLowerCase();
      if (action === 'on') {
        setInternetEnabled(true);
        return 'Internet access enabled.';
      } else if (action === 'off') {
        setInternetEnabled(false);
        return 'Internet access disabled.';
      } else {
        return `Internet access is currently ${internetEnabled ? 'enabled' : 'disabled'}.`;
      }
    }

    // Handle NLP command
    if (mainCommand === '!nlp') {
      const action = parts[1]?.toLowerCase();
      if (action === 'on') {
        setNlpMode(true);
        return 'Natural language parsing enabled.';
      } else if (action === 'off') {
        setNlpMode(false);
        return 'Natural language parsing disabled.';
      } else {
        return `Natural language parsing is currently ${nlpMode ? 'enabled' : 'disabled'}.`;
      }
    }

    // Handle autonomy command
    if (mainCommand === '!autonomy') {
      const action = parts[1]?.toLowerCase();
      if (action === 'on') {
        setAutonomyMode(true);
        return 'Autonomy mode enabled.';
      } else if (action === 'off') {
        setAutonomyMode(false);
        return 'Autonomy mode disabled.';
      } else {
        return `Autonomy mode is currently ${autonomyMode ? 'enabled' : 'disabled'}.`;
      }
    }

    // Handle mission command
    if (mainCommand === '!mission') {
      const missionNumber = parts[1];
      const objectiveIndex = command.indexOf('-o');

      if (objectiveIndex > -1) {
        const objective = command.substring(objectiveIndex + 2).trim().replace(/^"(.*)"$/, '$1');
        updateCurrentMission({ objective });
        setCurrentMission(objective);
        return `Mission objective set: ${objective}`;
      } else {
        return `Current mission: ${currentMission}`;
      }
    }

    // Handle airlock command
    if (mainCommand === '!airlock') {
      const action = parts[1]?.toLowerCase();
      if (action === 'on') {
        activateAirlock();
        setAirlockActive(true);
        return 'Airlock activated. All outbound HTTP requests will be blocked.';
      } else if (action === 'off') {
        deactivateAirlock();
        setAirlockActive(false);
        return 'Airlock deactivated. Outbound HTTP requests are now allowed.';
      } else {
        return `Airlock is currently ${airlockActive ? 'active' : 'inactive'}.`;
      }
    }

    // Handle encryption command
    if (mainCommand === '!encrypt') {
      const action = parts[1]?.toLowerCase();
      if (action === 'on') {
        toggleEncryption();
        setEncryptionEnabled(true);
        return 'Encryption enabled for all logs.';
      } else if (action === 'off') {
        toggleEncryption();
        setEncryptionEnabled(false);
        return 'Encryption disabled for logs.';
      } else {
        return `Encryption is currently ${encryptionEnabled ? 'enabled' : 'disabled'}.`;
      }
    }

    // Handle save command
    if (mainCommand === '!save') {
      const format = parts[1]?.toLowerCase() || 'md';
      try {
        const filename = await saveSessionToFile(format);
        return `Session saved to ${filename}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error saving session: ${errorMessage}`;
      }
    }

    // Handle GHOSTCLI autonomous command
    if (mainCommand === '!ghost') {
      const naturalCommand = command.substring(6).trim(); // Remove "!ghost "
      if (!naturalCommand) {
        return 'Usage: !ghost <natural language command>\nExample: !ghost search for AI research papers';
      }

      try {
        logEntry('system', `GHOSTCLI processing: ${naturalCommand}`);
        const result = await processGhostCommand(naturalCommand);
        logEntry('response', result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `GHOSTCLI Error: ${errorMessage}`;
      }
    }

    // Handle GHOSTCLI setup validation
    if (mainCommand === '!ghost-setup') {
      const setup = validateSetup();
      let result = '🤖 GHOSTCLI Setup Validation\n' + '='.repeat(40) + '\n\n';

      setup.issues.forEach(issue => {
        result += issue + '\n';
      });

      result += '\n' + (setup.ready ? '✅ GHOSTCLI is ready!' : '⚠️  Some features may be limited');
      return result;
    }

    // Handle Claude API key management
    if (mainCommand === '!claude-api') {
      const action = parts[1]?.toLowerCase();

      if (action === 'set') {
        const apiKey = parts.slice(2).join(' ').trim();
        if (!apiKey) {
          return 'Usage: !claude-api set <your-api-key>\nGet your API key from: https://console.anthropic.com/';
        }
        claudeAPIService.setAPIKey(apiKey);
        return '✅ Claude API key set successfully! You can now use real Claude models.';
      } else if (action === 'remove') {
        claudeAPIService.removeAPIKey();
        return '🗑️ Claude API key removed. Falling back to simulation mode.';
      } else if (action === 'status') {
        const hasKey = claudeAPIService.isAPIKeyAvailable();
        return `🔑 Claude API Status: ${hasKey ? '✅ Connected' : '❌ No API key set'}\n\nTo set API key: !claude-api set <your-key>\nGet API key: https://console.anthropic.com/`;
      } else {
        return 'Usage: !claude-api <set|remove|status>\n\nExamples:\n!claude-api set sk-ant-api03-...\n!claude-api status\n!claude-api remove';
      }
    }

    // Handle status command
    if (mainCommand === '!dual-status') {
      const apiStatus = claudeAPIService.isAPIKeyAvailable() ? '✅ API Connected' : '⚠️ Simulation Mode';
      return `🔥 DUAL-SCREEN FLAME VIEW STATUS\n\n🧠 Left Panel: Claude ${selectedModel.toUpperCase()} (Strategic GUI) - ACTIVE\n⚡ Right Panel: Claude Code (Execution CLI) - ACTIVE\n🔑 Claude API: ${apiStatus}\n\nTwo minds. One terminal. Sovereign sync OPERATIONAL.`;
    }

    // Handle Claude Code commands
    if (mainCommand === '!claude') {
      const subCommand = parts[1]?.toLowerCase();
      const prompt = command.substring(command.indexOf(subCommand || '') + (subCommand?.length || 0)).trim();

      try {
        const { claudeCode } = await import('../../lib/claudeCodeIntegration.js');

        switch (subCommand) {
          case 'analyze':
            if (!prompt) return 'Usage: !claude analyze <analysis query>';
            const analysis = await claudeCode.analyzeCodebase(prompt);
            return analysis.success ? analysis.output : `Error: ${analysis.error}`;

          case 'fix':
            if (!prompt) return 'Usage: !claude fix <bug description>';
            const fix = await claudeCode.fixBug(prompt);
            return fix.success ? fix.output : `Error: ${fix.error}`;

          case 'enhance':
            if (!prompt) return 'Usage: !claude enhance <feature request>';
            const enhancement = await claudeCode.enhanceFeature(prompt);
            return enhancement.success ? enhancement.output : `Error: ${enhancement.error}`;

          case 'test':
            const testResult = await claudeCode.runTests();
            return testResult.success ? testResult.output : `Error: ${testResult.error}`;

          case 'git':
            if (!prompt) return 'Usage: !claude git <git operation>';
            const gitResult = await claudeCode.gitOperation(prompt);
            return gitResult.success ? gitResult.output : `Error: ${gitResult.error}`;

          case 'status':
            const status = claudeCode.getStatus();
            return `🧠 Claude Code Status\n${JSON.stringify(status, null, 2)}`;

          default:
            if (!subCommand) {
              return 'Usage: !claude <analyze|fix|enhance|test|git|status> [prompt]';
            }
            // Direct prompt execution
            const result = await claudeCode.executeClaudeCode(command.substring(7));
            return result.success ? result.output : `Error: ${result.error}`;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Claude Code Error: ${errorMessage}`;
      }
    }

    // Handle Bright Data API test
    if (mainCommand === '!test-api') {
      try {
        logEntry('system', 'Testing Bright Data API connection...');
        const testResult = await testBrightDataConnection();

        let result = '🔧 Bright Data API Test\n' + '='.repeat(40) + '\n\n';
        result += `API Key: ${testResult.apiKey}\n`;
        result += `Status: ${testResult.success ? '✅ SUCCESS' : '❌ FAILED'}\n`;

        if (testResult.success) {
          result += `HTTP Status: ${testResult.status} ${testResult.statusText}\n`;
          result += '\n🎉 Bright Data API is working! GHOSTCLI should use real data.';
        } else {
          result += `Error: ${testResult.error}\n`;
          result += '\n⚠️  API connection failed. Using mock data.';
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `API Test Error: ${errorMessage}`;
      }
    }

    // Handle DOI extraction command
    if (mainCommand === '!extract-doi') {
      // Extract DOI from command
      const doiMatch = command.match(/--doi\s+"([^"]+)"/);
      if (!doiMatch) {
        return 'Missing required parameter: --doi "10.1126/sciadv.adu9368"';
      }

      const doi = doiMatch[1];

      try {
        logEntry('system', `Extracting metadata for DOI: ${doi}`);
        const result = await runDoiCollector(doi);
        return `📄 DOI Extraction Result:\n\n${JSON.stringify(result, null, 2)}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error extracting DOI metadata: ${errorMessage}`;
      }
    }

    // Handle Bright Data commands
    if (mainCommand === '!dataops') {
      const subCommand = parts[1]?.toLowerCase();

      if (subCommand === 'ops') {
        setShowBrightDataPanel(true);
        return 'Opening Bright Data Operations Panel...';
      }

      // Parse command arguments
      const argsString = command.substring(command.indexOf(subCommand) + subCommand.length).trim();
      const args = mcpHandler.parseArgs(argsString);

      try {
        let result;

        switch (subCommand) {
          case 'discover':
            if (!args.query) {
              return 'Missing required parameter: --query "search terms"';
            }
            result = await mcpHandler.discover(args.query, args);
            break;
          case 'access':
            if (!args.url) {
              return 'Missing required parameter: --url "https://example.com"';
            }
            result = await mcpHandler.access(args.url, args);
            break;
          case 'extract':
            if (!args.url) {
              return 'Missing required parameter: --url "https://example.com"';
            }
            if (!args.schema) {
              return 'Missing required parameter: --schema "title,author,date"';
            }
            result = await mcpHandler.extract(args.url, args.schema.split(','), args);
            break;
          case 'interact':
            if (!args.url) {
              return 'Missing required parameter: --url "https://example.com"';
            }
            if (!args.actions) {
              return 'Missing required parameter: --actions "click:.button,type:#input:text"';
            }
            // Parse actions string into array of action objects
            const actions = args.actions.split(',').map(action => {
              const [type, selector, value] = action.split(':');
              return { type, selector, value };
            });
            result = await mcpHandler.interact(args.url, actions, args);
            break;
          case 'collect':
            if (!args.target) {
              return 'Missing required parameter: --target "collector-name"';
            }
            // This would call a collector API endpoint
            result = { success: true, message: `Data collector "${args.target}" started.` };
            break;
          default:
            return `Unknown DataOps command: ${subCommand}. Available commands: discover, access, extract, interact, collect, ops`;
        }

        // Save result to file if output parameter is provided
        if (args.output && result.success) {
          mcpHandler.saveToFile(result.data, args.output);
          return `Operation completed successfully. Results saved to ${args.output}`;
        }

        return result.success
          ? `Operation completed successfully:\n${JSON.stringify(result.data, null, 2)}`
          : `Operation failed: ${result.error}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error executing DataOps command: ${errorMessage}`;
      }
    }

    // Handle help command
    if (mainCommand === '!help') {
      return `
DataOps Terminal Commands:

# Core Commands
!help                             → Show available commands
!mission <n> -o "<objective>"     → Create new mission configuration
!status                           → View current system state
!save md/json                     → Save session logs
!confirm                          → Execute queued dangerous commands
!mode ghost/rebel                 → Switch between professional/cyberpunk themes

# Mode Controls
!internet on/off                  → Enable/disable internet access
!nlp on/off                       → Enable/disable natural language parsing
!autonomy on/off                  → Enable/disable autonomy mode

# Security Controls
!airlock on/off                   → Block/allow all outbound HTTP requests
!encrypt on/off                   → Enable/disable log encryption
!decrypt-log <filename>           → Decrypt an encrypted log
!passphrase <key>                 → Set encryption passphrase

# 🤖 GHOSTCLI - Autonomous Operations (NEW!)
!ghost <natural language>        → Process any command in natural language
!ghost-setup                     → Validate GHOSTCLI configuration
!test-api                        → Test Bright Data API connection

Examples:
  !ghost search for AI research papers
  !ghost extract pricing from stripe.com
  !ghost access complex website with authentication
  !ghost interact with search form on site

# 🧠 CLAUDE AI - Dual Model Integration (ULTIMATE ENHANCEMENT!)
!claude-api set <api-key>        → Set Claude API key for real AI models
!claude-api status               → Check API connection status
!claude-api remove               → Remove API key (use simulation)
!claude analyze <query>          → Analyze codebase with Claude
!claude fix <bug description>    → Automatically fix bugs
!claude enhance <feature>        → Add new features autonomously
!claude test                     → Run tests and analyze results
!claude git <operation>          → Manage Git operations
!claude status                   → Check Claude Code integration status
!claude <direct prompt>          → Direct Claude Code interaction

# 🔥 DUAL-SCREEN FLAME VIEW - Always Active (ULTIMATE ENHANCEMENT!)
!dual-status                     → Check dual-screen interface status

Examples:
  !claude analyze the GHOSTCLI architecture
  !claude fix the API connection timeout issue
  !claude enhance add real-time notifications
  !claude git commit with professional message
  !dual-status                   → Verify sovereign sync operational

# Web Commands (Internet must be enabled)
!recon <url>                      → Scan and log raw HTML
!extract-doi --doi "10.1126/xyz"  → Extract metadata from scientific articles
!scrape <keyword> <site>          → Keyword web crawl

# Bright Data MCP Commands
!dataops discover --query "terms"   → Find content across the web
!dataops access --url "url"         → Access complex websites
!dataops extract --url "url"        → Extract structured data
!dataops interact --url "url"       → Interact with websites
!dataops collect --target "name"    → Run a Data Collector
!dataops ops                        → Open Bright Data Operations Panel
`;
    }

    // If no special command matched, return error
    return `Unknown command: ${command}. Type !help for available commands.`;
  };

  // Handle AI query
  const handleAiQuery = async (command: string): Promise<string> => {
    const query = command.startsWith('?')
      ? command.substring(1).trim()
      : command.startsWith('ask ')
        ? command.substring(4).trim()
        : command;

    if (!query) {
      return 'Please provide a query after ? or ask.';
    }

    try {
      const response = await sendMessage(query);
      return response || 'No response from AI.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Error: ${errorMessage}`;
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className, theme === 'ghost' ? 'theme-ghost' : 'theme-rebel')}>
      {/* Status Bar - Professional styling */}
      <div className={cn(
        "p-1 mb-1 flex items-center justify-between shadow-sm",
        theme === 'ghost'
          ? "bg-gray-800 border-b border-gray-600"
          : "bg-gray-900 border-b border-red-500/30"
      )}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TerminalIcon className={cn(
              "w-4 h-4",
              theme === 'ghost' ? "text-blue-400" : "text-red-500"
            )} />
            <span className={cn(
              "text-xs font-mono font-bold",
              theme === 'ghost' ? "text-gray-300" : "text-red-500"
            )}>
              DataOps Terminal
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Zap className={cn(
              "w-4 h-4",
              theme === 'ghost' ? "text-purple-400" : "text-cyan-400"
            )} />
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost' ? "text-gray-300" : "text-cyan-400"
            )}>
              Mission: {currentMission}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dual-Screen Status */}
          <div className="flex items-center gap-1">
            <Brain className={cn(
              "w-4 h-4",
              theme === 'ghost' ? "text-red-500" : "text-blue-600"
            )} />
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost' ? "text-red-500" : "text-blue-600"
            )}>
              DUAL-AI
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'ghost' ? 'rebel' : 'ghost')}
            className={cn(
              "p-1 rounded-full",
              theme === 'ghost'
                ? "hover:bg-blue-500/20 text-purple-400"
                : "hover:bg-red-500/20 text-cyan-400"
            )}
            title={theme === 'ghost' ? "Switch to Rebel Mode" : "Switch to Ghost Mode"}
          >
            {theme === 'ghost' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Internet Status */}
          <div className="flex items-center gap-1">
            {internetEnabled ? (
              <Wifi className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-green-400" : "text-green-400"
              )} />
            ) : (
              <WifiOff className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-red-400" : "text-red-500"
              )} />
            )}
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost'
                ? internetEnabled ? "text-green-400" : "text-red-400"
                : internetEnabled ? "text-green-400" : "text-red-500"
            )}>
              {internetEnabled ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Airlock Status */}
          <div className="flex items-center gap-1">
            {airlockActive ? (
              <Lock className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-red-400" : "text-red-500"
              )} />
            ) : (
              <Unlock className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-green-400" : "text-green-400"
              )} />
            )}
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost'
                ? airlockActive ? "text-red-400" : "text-green-400"
                : airlockActive ? "text-red-500" : "text-green-400"
            )}>
              {airlockActive ? 'SECURE' : 'OPEN'}
            </span>
          </div>

          {/* Encryption Status */}
          <div className="flex items-center gap-1">
            <Key className={cn(
              "w-4 h-4",
              theme === 'ghost'
                ? encryptionEnabled ? "text-cyber-green" : "text-cyber-red"
                : encryptionEnabled ? "text-pro-accent" : "text-red-500"
            )} />
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost'
                ? encryptionEnabled ? "text-cyber-green" : "text-cyber-red"
                : encryptionEnabled ? "text-pro-accent" : "text-red-500"
            )}>
              {encryptionEnabled ? 'ENCRYPTED' : 'PLAIN'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area - DUAL-SCREEN FLAME VIEW */}
      <div className="flex-1 flex">
        {/* Left Panel: Claude Opus 4 Strategic GUI */}
        <div className={cn(
          "w-1/2 flex flex-col",
          theme === 'ghost' ? 'bg-gray-800' : 'bg-gray-900'
        )}>
          {/* Opus Header */}
          <div className={cn(
            'flex items-center justify-between p-3 border-b',
            theme === 'ghost'
              ? 'border-gray-600 bg-gray-700'
              : 'border-red-500/30 bg-gray-800'
          )}>
            <div className="flex items-center gap-2">
              <Brain className={cn(
                'w-5 h-5',
                theme === 'ghost' ? 'text-blue-400' : 'text-red-500'
              )} />
              <span className={cn(
                'font-mono font-bold text-sm',
                theme === 'ghost' ? 'text-gray-300' : 'text-red-500'
              )}>
                🧠 CLAUDE {selectedModel.toUpperCase()} (STRATEGIC GUI)
              </span>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as 'opus' | 'haiku')}
                className={cn(
                  'px-2 py-1 text-xs font-mono rounded border',
                  theme === 'ghost'
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-800 border-red-500/30 text-cyan-400'
                )}
              >
                <option value="haiku">Haiku 3.5 (Lite)</option>
                <option value="opus">Opus 4 (Premium)</option>
              </select>

              {/* API Status Indicator */}
              <div className={cn(
                'w-2 h-2 rounded-full',
                claudeAPIService.isAPIKeyAvailable()
                  ? 'bg-green-400'
                  : 'bg-yellow-400'
              )}
              title={claudeAPIService.isAPIKeyAvailable() ? 'API Connected' : 'Simulation Mode'}
              />
            </div>
          </div>

          {/* Strategic Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    message.type === 'user'
                      ? theme === 'ghost'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 ml-8'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400 ml-8'
                      : message.type === 'opus'
                      ? theme === 'ghost'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 mr-8'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 mr-8'
                      : message.type === 'haiku'
                      ? theme === 'ghost'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400 mr-8'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 mr-8'
                      : theme === 'ghost'
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-gray-800 border-gray-600 text-cyan-400'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.type === 'user' && <User className="w-4 h-4" />}
                    {message.type === 'opus' && <Brain className="w-4 h-4" />}
                    {message.type === 'haiku' && <Zap className="w-4 h-4" />}
                    {message.type === 'system' && <TerminalIcon className="w-4 h-4" />}
                    <span className="text-xs font-mono opacity-70">
                      {message.type === 'user' ? 'USER' :
                       message.type === 'opus' ? 'CLAUDE OPUS 4' :
                       message.type === 'haiku' ? 'CLAUDE HAIKU 3.5' : 'SYSTEM'}
                    </span>
                    <span className="text-xs opacity-50 ml-auto">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm font-mono whitespace-pre-wrap">
                    {message.content}
                  </div>
                  {message.command && (
                    <div className={cn(
                      'mt-2 p-2 rounded text-xs font-mono',
                      theme === 'ghost'
                        ? 'bg-gray-600 text-green-400'
                        : 'bg-gray-700 text-green-400'
                    )}>
                      Generated Command: {message.command}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input Area */}
            <div className={cn(
              'border-t p-3',
              theme === 'ghost' ? 'border-gray-600' : 'border-red-500/30'
            )}>
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Claude Opus 4 anything... (e.g., 'search for AI research papers')"
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-mono rounded border',
                    theme === 'ghost'
                      ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500'
                      : 'bg-gray-800 border-red-500/30 text-cyan-400 placeholder-cyan-400/50'
                  )}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className={cn(
                    'px-4 py-2 text-sm font-mono rounded border transition-colors',
                    theme === 'ghost'
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50'
                      : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 disabled:opacity-50'
                  )}
                >
                  Send
                </button>
              </form>
              <div className={cn(
                'mt-2 text-xs font-mono text-center opacity-70',
                theme === 'ghost' ? 'text-gray-400' : 'text-cyan-400'
              )}>
                Natural language → CLI commands → Terminal execution
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Claude Code Execution CLI */}
        <div className={cn(
          "w-1/2 border-l flex flex-col",
          theme === 'ghost'
            ? 'border-gray-600 bg-gray-800'
            : 'border-red-500/30 bg-gray-900'
        )}>
          {/* CLI Header */}
          <div className={cn(
            'flex items-center justify-between p-3 border-b',
            theme === 'ghost'
              ? 'border-gray-600 bg-gray-700'
              : 'border-red-500/30 bg-gray-800'
          )}>
            <div className="flex items-center gap-2">
              <TerminalIcon className={cn(
                'w-5 h-5',
                theme === 'ghost' ? 'text-purple-400' : 'text-green-400'
              )} />
              <span className={cn(
                'font-mono font-bold text-sm',
                theme === 'ghost' ? 'text-gray-300' : 'text-green-400'
              )}>
                ⚡ CLAUDE CODE (EXECUTION CLI)
              </span>
            </div>

            {/* Bright Data Toggle */}
            {showBrightDataPanel && (
              <button
                onClick={() => setShowBrightDataPanel(false)}
                className={cn(
                  'text-xs px-2 py-1 rounded',
                  theme === 'ghost'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                )}
              >
                Hide Data Panel
              </button>
            )}
          </div>

          {/* Terminal Component */}
          <div className="flex-1">
            <TerminalComponent
              onCommandExecute={handleCommandExecute}
              autoFocus={true}
              className="h-full"
              theme={theme}
            />
          </div>
        </div>

        {/* Optional Bright Data Panel (slides over) */}
        {showBrightDataPanel && (
          <div className="absolute right-0 top-0 bottom-0 w-1/3 z-10">
            <BrightDataPanel
              className="h-full"
              onClose={() => setShowBrightDataPanel(false)}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <a
          href="/"
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-mono transition-colors rounded",
            theme === 'ghost'
              ? "bg-gray-800 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
              : "bg-gray-900 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
          )}
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          HOME
        </a>
        <a
          href="/terminal-docs.html"
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-mono transition-colors rounded",
            theme === 'ghost'
              ? "bg-gray-800 border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
              : "bg-gray-900 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
          )}
          title="View Terminal Documentation"
          target="_blank"
        >
          <FileText className="w-4 h-4" />
          DOCS
        </a>
      </div>
    </div>
  );
};

export default CommandTerminal;
