import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, X, AlertTriangle, Cpu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import ollamaService, { OllamaModel } from '@/services/OllamaService';
import ethicalHackingService from '@/services/EthicalHackingService';
import ollamaService from '@/services/OllamaService';
import ethicalHackingService from '@/services/EthicalHackingService';

interface TerminalProps {
  className?: string;
  initialCommand?: string;
  onCommandExecute?: (command: string) => Promise<string>;
  autoFocus?: boolean;
  showPrompt?: boolean;
  readOnly?: boolean;
  theme?: 'suit' | 'ghost';
  terminalId?: string; // Unique ID for this terminal instance
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
  terminalId = 'default',
}) => {
  const [command, setCommand] = useState(initialCommand);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Ollama integration for this terminal instance
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('');
  const [ollamaStatus, setOllamaStatus] = useState<{isRunning: boolean, error?: string}>({isRunning: false});
  const [showModelSelector, setShowModelSelector] = useState(false);

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

  // Initialize Ollama service for this terminal
  useEffect(() => {
    const initializeOllama = async () => {
      try {
        const status = await ollamaService.getStatus();
        setOllamaStatus({isRunning: status.isRunning, error: status.error});

        if (status.isRunning && status.models.length > 0) {
          setOllamaModels(status.models);

          // Auto-select model based on terminal purpose
          const defaultModel = getDefaultModelForTerminal(terminalId, status.models);
          if (defaultModel) {
            setSelectedOllamaModel(defaultModel);

            // Add system message about model selection
            const systemMessage: TerminalLine = {
              id: Date.now().toString(),
              content: `🤖 ${terminalId.toUpperCase()} TERMINAL: Auto-selected ${defaultModel} for optimal performance`,
              type: 'system'
            };
            setHistory(prev => [...prev, systemMessage]);
          }
        } else if (!status.isRunning) {
          const errorMessage: TerminalLine = {
            id: Date.now().toString(),
            content: `⚠️ Ollama service not detected. Start with: ollama serve`,
            type: 'error'
          };
          setHistory(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Failed to initialize Ollama in terminal:', error);
      }
    };

    initializeOllama();

    // Auto-refresh every 30 seconds
    const interval = setInterval(initializeOllama, 30000);
    return () => clearInterval(interval);
  }, [terminalId]);

  // Get default model based on terminal purpose
  const getDefaultModelForTerminal = (terminalId: string, models: OllamaModel[]): string | null => {
    const modelPreferences = {
      'chat': ['r3b3l-4f-godmode', 'llama3.1:latest', 'bianca'], // Strategic planning
      'cli': ['deepseek-coder:6.7b', 'r3b3l-4f-godmode', 'llama3.1:latest'], // Code execution
      'default': ['llama3.1:latest', 'r3b3l-4f-godmode', 'deepseek-coder:6.7b']
    };

    const preferences = modelPreferences[terminalId as keyof typeof modelPreferences] || modelPreferences.default;

    for (const preferred of preferences) {
      const found = models.find(m => m.name.includes(preferred));
      if (found) return found.name;
    }

    return models[0]?.name || null;
  };

  // Process Ollama commands in terminal
  const processOllamaCommand = async (input: string): Promise<string> => {
    if (!ollamaStatus.isRunning) {
      return '❌ Ollama service not running. Start with: ollama serve';
    }

    if (!selectedOllamaModel) {
      return '❌ No Ollama model selected. Use !model select <model-name>';
    }

    try {
      // Check if this looks like an ethical hacking request
      const lowerInput = input.toLowerCase();
      const hackingKeywords = ['recon', 'scan', 'exploit', 'vulnerability', 'penetration', 'security', 'hack', 'enumerate', 'payload', 'code', 'script'];
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

        return response;
      } else {
        // Regular chat with Ollama
        const systemPrompt = terminalId === 'cli'
          ? 'You are a coding assistant specialized in ethical hacking tools and security scripts. Provide clean, well-commented code with security best practices. Focus on educational and authorized testing purposes only.'
          : 'You are a helpful AI assistant focused on ethical hacking and cybersecurity. Provide helpful, educational responses while emphasizing legal and ethical practices.';

        const response = await ollamaService.generate(
          selectedOllamaModel,
          input,
          systemPrompt
        );

        return response;
      }
    } catch (error) {
      return `❌ Ollama error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

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
      let result = '';

      // Handle Ollama model commands
      if (command.startsWith('!model ')) {
        const parts = command.split(' ');
        const action = parts[1]?.toLowerCase();

        if (action === 'select') {
          const modelName = parts.slice(2).join(' ').trim();
          if (!modelName) {
            result = 'Usage: !model select <model-name>\n\nAvailable models: ' + ollamaModels.map(m => m.name).join(', ');
          } else {
            const model = ollamaModels.find(m => m.name.includes(modelName));
            if (model) {
              setSelectedOllamaModel(model.name);
              result = `✅ Selected model: ${model.name} for ${terminalId.toUpperCase()} terminal`;
            } else {
              result = `❌ Model not found: ${modelName}\n\nAvailable: ${ollamaModels.map(m => m.name).join(', ')}`;
            }
          }
        } else if (action === 'status') {
          const statusText = ollamaStatus.isRunning ? '✅ RUNNING' : '❌ OFFLINE';
          result = `🤖 OLLAMA STATUS: ${statusText}\n\nTerminal: ${terminalId.toUpperCase()}\nSelected Model: ${selectedOllamaModel || 'None'}\nAvailable Models: ${ollamaModels.length}`;
        } else if (action === 'list') {
          const modelList = ollamaModels.map(m => `• ${m.name} (${m.size})`).join('\n');
          result = `🤖 AVAILABLE MODELS:\n\n${modelList || 'No models installed'}`;
        } else {
          result = 'Usage: !model <select|status|list>\n\nExamples:\n!model select deepseek-coder\n!model status\n!model list';
        }
      }
      // Handle AI chat commands
      else if (command.startsWith('!ai ')) {
        const prompt = command.substring(4).trim();
        if (!prompt) {
          result = 'Usage: !ai <your question>\n\nExample: !ai write a python port scanner';
        } else {
          result = await processOllamaCommand(prompt);
        }
      }
      // Regular command execution
      else if (onCommandExecute) {
        result = await onCommandExecute(command);
      } else {
        result = `Command not recognized: ${command}\n\nTry:\n!model status - Check Ollama status\n!ai <question> - Ask AI assistant`;
      }

      // Add result to history
      const outputLine: TerminalLine = {
        id: `output-${Date.now()}`,
        content: result,
        type: 'output',
      };

      setHistory(prev => [...prev, outputLine]);
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
            R3B3L 4F {terminalId.toUpperCase()} TERMINAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Ollama Model Selector */}
          {ollamaModels.length > 0 && (
            <select
              value={selectedOllamaModel}
              onChange={(e) => setSelectedOllamaModel(e.target.value)}
              className={cn(
                'px-2 py-1 text-xs font-mono rounded border',
                theme === 'ghost'
                  ? 'bg-gray-800 border-cyber-red/30 text-cyber-red'
                  : 'bg-gray-100 border-gray-300 text-gray-700'
              )}
              title="Select Ollama Model"
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
