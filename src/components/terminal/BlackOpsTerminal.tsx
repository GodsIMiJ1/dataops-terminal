import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Zap, Shield, Terminal as TerminalIcon, Save, Lock, Unlock } from 'lucide-react';
import TerminalComponent from './TerminalComponent';
import { executeAndFormatCommand, confirmCommandExecution } from '@/services/CommandExecutionService';
import { parseNaturalLanguageCommand } from '@/services/CommandParserService';
import { useChatAI } from '@/hooks/useChatAI';
import {
  initScrollSession,
  logEntry,
  saveSessionToFile
} from '@/services/ScrollLoggerService';
import {
  initMission,
  updateCurrentMission,
  updateLastCommand,
  setCurrentMission,
  getCurrentMission,
  loadMissions
} from '@/services/MissionMemoryService';
import {
  activateAirlock,
  deactivateAirlock,
  isAirlockActive,
  getAirlockStatus,
  AIRLOCK_EVENTS
} from '@/services/AirlockService';
import {
  isEncryptionEnabled,
  toggleEncryption,
  setPassphrase,
  processScrollForLoading
} from '@/services/ScrollVaultService';
import {
  performNetworkScan
} from '@/services/NetworkReconService';
import {
  performGitHubRecon
} from '@/services/GitHubReconService';
import { cn } from '@/lib/utils';

interface BlackOpsTerminalProps {
  className?: string;
}

