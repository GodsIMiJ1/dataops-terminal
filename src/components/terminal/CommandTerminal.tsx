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
import ollamaService, { OllamaModel } from '@/services/OllamaService';
import ethicalHackingService from '@/services/EthicalHackingService';
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

  // Local Ollama AI State
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('');
  const [ollamaStatus, setOllamaStatus] = useState<{isRunning: boolean, error?: string}>({isRunning: false});
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'user' | 'ollama' | 'system';
    content: string;
    timestamp: Date;
    command?: string;
    ollamaModel?: string;
  }>>([
    {
      id: '1',
      type: 'system',
      content: '🔥 R3B3L 4F ETHICAL HACKING TERMINAL ACTIVATED\n\n• Local AI Sovereignty Online\n• Architecture: Pure Ollama integration\n• AI Models: Local models only (r3b3l-4f-godmode, bianca, deepseek-coder, llama3.1)\n• Focus: Ethical hacking and penetration testing\n• Status: Ready for authorized security operations\n\n⚔️ NO CLOUD DEPENDENCIES - PURE LOCAL AI POWER ⚔️',
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

  // Initialize Ollama service and detect models
  useEffect(() => {
    const initializeOllama = async () => {
      try {
        const status = await ollamaService.getStatus();
        setOllamaStatus({isRunning: status.isRunning, error: status.error});

        if (status.isRunning && status.models.length > 0) {
          setOllamaModels(status.models);
          // Auto-select first available model
          setSelectedOllamaModel(status.models[0].name);

          // Add system message about detected models
          const modelList = status.models.map(m => `• ${m.name}`).join('\n');
          const systemMessage = {
            id: Date.now().toString(),
            type: 'system' as const,
            content: `🤖 OLLAMA MODELS DETECTED:\n\n${modelList}\n\n✅ Local AI ready for ethical hacking operations!`,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, systemMessage]);
        } else if (!status.isRunning) {
          const errorMessage = {
            id: Date.now().toString(),
            type: 'system' as const,
            content: `⚠️ OLLAMA SERVICE NOT DETECTED\n\nTo enable local AI:\n1. Install Ollama: https://ollama.ai\n2. Start service: ollama serve\n3. Pull models: ollama pull llama3.1\n\nFalling back to simulation mode.`,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Failed to initialize Ollama:', error);
      }
    };

    initializeOllama();

    // Auto-refresh every 30 seconds
    const interval = setInterval(initializeOllama, 30000);
    return () => clearInterval(interval);
  }, []);

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

    // Process the natural language input with Ollama
    try {
      const aiResponse = await processOllamaCommand(chatInput);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ollama' as const,
        content: aiResponse.response,
        timestamp: new Date(),
        command: aiResponse.command,
        ollamaModel: selectedOllamaModel
      };

      setChatMessages(prev => [...prev, aiMessage]);

      // If Ollama generated a CLI command, execute it in the terminal
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

  // Process command with Ollama
  const processOllamaCommand = async (input: string): Promise<{response: string, command?: string}> => {
    if (!ollamaStatus.isRunning) {
      return {
        response: '❌ Ollama service not running. Start with: ollama serve'
      };
    }

    if (!selectedOllamaModel) {
      return {
        response: '❌ No Ollama model selected. Available models: ' + ollamaModels.map(m => m.name).join(', ')
      };
    }

    try {
      // Check if this looks like an ethical hacking request
      const lowerInput = input.toLowerCase();
      const hackingKeywords = ['recon', 'scan', 'exploit', 'vulnerability', 'penetration', 'security', 'hack', 'enumerate', 'payload'];
      const isHackingRequest = hackingKeywords.some(keyword => lowerInput.includes(keyword));

      if (isHackingRequest) {
        // Use ethical hacking service
        const taskType = lowerInput.includes('recon') ? 'recon' :
                        lowerInput.includes('exploit') ? 'exploit' :
                        lowerInput.includes('code') || lowerInput.includes('script') ? 'coding' :
                        lowerInput.includes('analysis') || lowerInput.includes('analyze') ? 'analysis' : 'general';

        const result = await ethicalHackingService.processRequest({
          type: taskType,
          description: input,
          model: selectedOllamaModel
        });

        let response = result.response;
        if (result.warnings && result.warnings.length > 0) {
          response = result.warnings.join('\n') + '\n\n' + response;
        }

        return {
          response,
          command: result.success ? undefined : undefined // No CLI commands for hacking responses
        };
      } else {
        // Regular chat with Ollama
        const response = await ollamaService.generate(
          selectedOllamaModel,
          input,
          'You are a helpful AI assistant focused on ethical hacking and cybersecurity. Provide helpful, educational responses while emphasizing legal and ethical practices.'
        );

        return {
          response
        };
      }
    } catch (error) {
      return {
        response: `❌ Ollama error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
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





    // Handle Ollama commands
    if (mainCommand === '!ollama') {
      const action = parts[1]?.toLowerCase();

      if (action === 'status') {
        const status = await ollamaService.getStatus();
        if (status.isRunning) {
          const modelList = status.models.map(m => `• ${m.name} (${m.size})`).join('\n');
          return `🤖 OLLAMA STATUS: ✅ RUNNING\n\nVersion: ${status.version || 'Unknown'}\nService: http://localhost:11434\n\nAvailable Models:\n${modelList || 'No models installed'}\n\nSelected: ${selectedOllamaModel || 'None'}`;
        } else {
          return `🤖 OLLAMA STATUS: ❌ NOT RUNNING\n\nError: ${status.error}\n\nTo start Ollama:\n1. Install: https://ollama.ai\n2. Run: ollama serve\n3. Pull models: ollama pull llama3.1`;
        }
      } else if (action === 'models') {
        const models = await ollamaService.getModels();
        if (models.length === 0) {
          return '❌ No models available. Install with: ollama pull <model-name>';
        }
        const modelList = models.map(m => `• ${m.name} - ${m.size} (Modified: ${new Date(m.modified).toLocaleDateString()})`).join('\n');
        return `🤖 AVAILABLE OLLAMA MODELS:\n\n${modelList}`;
      } else if (action === 'select') {
        const modelName = parts.slice(2).join(' ').trim();
        if (!modelName) {
          return 'Usage: !ollama select <model-name>\n\nAvailable models: ' + ollamaModels.map(m => m.name).join(', ');
        }
        const model = ollamaModels.find(m => m.name.includes(modelName));
        if (model) {
          setSelectedOllamaModel(model.name);
          return `✅ Selected Ollama model: ${model.name}`;
        } else {
          return `❌ Model not found: ${modelName}\n\nAvailable: ${ollamaModels.map(m => m.name).join(', ')}`;
        }
      } else {
        return 'Usage: !ollama <status|models|select>\n\nExamples:\n!ollama status\n!ollama models\n!ollama select llama3.1';
      }
    }

    // Handle ethical hacking commands
    if (mainCommand === '!recon') {
      const target = parts.slice(1).join(' ').trim();
      if (!target) {
        return 'Usage: !recon <target>\n\nExample: !recon example.com\n\n⚠️ Only scan targets you own or have permission to test!';
      }

      try {
        const result = await ethicalHackingService.quickRecon(target, selectedOllamaModel);
        let response = `🔍 RECONNAISSANCE: ${target}\n\n${result.response}`;
        if (result.warnings) {
          response = result.warnings.join('\n') + '\n\n' + response;
        }
        return response;
      } catch (error) {
        return `❌ Recon failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    if (mainCommand === '!exploit') {
      const vulnerability = parts.slice(1).join(' ').trim();
      if (!vulnerability) {
        return 'Usage: !exploit <vulnerability>\n\nExample: !exploit SQL injection\n\n⚠️ Only test on authorized systems!';
      }

      try {
        const result = await ethicalHackingService.quickExploit(vulnerability, selectedOllamaModel);
        let response = `💥 EXPLOIT ANALYSIS: ${vulnerability}\n\n${result.response}`;
        if (result.warnings) {
          response = result.warnings.join('\n') + '\n\n' + response;
        }
        return response;
      } catch (error) {
        return `❌ Exploit analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    if (mainCommand === '!analyze') {
      const target = parts.slice(1).join(' ').trim();
      if (!target) {
        return 'Usage: !analyze <target>\n\nExample: !analyze webapp.com\n\n⚠️ Only analyze authorized targets!';
      }

      try {
        const result = await ethicalHackingService.quickAnalysis(target, selectedOllamaModel);
        let response = `🔬 SECURITY ANALYSIS: ${target}\n\n${result.response}`;
        if (result.warnings) {
          response = result.warnings.join('\n') + '\n\n' + response;
        }
        return response;
      } catch (error) {
        return `❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    if (mainCommand === '!code') {
      const requirement = parts.slice(1).join(' ').trim();
      if (!requirement) {
        return 'Usage: !code <requirement>\n\nExample: !code port scanner in python\n\n⚠️ Use tools ethically and legally!';
      }

      try {
        const result = await ethicalHackingService.quickCode(requirement, selectedOllamaModel);
        let response = `💻 SECURITY TOOL: ${requirement}\n\n${result.response}`;
        if (result.warnings) {
          response = result.warnings.join('\n') + '\n\n' + response;
        }
        return response;
      } catch (error) {
        return `❌ Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }



    // Handle status command
    if (mainCommand === '!status') {
      const ollamaStatusText = ollamaStatus.isRunning ? '✅ RUNNING' : '❌ OFFLINE';
      const activeModel = selectedOllamaModel || 'None';

      return `🔥 R3B3L 4F ETHICAL HACKING TERMINAL STATUS\n\n🤖 Active AI: Ollama (${activeModel})\n🧠 Left Panel: AI Chat Interface - ACTIVE\n⚡ Right Panel: Command Execution Terminal - ACTIVE\n\n🤖 Ollama Service: ${ollamaStatusText}\n📊 Available Models: ${ollamaModels.length} local\n🎯 Focus: Ethical hacking and penetration testing\n\n⚔️ LOCAL AI SOVEREIGNTY OPERATIONAL ⚔️`;
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



    // Handle help command
    if (mainCommand === '!help') {
      return `🔥 ETHICAL HACKING TERMINAL v2.0 - COMMAND REFERENCE

# 🤖 LOCAL AI - Ollama Integration (PRIMARY)
!ollama status                   → Check Ollama service and models
!ollama models                   → List available local models
!ollama select <model>           → Select active Ollama model

# 🔍 ETHICAL HACKING - Penetration Testing (AUTHORIZED ONLY!)
!recon <target>                  → Reconnaissance and information gathering
!exploit <vulnerability>         → Vulnerability analysis and exploitation
!analyze <target>                → Security analysis and assessment
!code <requirement>              → Generate security tools and scripts

⚠️ AUTHORIZATION REQUIRED: Only use on systems you own or have explicit permission to test!



# ⚡ SYSTEM COMMANDS
!help                            → Show this help menu
!clear                           → Clear terminal output
!save                            → Save current session to file
!mode ghost/rebel                → Switch between professional/cyberpunk themes
!dual-status                     → Show dual-screen system status
!airlock                         → Toggle security airlock mode
!encrypt                         → Toggle log encryption

# 🔧 UTILITY COMMANDS
!status                          → Show system status
!version                         → Show terminal version
!ping <url>                      → Test connectivity
!whoami                          → Show current user context

🎯 FOCUS: Ethical hacking, penetration testing, and security research
🤖 AI: Local Ollama models (r3b3l-4f-godmode, bianca, deepseek-coder, llama3.1)
⚠️ ETHICS: All operations must be authorized and legal

🔥 FOR AI SOVEREIGNTY. FOR ETHICAL HACKING. FOR SECURITY. 🔥
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
              R3B3L 4F ETHICAL HACKING TERMINAL
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
                🤖 R3B3L 4F ETHICAL HACKING AI ({selectedOllamaModel || 'No Model'})
              </span>
            </div>

            {/* Ollama Model Selector */}
            <div className="flex items-center gap-2">
              {ollamaModels.length > 0 && (
                <select
                  value={selectedOllamaModel}
                  onChange={(e) => setSelectedOllamaModel(e.target.value)}
                  className={cn(
                    'px-2 py-1 text-xs font-mono rounded border',
                    theme === 'ghost'
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-gray-800 border-red-500/30 text-cyan-400'
                  )}
                >
                  {ollamaModels.map(model => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Ollama Status Indicator */}
              <div className={cn(
                'w-2 h-2 rounded-full',
                ollamaStatus.isRunning ? 'bg-green-400' : 'bg-red-400'
              )}
              title={ollamaStatus.isRunning ? 'Ollama Running' : 'Ollama Offline'}
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
                      : message.type === 'ollama'
                      ? theme === 'ghost'
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 mr-8'
                        : 'bg-green-500/10 border-green-500/30 text-green-400 mr-8'
                      : theme === 'ghost'
                      ? 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'bg-gray-800 border-gray-600 text-cyan-400'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.type === 'user' && <User className="w-4 h-4" />}
                    {message.type === 'ollama' && <Shield className="w-4 h-4" />}
                    {message.type === 'system' && <TerminalIcon className="w-4 h-4" />}
                    <span className="text-xs font-mono opacity-70">
                      {message.type === 'user' ? 'USER' :
                       message.type === 'ollama' ? `R3B3L 4F AI (${message.ollamaModel || 'LOCAL'})` : 'SYSTEM'}
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
                  placeholder="Ask R3B3L 4F AI anything... (e.g., 'help me with reconnaissance on target.com')"
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
                Natural language → Ethical hacking commands → Terminal execution
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
