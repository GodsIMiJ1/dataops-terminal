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
  theme?: 'suit' | 'ghost';
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
  theme = 'suit',
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
    <div className={cn(
      'rounded flex flex-col h-full shadow-lg',
      theme === 'ghost'
        ? 'cyber-panel'
        : 'border border-pro-border bg-white dark:bg-pro-bg-dark',
      className
    )}>
      {theme === 'ghost' && <div className="cyber-scanline"></div>}

      {/* Terminal Header - Professional or Cyberpunk style */}
      <div className={cn(
        "p-2 flex items-center justify-between",
        theme === 'ghost'
          ? "border-b border-cyber-red/30 bg-gradient-to-r from-cyber-black to-gray-900"
          : "border-b border-pro-border bg-pro-bg-panel dark:bg-pro-bg-darkPanel"
      )}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" title="Close"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer" title="Minimize"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer" title="Maximize"></div>
          </div>
          <TerminalIcon className={cn(
            "w-4 h-4",
            theme === 'ghost' ? "text-cyber-red" : "text-pro-primary"
          )} />
          <span className={cn(
            "text-sm font-mono",
            theme === 'ghost' ? "text-cyber-red" : "text-pro-text dark:text-pro-text-dark"
          )}>
            DataOps Terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearTerminal}
            className={cn(
              "transition-colors",
              theme === 'ghost'
                ? "text-gray-400 hover:text-cyber-red"
                : "text-pro-text-muted hover:text-pro-primary dark:text-pro-text-mutedDark dark:hover:text-pro-primary-light"
            )}
            title="Clear Terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output - Styled based on theme */}
      <div
        ref={terminalRef}
        className={cn(
          "flex-1 overflow-y-auto p-3 font-mono text-base",
          theme === 'ghost'
            ? "bg-cyber-black/90"
            : "bg-white dark:bg-pro-bg-dark"
        )}
        style={theme === 'ghost' ? {
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3) 1px, transparent 1px)',
          backgroundSize: '100% 4px',
          textShadow: '0 0 2px rgba(0, 255, 255, 0.3)'
        } : {}}
      >
        {history.map((line) => {
          let lineClass = '';
          let icon = null;

          switch (line.type) {
            case 'input':
              if (theme === 'ghost') {
                lineClass = 'text-cyber-cyan';
                icon = <Play className="w-3 h-3 text-cyber-cyan" />;
              } else {
                lineClass = 'text-pro-primary';
                icon = <Play className="w-3 h-3 text-pro-primary" />;
              }
              break;
            case 'output':
              lineClass = theme === 'ghost' ? 'text-white' : 'text-pro-text dark:text-pro-text-dark';
              break;
            case 'error':
              if (theme === 'ghost') {
                lineClass = 'text-cyber-red';
                icon = <AlertTriangle className="w-3 h-3 text-cyber-red" />;
              } else {
                lineClass = 'text-red-500';
                icon = <AlertTriangle className="w-3 h-3 text-red-500" />;
              }
              break;
            case 'system':
              if (theme === 'ghost') {
                lineClass = 'text-yellow-500';
                icon = <Cpu className="w-3 h-3 text-yellow-500" />;
              } else {
                lineClass = 'text-pro-secondary';
                icon = <Cpu className="w-3 h-3 text-pro-secondary" />;
              }
              break;
          }

          return (
            <div key={line.id} className="mb-2">
              {line.type === 'input' ? (
                <div className="flex items-start">
                  <span className="text-cyber-red mr-2 font-bold">$</span>
                  <span className={cn(lineClass, 'font-bold')}>{line.content}</span>
                </div>
              ) : (
                <div className="flex items-start">
                  {icon && <span className="mr-2 mt-1">{icon}</span>}
                  <pre className={cn('whitespace-pre-wrap break-all leading-relaxed', lineClass)}>
                    {line.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {isExecuting && (
          <div className="flex items-center gap-2 text-cyber-cyan my-2">
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>

      {/* Terminal Input - Styled based on theme */}
      {!readOnly && (
        <form
          onSubmit={handleCommandSubmit}
          className={cn(
            "border-t p-3",
            theme === 'ghost'
              ? "border-cyber-red/30 bg-gradient-to-r from-cyber-black to-gray-900"
              : "border-pro-border bg-pro-bg-panel dark:bg-pro-bg-darkPanel"
          )}
        >
          <div className="flex items-center">
            {showPrompt && (
              <span className={cn(
                "mr-2 font-bold text-base",
                theme === 'ghost' ? "text-cyber-red" : "text-pro-primary"
              )}>
                $
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              className={cn(
                "flex-1 bg-transparent border-none outline-none font-mono text-base",
                theme === 'ghost'
                  ? "text-cyber-cyan"
                  : "text-pro-text dark:text-pro-text-dark"
              )}
              placeholder="Enter command..."
              autoComplete="off"
              spellCheck="false"
              style={{ caretColor: theme === 'ghost' ? '#0ff' : '#0ea5e9' }}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default TerminalComponent;