const BlackOpsTerminal: React.FC<BlackOpsTerminalProps> = ({ className }) => {
  const { sendMessage, messages, isLoading } = useChatAI();
  const [internetEnabled, setInternetEnabled] = useState(false);
  const [autonomyMode, setAutonomyMode] = useState(false);
  const [currentMission, setCurrentMission] = useState<string>('AWAITING ORDERS');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [pendingCommand, setPendingCommand] = useState<{command: string, token: string} | null>(null);
  const [nlpMode, setNlpMode] = useState(false);
  const [airlockActive, setAirlockActive] = useState(isAirlockActive());
  const [encryptionEnabled, setEncryptionEnabled] = useState(isEncryptionEnabled());

  const lastAiResponseRef = useRef<string>('');

  // Initialize scroll session and load missions
  useEffect(() => {
    initScrollSession('BlackOps Terminal Session');
    loadMissions();

    // Set current mission from mission memory if available
    const mission = getCurrentMission();
    if (mission) {
      setCurrentMission(mission.mission);
    }

    // Check if cloak mode is enabled in environment variables
    const cloakMode = import.meta.env.VITE_CLOAK_MODE === 'true';
    if (cloakMode) {
      activateAirlock();
      setAirlockActive(true);
      setInternetEnabled(false);
      logEntry('system', 'Cloak mode enabled: Airlock activated and internet access disabled');
    }

    // Check if initial scroll is specified in environment variables
    const initialScroll = import.meta.env.VITE_INITIAL_SCROLL;
    if (initialScroll) {
      logEntry('system', `Loading initial scroll: ${initialScroll}`);
      // Implementation for loading scroll will be added later
    }
  }, []);

  // Listen for airlock status changes
  useEffect(() => {
    const handleAirlockStatusChange = (event: CustomEvent) => {
      const { status } = event.detail;
      setAirlockActive(status === 'active');

      // If airlock is activated, disable internet access
      if (status === 'active' && internetEnabled) {
        setInternetEnabled(false);
        logEntry('system', 'Airlock activated: Internet access automatically disabled');
      }
    };

    // Add event listener
    window.addEventListener(
      AIRLOCK_EVENTS.AIRLOCK_STATUS_CHANGED,
      handleAirlockStatusChange as EventListener
    );

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener(
        AIRLOCK_EVENTS.AIRLOCK_STATUS_CHANGED,
        handleAirlockStatusChange as EventListener
      );
    };
  }, [internetEnabled]);

  // Update last AI response when messages change
  useEffect(() => {
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length > 0) {
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      lastAiResponseRef.current = lastMessage.content;
    }
  }, [messages]);

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

    // Check if NLP mode is enabled
    if (nlpMode && !command.startsWith('!') && !command.startsWith('?') && !command.startsWith('ask ')) {
      try {
        // Parse natural language command
        logEntry('system', `Parsing natural language command: ${command}`);
        const parsedResult = await parseNaturalLanguageCommand(command);

        // Show the parsed command and explanation
        const nlpOutput = `
Natural language command: "${command}"
Parsed as: ${parsedResult.parsedCommand}
Explanation: ${parsedResult.explanation}
Confidence: ${(parsedResult.confidence * 100).toFixed(1)}%

${parsedResult.alternatives && parsedResult.alternatives.length > 0 ?
  `Alternative commands:\n${parsedResult.alternatives.map(alt => `- ${alt}`).join('\n')}` : ''}

Executing: ${parsedResult.parsedCommand}
`;

        logEntry('system', nlpOutput);

        // Execute the parsed command
        const result = await executeAndFormatCommand(parsedResult.parsedCommand, { autonomyMode });

        // Check if command requires confirmation
        if (result.requiresConfirmation && result.confirmationToken) {
          setPendingCommand({
            command: parsedResult.parsedCommand,
            token: result.confirmationToken
          });

          logEntry('system', 'Command requires confirmation. Type "confirm" to execute.');
          return `${nlpOutput}\n\n${result.output}\n\nThis command requires confirmation due to potential security risks.\nType "confirm" to execute or enter a different command to cancel.`;
        }

        logEntry('response', result.output);
        return `${nlpOutput}\n\n${result.output}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logEntry('error', errorMessage);
        return `Error parsing natural language command: ${errorMessage}`;
      }
    } else {
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
    }
  };

  // Handle command confirmation
  const handleCommandConfirmation = async (): Promise<string> => {
    if (!pendingCommand) {
      return 'No command pending confirmation.';
    }

    try {
      const result = await confirmCommandExecution(
        pendingCommand.command,
        pendingCommand.token
      );

      // Clear the pending command
      setPendingCommand(null);

      logEntry('response', result.output);
      return result.output;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `Error confirming command: ${errorMessage}`;
    }
  };

  // Handle special commands (prefixed with !)
  const handleSpecialCommand = async (command: string): Promise<string> => {
    const cmd = command.substring(1).trim().toLowerCase();

    switch (cmd) {
      case 'help':
        return `
R3B3L 4F BlackOps Terminal Help:

System Commands:
  - Any standard shell command will be executed directly
  - Example: ls, pwd, echo hello

AI Interaction:
  - ?<query> or ask <query> - Ask the AI a question
  - Example: ?what is a buffer overflow

Special Commands:
  - !help - Show this help message
  - !internet on/off - Enable/disable internet access
  - !autonomy on/off - Enable/disable autonomy mode
  - !nlp on/off - Enable/disable natural language command parsing
  - !mission <name> - Set current mission name
  - !mission <name> -o <objective> - Set mission with objective
  - !save md/json - Save session log as Markdown or JSON
  - !clear - Clear the terminal
  - !status - Show current system status

Security Commands:
  - !airlock on/off - Block/allow all outbound HTTP requests
  - !encrypt on/off - Enable/disable scroll encryption
  - !decrypt-scroll <filename> - Decrypt an encrypted scroll
  - !passphrase <key> - Set encryption passphrase

Web Commands (Internet must be enabled):
  - !recon <url> - Download site HTML and source
  - !fetch-pub <DOI> - Pull metadata for academic publication
  - !scrape <keyword> <url> - Start crawl of target site for keyword

Extended Recon Suite:
  - !net-scan <domain/ip> - Perform DNS/IP scan and analysis
  - !git-harvest <org/user> - Crawl GitHub repositories and metadata
`;

      case 'internet on':
        setInternetEnabled(true);
        logEntry('system', 'Internet access enabled');
        return 'Internet access enabled';

      case 'internet off':
        setInternetEnabled(false);
        logEntry('system', 'Internet access disabled');
        return 'Internet access disabled';

      case 'autonomy on':
        setAutonomyMode(true);
        logEntry('system', 'Autonomy mode enabled');
        return 'Autonomy mode enabled - commands will be auto-confirmed';

      case 'autonomy off':
        setAutonomyMode(false);
        logEntry('system', 'Autonomy mode disabled');
        return 'Autonomy mode disabled - commands require confirmation';

      case 'nlp on':
        setNlpMode(true);
        logEntry('system', 'Natural language command parsing enabled');
        return 'Natural language command parsing enabled - you can now enter commands in plain English';

      case 'nlp off':
        setNlpMode(false);
        logEntry('system', 'Natural language command parsing disabled');
        return 'Natural language command parsing disabled - using direct command execution';

      case 'clear':
        return ''; // The terminal component will handle clearing

      case 'save md':
        saveSessionToFile('markdown');
        return 'Session saved as Markdown file';

      case 'save json':
        saveSessionToFile('json');
        return 'Session saved as JSON file';

      case 'airlock on':
        activateAirlock();
        setAirlockActive(true);
        logEntry('system', 'Airlock activated: All outbound HTTP requests will be blocked');
        return 'Airlock activated: All outbound HTTP requests will be blocked';

      case 'airlock off':
        deactivateAirlock();
        setAirlockActive(false);
        logEntry('system', 'Airlock deactivated: Outbound HTTP requests are now allowed');
        return 'Airlock deactivated: Outbound HTTP requests are now allowed';

      case 'encrypt on':
        toggleEncryption();
        setEncryptionEnabled(true);
        logEntry('system', 'Scroll encryption enabled: All saved logs will be encrypted');
        return 'Scroll encryption enabled: All saved logs will be encrypted';

      case 'encrypt off':
        toggleEncryption();
        setEncryptionEnabled(false);
        logEntry('system', 'Scroll encryption disabled: Logs will be saved in plaintext');
        return 'Scroll encryption disabled: Logs will be saved in plaintext';

      case 'status':
        return `
R3B3L 4F Status:
- Internet Access: ${internetEnabled ? 'ENABLED' : 'DISABLED'}
- Autonomy Mode: ${autonomyMode ? 'ENABLED' : 'DISABLED'}
- NLP Mode: ${nlpMode ? 'ENABLED' : 'DISABLED'}
- Airlock: ${airlockActive ? 'ACTIVE (Blocking External Requests)' : 'INACTIVE'}
- Encryption: ${encryptionEnabled ? 'ENABLED' : 'DISABLED'}
- Current Mission: ${currentMission}
- AI Model: r3b3l-4f-godmode (Ollama)
- Session Active: YES
- Backend: ${pendingCommand ? 'CONNECTED' : 'MOCK_EXECUTION_ONLY'}
`;
    }

    // Check if it's a mission command
    if (cmd.startsWith('mission ')) {
      const parts = cmd.substring(8).trim().split(' -o ');
      const missionName = parts[0].toUpperCase();
      const objective = parts.length > 1 ? parts[1] : undefined;

      // Update mission in state
      setCurrentMission(missionName);

      // Update mission in mission memory
      if (objective) {
        initMission(missionName, objective);
        logEntry('system', `Mission set to: ${missionName} with objective: ${objective}`);
        return `Mission set to: ${missionName}\nObjective: ${objective}`;
      } else {
        setCurrentMission(missionName);
        logEntry('system', `Mission set to: ${missionName}`);
        return `Mission set to: ${missionName}`;
      }
    }

    // Passphrase command
    if (cmd.startsWith('passphrase ')) {
      const passphrase = cmd.substring(11).trim();
      if (!passphrase) {
        return 'Usage: !passphrase <key>';
      }

      setPassphrase(passphrase);
      logEntry('system', 'Encryption passphrase updated');
      return 'Encryption passphrase updated';
    }

    // Decrypt scroll command
    if (cmd.startsWith('decrypt-scroll ')) {
      const filename = cmd.substring(15).trim();
      if (!filename) {
        return 'Usage: !decrypt-scroll <filename>';
      }

      try {
        logEntry('system', `Attempting to decrypt scroll: ${filename}`);
        // Implementation for decrypting scroll will be added later
        return `Attempting to decrypt scroll: ${filename}\n\nThis feature is not yet implemented.`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logEntry('error', errorMessage);
        return `Error decrypting scroll: ${errorMessage}`;
      }
    }

    // Web-connected task execution commands
    if (cmd.startsWith('recon ')) {
      if (!internetEnabled) {
        return 'Internet access is disabled. Enable with !internet on';
      }

      const url = cmd.substring(6).trim();
      if (!url) {
        return 'Usage: !recon <url>';
      }

      logEntry('system', `Starting reconnaissance on ${url}`);
      return await handleReconCommand(url);
    }

    if (cmd.startsWith('fetch-pub ')) {
      if (!internetEnabled) {
        return 'Internet access is disabled. Enable with !internet on';
      }

      const doi = cmd.substring(10).trim();
      if (!doi) {
        return 'Usage: !fetch-pub <DOI>';
      }

      logEntry('system', `Fetching publication metadata for ${doi}`);
      return await handleFetchPubCommand(doi);
    }

    if (cmd.startsWith('scrape ')) {
      if (!internetEnabled) {
        return 'Internet access is disabled. Enable with !internet on';
      }

      const args = cmd.substring(7).trim().split(' ');
      if (args.length < 2) {
        return 'Usage: !scrape <keyword> <url>';
      }

      const keyword = args[0];
      const url = args.slice(1).join(' ');

      logEntry('system', `Starting scrape for "${keyword}" on ${url}`);
      return await handleScrapeCommand(keyword, url);
    }

    // Extended Recon Suite commands
    if (cmd.startsWith('net-scan ')) {
      if (!internetEnabled) {
        return 'Internet access is disabled. Enable with !internet on';
      }

      const target = cmd.substring(9).trim();
      if (!target) {
        return 'Usage: !net-scan <domain/ip>';
      }

      logEntry('system', `Starting network scan for ${target}`);
      return await handleNetworkScanCommand(target);
    }

    if (cmd.startsWith('git-harvest ')) {
      if (!internetEnabled) {
        return 'Internet access is disabled. Enable with !internet on';
      }

      const target = cmd.substring(12).trim();
      if (!target) {
        return 'Usage: !git-harvest <org/user>';
      }

      logEntry('system', `Starting GitHub reconnaissance for ${target}`);
      return await handleGitHubReconCommand(target);
    }

    return `Unknown special command: ${command}. Type !help for available commands.`;
  };

  // Handle network scan command
  const handleNetworkScanCommand = async (target: string): Promise<string> => {
    try {
      const result = await performNetworkScan(target);

      // Format DNS results
      let dnsOutput = '';
      if (result.dns && result.dns.length > 0) {
        dnsOutput = '\nDNS Records:';
        for (const dns of result.dns) {
          dnsOutput += `\n  ${dns.type} Records for ${dns.hostname}:`;
          for (const address of dns.addresses) {
            dnsOutput += `\n    ${address}`;
          }
        }
      }

      // Format WHOIS results
      let whoisOutput = '';
      if (result.whois) {
        whoisOutput = '\nWHOIS Information:';
        if (result.whois.registrar) {
          whoisOutput += `\n  Registrar: ${result.whois.registrar}`;
        }
        if (result.whois.organization) {
          whoisOutput += `\n  Organization: ${result.whois.organization}`;
        }
        if (result.whois.creationDate) {
          whoisOutput += `\n  Creation Date: ${new Date(result.whois.creationDate).toLocaleDateString()}`;
        }
        if (result.whois.expirationDate) {
          whoisOutput += `\n  Expiration Date: ${new Date(result.whois.expirationDate).toLocaleDateString()}`;
        }
        if (result.whois.nameServers && result.whois.nameServers.length > 0) {
          whoisOutput += `\n  Name Servers: ${result.whois.nameServers.join(', ')}`;
        }
      }

      // Format HTTP headers
      let headersOutput = '';
      if (result.headers) {
        headersOutput = '\nHTTP Headers:';
        for (const [key, value] of Object.entries(result.headers)) {
          headersOutput += `\n  ${key}: ${value}`;
        }
      }

      // Format the final output
      return `
Network Scan Results for ${target}:
${dnsOutput}
${whoisOutput}
${headersOutput}

[Full scan results saved to session log]
`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `Error during network scan: ${errorMessage}`;
    }
  };

  // Handle GitHub reconnaissance command
  const handleGitHubReconCommand = async (target: string): Promise<string> => {
    try {
      const result = await performGitHubRecon(target);

      if (result.error) {
        throw new Error(result.error);
      }

      const data = result.data;

      // Format basic information
      let output = `
GitHub Reconnaissance Results for ${target}:

Type: ${result.type === 'user' ? 'User' : 'Organization'}
Name: ${data.name || data.login}
URL: ${data.html_url}
`;

      // Add user/org specific information
      if (result.type === 'user') {
        const userData = data as any;
        output += `
Bio: ${userData.bio || 'N/A'}
Location: ${userData.location || 'N/A'}
Email: ${userData.email || 'N/A'}
Public Repositories: ${userData.public_repos}
Followers: ${userData.followers}
Following: ${userData.following}
Created: ${new Date(userData.created_at).toLocaleDateString()}
`;
      } else {
        const orgData = data as any;
        output += `
Description: ${orgData.description || 'N/A'}
Location: ${orgData.location || 'N/A'}
Email: ${orgData.email || 'N/A'}
Public Repositories: ${orgData.public_repos}
`;
      }

      // Add repository information
      if (data.repositories && data.repositories.length > 0) {
        output += `
Repositories (${data.repositories.length} total):`;

        // Sort repositories by stars
        const sortedRepos = [...data.repositories].sort((a, b) => b.stargazers_count - a.stargazers_count);

        // Show top 5 repositories
        for (let i = 0; i < Math.min(5, sortedRepos.length); i++) {
          const repo = sortedRepos[i];
          output += `
  ${i + 1}. ${repo.name} (${repo.stargazers_count} ⭐)
     ${repo.description || 'No description'}
     Language: ${repo.language || 'N/A'}
     Updated: ${new Date(repo.updated_at).toLocaleDateString()}
     URL: ${repo.html_url}`;
        }

        if (sortedRepos.length > 5) {
          output += `\n\n  ... and ${sortedRepos.length - 5} more repositories`;
        }
      }

      output += `\n\n[Full reconnaissance results saved to session log]`;

      return output;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `Error during GitHub reconnaissance: ${errorMessage}`;
    }
  };

  // Handle AI queries
  const handleAiQuery = async (command: string): Promise<string> => {
    let query = command;

    // Remove the prefix
    if (query.startsWith('?')) {
      query = query.substring(1).trim();
    } else if (query.startsWith('ask ')) {
      query = query.substring(4).trim();
    }

    // Log the AI query
    logEntry('ai_prompt', query);

    try {
      // Send the query to the AI
      await sendMessage(query);

      // The response will be in lastAiResponseRef after the state updates
      // For now, return a placeholder
      const response = lastAiResponseRef.current || 'Processing your request...';

      // Log the AI response
      logEntry('ai_response', response);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `AI Error: ${errorMessage}`;
    }
  };

  // Handle recon command
  const handleReconCommand = async (url: string): Promise<string> => {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Fetch the HTML content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Save to scroll logger
      logEntry('response', `Reconnaissance completed for ${url}\nContent length: ${html.length} bytes`);

      // Create a summary
      const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || 'No title found';
      const metaDescription = html.match(/<meta name="description" content="(.*?)"/i)?.[1] || 'No description found';
      const links = (html.match(/<a [^>]*href="(.*?)"[^>]*>/gi) || []).length;
      const scripts = (html.match(/<script[^>]*>/gi) || []).length;

      return `
Reconnaissance completed for ${url}

Title: ${title}
Description: ${metaDescription}
Content length: ${html.length} bytes
Links found: ${links}
Scripts found: ${scripts}

Content sample:
${html.substring(0, 500)}...

[Full content saved to session log]
`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `Error during reconnaissance: ${errorMessage}`;
    }
  };

  // Handle fetch-pub command
  const handleFetchPubCommand = async (doi: string): Promise<string> => {
    try {
      // Clean DOI
      doi = doi.trim();

      // Fetch metadata from CrossRef API
      const response = await fetch(`https://api.crossref.org/works/${doi}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch publication: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const publication = data.message;

      // Save to scroll logger
      logEntry('response', `Publication metadata fetched for ${doi}`, publication);

      // Format the response
      const title = publication.title?.[0] || 'Unknown title';
      const authors = publication.author?.map((a: any) => `${a.given} ${a.family}`).join(', ') || 'Unknown authors';
      const journal = publication['container-title']?.[0] || 'Unknown journal';
      const year = publication.published?.['date-parts']?.[0]?.[0] || 'Unknown year';
      const url = publication.URL || '';

      return `
Publication metadata fetched for ${doi}

Title: ${title}
Authors: ${authors}
Journal: ${journal}
Year: ${year}
URL: ${url}

[Full metadata saved to session log]
`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `Error fetching publication: ${errorMessage}`;
    }
  };

  // Handle scrape command
  const handleScrapeCommand = async (keyword: string, url: string): Promise<string> => {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Fetch the HTML content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Simple keyword search
      const regex = new RegExp(keyword, 'gi');
      const matches = html.match(regex) || [];

      // Extract context around matches
      const contexts: string[] = [];
      let lastIndex = 0;

      for (let i = 0; i < Math.min(matches.length, 5); i++) {
        const matchIndex = html.indexOf(matches[i], lastIndex);
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(html.length, matchIndex + matches[i].length + 50);
          const context = html.substring(start, end).replace(/\s+/g, ' ').trim();
          contexts.push(`...${context}...`);
          lastIndex = matchIndex + 1;
        }
      }

      // Save to scroll logger
      logEntry('response', `Scrape completed for "${keyword}" on ${url}\nMatches found: ${matches.length}`, { matches: matches.length, contexts });

      return `
Scrape completed for "${keyword}" on ${url}

Matches found: ${matches.length}

${contexts.length > 0 ? 'Context samples:\n' + contexts.join('\n\n') : 'No context samples available'}

[Full scrape results saved to session log]
`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logEntry('error', errorMessage);
      return `Error during scrape: ${errorMessage}`;
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Status Bar */}
      <div className="cyber-panel p-2 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TerminalIcon className="w-4 h-4 text-cyber-red" />
            <span className="text-xs font-mono">R3B3L 4F</span>
          </div>

          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-cyber-cyan" />
            <span className="text-xs font-mono">Mission: {currentMission}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setInternetEnabled(!internetEnabled)}
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              internetEnabled ? "text-green-500" : "text-gray-500"
            )}
            title={internetEnabled ? "Disable Internet" : "Enable Internet"}
            disabled={airlockActive}
          >
            {internetEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {internetEnabled ? "ONLINE" : "OFFLINE"}
          </button>

          <button
            onClick={() => airlockActive ? deactivateAirlock() : activateAirlock()}
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              airlockActive ? "text-red-500" : "text-gray-500"
            )}
            title={airlockActive ? "Deactivate Airlock" : "Activate Airlock"}
          >
            {airlockActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {airlockActive ? "SEALED" : "OPEN"}
          </button>

          <button
            onClick={() => setAutonomyMode(!autonomyMode)}
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              autonomyMode ? "text-yellow-500" : "text-gray-500"
            )}
            title={autonomyMode ? "Disable Autonomy Mode" : "Enable Autonomy Mode"}
          >
            <Shield className="w-4 h-4" />
            {autonomyMode ? "AUTO" : "MANUAL"}
          </button>

          <button
            onClick={() => setNlpMode(!nlpMode)}
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              nlpMode ? "text-purple-500" : "text-gray-500"
            )}
            title={nlpMode ? "Disable NLP Mode" : "Enable NLP Mode"}
          >
            <Zap className="w-4 h-4" />
            {nlpMode ? "NLP" : "CMD"}
          </button>

          <button
            onClick={() => {
              const newState = !encryptionEnabled;
              toggleEncryption();
              setEncryptionEnabled(newState);
            }}
            className={cn(
              "flex items-center gap-1 text-xs font-mono",
              encryptionEnabled ? "text-blue-500" : "text-gray-500"
            )}
            title={encryptionEnabled ? "Disable Encryption" : "Enable Encryption"}
          >
            {encryptionEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {encryptionEnabled ? "CRYPT" : "PLAIN"}
          </button>

          <button
            onClick={() => saveSessionToFile('markdown')}
            className="flex items-center gap-1 text-xs font-mono text-cyber-cyan"
            title="Save Session Log"
          >
            <Save className="w-4 h-4" />
            SAVE
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1">
        <TerminalComponent
          onCommandExecute={handleCommandExecute}
          autoFocus={true}
          className="h-full"
        />
      </div>

      {/* NODE Sigil Watermark */}
      <div className="absolute bottom-2 right-2 opacity-30 pointer-events-none">
        <div className="text-xs font-mono text-cyber-red">GhostCode NODE</div>
      </div>
    </div>
  );
};

export default BlackOpsTerminal;
