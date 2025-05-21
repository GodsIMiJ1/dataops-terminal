/**
 * CommandAutoCompleteService.ts
 * 
 * A service for providing command auto-completion in the terminal.
 */

// Command definition for auto-completion
export interface CommandDefinition {
  name: string;
  description: string;
  args?: string[];
  subcommands?: CommandDefinition[];
}

class CommandAutoCompleteService {
  private commands: CommandDefinition[] = [];
  
  /**
   * Initialize with default commands
   */
  initialize(): void {
    this.registerDefaultCommands();
  }
  
  /**
   * Register default commands for auto-completion
   */
  private registerDefaultCommands(): void {
    this.commands = [
      {
        name: '!help',
        description: 'Show available commands and the R3B3L Guide to Web Warfare'
      },
      {
        name: '!mission',
        description: 'Set current mission name or create a new mission with objective',
        args: ['-o', '--objective']
      },
      {
        name: '!status',
        description: 'Show current system status including internet access, modes, and mission'
      },
      {
        name: '!save',
        description: 'Save session log as Markdown or JSON file',
        args: ['md', 'json']
      },
      {
        name: '!clear',
        description: 'Clear the terminal screen'
      },
      {
        name: '!internet',
        description: 'Enable or disable internet access for web commands',
        args: ['on', 'off']
      },
      {
        name: '!nlp',
        description: 'Enable or disable natural language command parsing',
        args: ['on', 'off']
      },
      {
        name: '!autonomy',
        description: 'Enable or disable autonomy mode (auto-confirm commands)',
        args: ['on', 'off']
      },
      {
        name: '!airlock',
        description: 'Block or allow all outbound HTTP requests',
        args: ['on', 'off']
      },
      {
        name: '!encrypt',
        description: 'Enable or disable scroll encryption for logs',
        args: ['on', 'off']
      },
      {
        name: '!decrypt-scroll',
        description: 'Decrypt an encrypted scroll file',
        args: ['<filename>']
      },
      {
        name: '!passphrase',
        description: 'Set encryption passphrase for scroll encryption',
        args: ['<passphrase>']
      },
      {
        name: '!recon',
        description: 'Download site HTML and source for analysis',
        args: ['<url>']
      },
      {
        name: '!fetch-pub',
        description: 'Pull metadata for academic publication using DOI',
        args: ['<doi>']
      },
      {
        name: '!scrape',
        description: 'Start crawl of target site for specific keyword',
        args: ['<keyword>', '<url>']
      },
      {
        name: '!net-scan',
        description: 'Perform DNS/IP scan and analysis on a domain or IP',
        args: ['<domain/ip>']
      },
      {
        name: '!git-harvest',
        description: 'Crawl GitHub repositories and metadata for an organization or user',
        args: ['<username/org>']
      },
      {
        name: '!scan',
        description: 'Scan academic paper metadata with threat detection',
        args: ['--doi', '--output']
      },
      {
        name: '!science-scan',
        description: 'Search Science.org for research articles on specific topics',
        args: ['--query', '--limit', '--output']
      },
      {
        name: '!r3b3l',
        description: 'Bright Data MCP commands',
        subcommands: [
          {
            name: 'discover',
            description: 'Find relevant content across the web using Bright Data\'s infrastructure',
            args: ['--query', '--output']
          },
          {
            name: 'access',
            description: 'Access complex websites with rendering and authentication support',
            args: ['--url', '--render', '--auth', '--output']
          },
          {
            name: 'extract',
            description: 'Extract structured data from websites using specified schema',
            args: ['--url', '--schema', '--output']
          },
          {
            name: 'interact',
            description: 'Interact with websites by simulating user actions',
            args: ['--url', '--simulate', '--output']
          },
          {
            name: 'collect',
            description: 'Run a pre-configured Data Collector for specialized targets',
            args: ['--target', '--params', '--output']
          },
          {
            name: 'ops',
            description: 'Open Bright Data Operations Panel to view and manage operations'
          }
        ]
      }
    ];
  }
  
  /**
   * Register a new command for auto-completion
   * @param command The command definition
   */
  registerCommand(command: CommandDefinition): void {
    this.commands.push(command);
  }
  
  /**
   * Get auto-completion suggestions for a command
   * @param input The current input text
   * @returns Array of suggestions
   */
  getSuggestions(input: string): { suggestion: string, description: string }[] {
    if (!input) {
      return [];
    }
    
    const parts = input.trim().split(' ');
    const commandPart = parts[0];
    
    // If we're just starting to type a command
    if (parts.length === 1) {
      return this.commands
        .filter(cmd => cmd.name.startsWith(commandPart))
        .map(cmd => ({
          suggestion: cmd.name,
          description: cmd.description
        }));
    }
    
    // If we're typing a subcommand
    if (parts.length === 2 && commandPart === '!r3b3l') {
      const subcommandPart = parts[1];
      const r3b3lCommand = this.commands.find(cmd => cmd.name === '!r3b3l');
      
      if (r3b3lCommand && r3b3lCommand.subcommands) {
        return r3b3lCommand.subcommands
          .filter(subcmd => subcmd.name.startsWith(subcommandPart))
          .map(subcmd => ({
            suggestion: `!r3b3l ${subcmd.name}`,
            description: subcmd.description
          }));
      }
    }
    
    // If we're typing arguments
    const command = this.commands.find(cmd => cmd.name === commandPart);
    if (command && command.args) {
      // For subcommands
      if (commandPart === '!r3b3l' && parts.length >= 2) {
        const subcommandName = parts[1];
        const subcommand = command.subcommands?.find(subcmd => subcmd.name === subcommandName);
        
        if (subcommand && subcommand.args) {
          const currentArg = parts[parts.length - 1];
          return subcommand.args
            .filter(arg => arg.startsWith(currentArg) && !parts.slice(2, -1).includes(arg))
            .map(arg => ({
              suggestion: `${parts.slice(0, -1).join(' ')} ${arg}`,
              description: `Argument for ${commandPart} ${subcommandName}`
            }));
        }
      }
      
      // For regular commands
      const currentArg = parts[parts.length - 1];
      return command.args
        .filter(arg => arg.startsWith(currentArg) && !parts.slice(1, -1).includes(arg))
        .map(arg => ({
          suggestion: `${parts.slice(0, -1).join(' ')} ${arg}`,
          description: `Argument for ${commandPart}`
        }));
    }
    
    return [];
  }
  
  /**
   * Complete the current input with the selected suggestion
   * @param input The current input text
   * @param suggestion The selected suggestion
   * @returns The completed input
   */
  completeInput(input: string, suggestion: string): string {
    return suggestion;
  }
  
  /**
   * Get all registered commands
   * @returns Array of command definitions
   */
  getAllCommands(): CommandDefinition[] {
    return [...this.commands];
  }
}

// Export a singleton instance
export const commandAutoCompleteService = new CommandAutoCompleteService();
export default commandAutoCompleteService;
