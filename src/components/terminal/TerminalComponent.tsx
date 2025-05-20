import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, X, AlertTriangle, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  className?: string;
  initialCommand?: string;
  onCommandExecute?: (command: string) => Promise<string>;
  autoFocus?: boolean;
  showPrompt?: boolean;
  readOnly?: boolean;
}

interface TerminalLine {
  id: string;
  content: string;
  type: 'input' | 'output' | 'error' | 'system';
}

const TerminalComponent: React.FC<TerminalProps> = ({
  className,
  initialCommand = '',
  onCommandExecute,
  autoFocus = false,
  showPrompt = true,
  readOnly = false,
}) => {
  const [command, setCommand] = useState(initialCommand);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-focus input if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleCommandSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!command.trim() || isExecuting || readOnly) return;

    // Add command to history
    const newCommandLine: TerminalLine = {
      id: `input-${Date.now()}`,
      content: command,
      type: 'input',
    };
    
    setHistory(prev => [...prev, newCommandLine]);
    
    // Add to command history for up/down navigation
    setCommandHistory(prev => [command, ...prev]);
    setHistoryIndex(-1);
    
    setIsExecuting(true);
    
    try {
      if (onCommandExecute) {
        const result = await onCommandExecute(command);
        
        // Add result to history
        const outputLine: TerminalLine = {
          id: `output-${Date.now()}`,
          content: result,
          type: 'output',
        };
        
        setHistory(prev => [...prev, outputLine]);
      }
    } catch (error) {
      // Add error to history
      const errorLine: TerminalLine = {
        id: `error-${Date.now()}`,
        content: error instanceof Error ? error.message : String(error),
        type: 'error',
      };
      
      setHistory(prev => [...prev, errorLine]);
    } finally {
      setIsExecuting(false);
      setCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrow keys for command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  return (
    <div className={cn('cyber-panel rounded flex flex-col h-full', className)}>
      <div className="cyber-scanline"></div>
      
      {/* Terminal Header */}
      <div className="p-2 border-b border-cyber-red/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyber-red" />
          <span className="text-sm font-mono text-cyber-red">R3B3L 4F — Sovereign Command Shell</span>
        </div>
        <button 
          onClick={clearTerminal}
          className="text-gray-400 hover:text-cyber-red transition-colors"
          title="Clear Terminal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-sm bg-cyber-black/80"
      >
        {history.map((line) => {
          let lineClass = '';
          let icon = null;
          
          switch (line.type) {
            case 'input':
              lineClass = 'text-cyber-cyan';
              icon = <Play className="w-3 h-3 text-cyber-cyan" />;
              break;
            case 'output':
              lineClass = 'text-white';
              break;
            case 'error':
              lineClass = 'text-cyber-red';
              icon = <AlertTriangle className="w-3 h-3 text-cyber-red" />;
              break;
            case 'system':
              lineClass = 'text-yellow-500';
              icon = <Cpu className="w-3 h-3 text-yellow-500" />;
              break;
          }
          
          return (
            <div key={line.id} className="mb-1">
              {line.type === 'input' ? (
                <div className="flex items-start">
                  <span className="text-cyber-red mr-1">$</span>
                  <span className={lineClass}>{line.content}</span>
                </div>
              ) : (
                <div className="flex items-start">
                  {icon && <span className="mr-1 mt-1">{icon}</span>}
                  <pre className={cn('whitespace-pre-wrap break-all', lineClass)}>
                    {line.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        
        {isExecuting && (
          <div className="flex items-center gap-2 text-cyber-cyan">
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>
      
      {/* Terminal Input */}
      {!readOnly && (
        <form onSubmit={handleCommandSubmit} className="border-t border-cyber-red/30 p-2">
          <div className="flex items-center">
            {showPrompt && <span className="text-cyber-red mr-1">$</span>}
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              className="flex-1 bg-transparent border-none outline-none text-cyber-cyan font-mono text-sm"
              placeholder="Enter command..."
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default TerminalComponent;
