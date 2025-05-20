/**
 * Command Execution Service
 *
 * This service handles executing commands and returning their output.
 * In a browser environment, it uses a proxy server to execute commands.
 * In a Node.js environment, it can execute commands directly.
 */

// Define the command execution interface
export interface CommandExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  requiresConfirmation?: boolean;
  confirmationToken?: string;
}

// Define the command execution options
export interface CommandExecutionOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  shell?: boolean;
  autonomyMode?: boolean;
}

/**
 * Execute a command and return the result
 * This calls the backend API to execute commands
 */
export const executeCommand = async (
  command: string,
  options: CommandExecutionOptions = {}
): Promise<CommandExecutionResult> => {
  console.log(`Executing command: ${command}`);
  console.log('Options:', options);

  // API endpoint for command execution
  const API_URL = 'http://localhost:3001/api/execute';
  const API_TOKEN = 'r3b3l-4f-secure-token'; // Should be in environment variables

  try {
    // Call the backend API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': API_TOKEN
      },
      body: JSON.stringify({
        command,
        autonomy: options.autonomyMode || false,
        cwd: options.cwd
      })
    });

    const data = await response.json();

    // Check if command requires confirmation
    if (response.status === 403 && data.requiresConfirmation) {
      // Return a special result for commands that need confirmation
      return {
        output: data.message,
        requiresConfirmation: true,
        confirmationToken: data.confirmationToken,
        exitCode: 0
      };
    }

    // Check for errors
    if (!response.ok) {
      return {
        output: '',
        error: data.error || 'Failed to execute command',
        exitCode: 1
      };
    }

    return data;
  } catch (error) {
    console.error('Error executing command:', error);

    // Fallback to mock implementation if backend is not available
    return fallbackExecuteCommand(command);
  }
};

/**
 * Confirm execution of a dangerous command
 */
export const confirmCommandExecution = async (
  command: string,
  confirmationToken: string
): Promise<CommandExecutionResult> => {
  const API_URL = 'http://localhost:3001/api/confirm';
  const API_TOKEN = 'r3b3l-4f-secure-token'; // Should be in environment variables

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': API_TOKEN
      },
      body: JSON.stringify({
        command,
        confirmationToken
      })
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        output: '',
        error: data.error || 'Failed to confirm command execution',
        exitCode: 1
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming command execution:', error);
    return {
      output: '',
      error: `Error confirming command: ${error instanceof Error ? error.message : String(error)}`,
      exitCode: 1
    };
  }
};

/**
 * Fallback mock implementation for when the backend is not available
 */
const fallbackExecuteCommand = async (command: string): Promise<CommandExecutionResult> => {
  console.warn('Using fallback command execution');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock responses for common commands
  if (command.startsWith('echo')) {
    return {
      output: command.substring(5),
      exitCode: 0
    };
  }

  if (command.startsWith('ls') || command.startsWith('dir')) {
    return {
      output: 'file1.txt\nfile2.txt\ndirectory1/\ndirectory2/\n[MOCK MODE - Backend not connected]',
      exitCode: 0
    };
  }

  if (command.startsWith('pwd')) {
    return {
      output: '/home/user/projects/r3b3l-4f\n[MOCK MODE - Backend not connected]',
      exitCode: 0
    };
  }

  if (command.startsWith('whoami')) {
    return {
      output: 'r3b3l-user\n[MOCK MODE - Backend not connected]',
      exitCode: 0
    };
  }

  if (command.startsWith('date')) {
    return {
      output: `${new Date().toString()}\n[MOCK MODE - Backend not connected]`,
      exitCode: 0
    };
  }

  return {
    output: `Command executed in mock mode: ${command}\n[MOCK MODE - Backend not connected]`,
    error: 'Backend server not available',
    exitCode: 0
  };
};

/**
 * Parse a command string into command and arguments
 */
export const parseCommand = (commandString: string): { command: string; args: string[] } => {
  const parts = commandString.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  return { command, args };
};

/**
 * Format command output for display
 */
export const formatCommandOutput = (result: CommandExecutionResult): string => {
  if (result.error) {
    return `Error: ${result.error}\nExit code: ${result.exitCode}`;
  }

  return result.output;
};

/**
 * Execute a command and format the output
 */
export const executeAndFormatCommand = async (
  command: string,
  options: CommandExecutionOptions = {}
): Promise<string> => {
  try {
    const result = await executeCommand(command, options);
    return formatCommandOutput(result);
  } catch (error) {
    return `Error executing command: ${error instanceof Error ? error.message : String(error)}`;
  }
};
