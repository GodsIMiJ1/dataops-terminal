import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Zap, Shield, Terminal as TerminalIcon, Save, Lock, Unlock, Database, Search, Key, ArrowLeft, FileText, Moon, Sun } from 'lucide-react';
import TerminalComponent from './TerminalComponent';
import { executeAndFormatCommand, confirmCommandExecution } from '@/services/CommandExecutionService';
import { parseNaturalLanguageCommand } from '@/services/CommandParserService';
import { useChatAI } from '@/hooks/useChatAI';
import mcpHandler from '@/lib/mcpHandler';
import { createScroll } from '@/lib/scrollManager';
import BrightDataPanel from '@/components/BrightDataPanel';
import {
  initScrollSession,
  logEntry,
  saveSessionToFile
} from '@/services/ScrollLoggerService';
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
  const [theme, setTheme] = useState<'suit' | 'ghost'>(getInitialTheme());

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
    document.body.classList.toggle('theme-suit', theme === 'suit');
  }, [theme]);

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
      if (mode === 'suit' || mode === 'ghost') {
        setTheme(mode);
        return `Theme switched to ${mode} mode.`;
      } else {
        return 'Invalid mode. Available modes: suit, ghost';
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
!mode suit/ghost                  → Switch between professional/cyberpunk themes

# Mode Controls
!internet on/off                  → Enable/disable internet access
!nlp on/off                       → Enable/disable natural language parsing
!autonomy on/off                  → Enable/disable autonomy mode

# Security Controls
!airlock on/off                   → Block/allow all outbound HTTP requests
!encrypt on/off                   → Enable/disable log encryption
!decrypt-log <filename>           → Decrypt an encrypted log
!passphrase <key>                 → Set encryption passphrase

# Web Commands (Internet must be enabled)
!recon <url>                      → Scan and log raw HTML
!fetch-pub <doi>                  → Fetch publication metadata
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
    <div className={cn('flex flex-col h-full', className, theme === 'ghost' ? 'theme-ghost' : 'theme-suit')}>
      {/* Status Bar - Professional styling */}
      <div className={cn(
        "p-1 mb-1 flex items-center justify-between shadow-sm",
        theme === 'ghost'
          ? "bg-gradient-to-r from-cyber-black to-gray-900 border-b border-cyber-red/30"
          : "bg-pro-bg-panel border-b border-pro-border"
      )}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TerminalIcon className={cn(
              "w-4 h-4",
              theme === 'ghost' ? "text-cyber-red" : "text-pro-primary"
            )} />
            <span className={cn(
              "text-xs font-mono font-bold",
              theme === 'ghost' ? "text-cyber-red" : "text-pro-text"
            )}>
              DataOps Terminal
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Zap className={cn(
              "w-4 h-4",
              theme === 'ghost' ? "text-cyber-cyan" : "text-pro-secondary"
            )} />
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost' ? "text-cyber-cyan" : "text-pro-text"
            )}>
              Mission: {currentMission}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'suit' ? 'ghost' : 'suit')}
            className={cn(
              "p-1 rounded-full",
              theme === 'ghost'
                ? "hover:bg-cyber-red/20 text-cyber-cyan"
                : "hover:bg-pro-primary/10 text-pro-primary"
            )}
            title={theme === 'suit' ? "Switch to Ghost Mode" : "Switch to Suit Mode"}
          >
            {theme === 'suit' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Internet Status */}
          <div className="flex items-center gap-1">
            {internetEnabled ? (
              <Wifi className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-cyber-green" : "text-pro-accent"
              )} />
            ) : (
              <WifiOff className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-cyber-red" : "text-red-500"
              )} />
            )}
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost'
                ? internetEnabled ? "text-cyber-green" : "text-cyber-red"
                : internetEnabled ? "text-pro-accent" : "text-red-500"
            )}>
              {internetEnabled ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Airlock Status */}
          <div className="flex items-center gap-1">
            {airlockActive ? (
              <Lock className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-cyber-red" : "text-red-500"
              )} />
            ) : (
              <Unlock className={cn(
                "w-4 h-4",
                theme === 'ghost' ? "text-cyber-green" : "text-pro-accent"
              )} />
            )}
            <span className={cn(
              "text-xs font-mono",
              theme === 'ghost'
                ? airlockActive ? "text-cyber-red" : "text-cyber-green"
                : airlockActive ? "text-red-500" : "text-pro-accent"
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

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Terminal - Expanded to take more space */}
        <div className={cn("flex-1 transition-all duration-300", showBrightDataPanel ? "w-1/2" : "w-full")}>
          <TerminalComponent
            onCommandExecute={handleCommandExecute}
            autoFocus={true}
            className="h-full"
            theme={theme}
          />
        </div>

        {/* Bright Data Panel */}
        {showBrightDataPanel && (
          <div className="w-1/2 ml-1">
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
            "flex items-center gap-1 px-3 py-2 text-sm font-mono transition-colors",
            theme === 'ghost'
              ? "bg-cyber-black border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-black"
              : "bg-white border border-pro-primary text-pro-primary hover:bg-pro-primary hover:text-white"
          )}
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          HOME
        </a>
        <a
          href="/terminal-docs.html"
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-mono transition-colors",
            theme === 'ghost'
              ? "bg-cyber-black border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black"
              : "bg-white border border-pro-secondary text-pro-secondary hover:bg-pro-secondary hover:text-white"
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
