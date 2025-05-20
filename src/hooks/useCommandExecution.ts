import { useState, useCallback } from 'react';
import { executeAndFormatCommand, CommandExecutionOptions } from '@/services/CommandExecutionService';

interface UseCommandExecutionReturn {
  executeCommand: (command: string, options?: CommandExecutionOptions) => Promise<string>;
  isExecuting: boolean;
  lastOutput: string | null;
  lastError: string | null;
  clearOutput: () => void;
}

export const useCommandExecution = (): UseCommandExecutionReturn => {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const executeCommand = useCallback(async (
    command: string,
    options: CommandExecutionOptions = {}
  ): Promise<string> => {
    setIsExecuting(true);
    setLastError(null);
    
    try {
      const output = await executeAndFormatCommand(command, options);
      setLastOutput(output);
      return output;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLastError(errorMessage);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setLastOutput(null);
    setLastError(null);
  }, []);

  return {
    executeCommand,
    isExecuting,
    lastOutput,
    lastError,
    clearOutput
  };
};

export default useCommandExecution;
