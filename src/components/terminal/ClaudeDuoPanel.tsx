import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Brain, Terminal, Send, X, Zap, Code, MessageSquare, Settings } from 'lucide-react';

interface ClaudeDuoPanelProps {
  className?: string;
  onClose: () => void;
  theme: 'suit' | 'ghost';
  onCommandExecute: (command: string) => Promise<string>;
}

interface Message {
  id: string;
  type: 'user' | 'opus' | 'code' | 'system';
  content: string;
  timestamp: Date;
}

const ClaudeDuoPanel: React.FC<ClaudeDuoPanelProps> = ({ 
  className, 
  onClose, 
  theme,
  onCommandExecute 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [opusInput, setOpusInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePanel, setActivePanel] = useState<'opus' | 'code'>('opus');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'system',
      content: '🔥 CLAUDE DUO ACTIVATED - DUAL-SCREEN FLAME VIEW\n\n🧠 Left: Claude Opus 4 (Strategic GUI)\n⚡ Right: Claude Code (Execution CLI)\n\nTwo minds. One terminal. Sovereign sync.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Opus input (GUI side)
  const handleOpusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opusInput.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: opusInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Simulate Claude Opus 4 strategic response
      const opusResponse = await generateOpusResponse(opusInput);
      
      const opusMessage: Message = {
        id: Date.now().toString() + '_opus',
        type: 'opus',
        content: opusResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, opusMessage]);

      // Auto-generate Claude Code command if applicable
      const codeCommand = extractCodeCommand(opusInput);
      if (codeCommand) {
        setCCodeInput(codeCommand);
        // Auto-execute if it's a safe command
        if (isSafeCommand(codeCommand)) {
          await executeCodeCommand(codeCommand);
        }
      }

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'system',
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setOpusInput('');
    }
  };

  // Handle Code input (CLI side)
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim() || isProcessing) return;

    await executeCodeCommand(codeInput);
    setCCodeInput('');
  };

  // Execute Claude Code command
  const executeCodeCommand = async (command: string) => {
    const codeMessage: Message = {
      id: Date.now().toString() + '_code_input',
      type: 'user',
      content: `> ${command}`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, codeMessage]);
    setIsProcessing(true);

    try {
      const result = await onCommandExecute(command);
      
      const responseMessage: Message = {
        id: Date.now().toString() + '_code_output',
        type: 'code',
        content: result,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + '_code_error',
        type: 'system',
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Claude Opus 4 strategic response
  const generateOpusResponse = async (input: string): Promise<string> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    if (input.toLowerCase().includes('analyze')) {
      return `🧠 CLAUDE OPUS 4 STRATEGIC ANALYSIS

Context: ${input}

Strategic Assessment:
• Architecture: DataOps Terminal demonstrates excellent autonomous capabilities
• Integration: GHOSTCLI + Claude Code creates powerful dual-AI system
• Opportunity: Enhance with real-time collaboration features
• Risk: Ensure proper error handling for production deployment

Recommended Actions:
1. Execute codebase analysis via Claude Code
2. Implement suggested improvements
3. Test autonomous operations
4. Deploy with confidence

Strategic Priority: HIGH - This enhancement will dominate the hackathon.`;
    } else if (input.toLowerCase().includes('fix') || input.toLowerCase().includes('bug')) {
      return `🔧 CLAUDE OPUS 4 BUG RESOLUTION STRATEGY

Issue Context: ${input}

Strategic Approach:
• Root Cause Analysis: Identify core system dependencies
• Impact Assessment: Evaluate potential downstream effects
• Solution Design: Implement minimal, targeted fixes
• Validation Plan: Comprehensive testing protocol

Execution Strategy:
1. Claude Code will perform automated diagnosis
2. Apply surgical fixes to maintain system integrity
3. Validate all autonomous operations remain functional
4. Document resolution for future reference

Confidence Level: MAXIMUM - Dual-AI approach ensures success.`;
    } else if (input.toLowerCase().includes('enhance') || input.toLowerCase().includes('feature')) {
      return `🚀 CLAUDE OPUS 4 ENHANCEMENT STRATEGY

Feature Request: ${input}

Strategic Vision:
• Innovation Opportunity: Expand autonomous capabilities
• Technical Excellence: Maintain enterprise-grade standards
• User Experience: Seamless integration with existing workflows
• Competitive Advantage: Unique dual-AI architecture

Implementation Plan:
1. Claude Code will architect the enhancement
2. Integrate with GHOSTCLI autonomous operations
3. Maintain professional Bright Data branding
4. Test across all operational scenarios

Success Metrics: Enhanced autonomy + Professional presentation = Hackathon victory.`;
    } else {
      return `🧠 CLAUDE OPUS 4 STRATEGIC RESPONSE

Input Analysis: ${input}

Strategic Context:
The DataOps Terminal represents a breakthrough in autonomous development platforms. Your request aligns with our mission to create the most advanced AI-powered terminal experience.

Strategic Recommendations:
• Leverage dual-AI architecture for maximum capability
• Maintain focus on enterprise-grade output quality
• Ensure seamless integration between GUI and CLI components
• Prioritize autonomous operation reliability

Next Actions:
Claude Code stands ready to execute your strategic vision with precision and excellence.

Status: ✅ Strategic analysis complete. Ready for execution.`;
    }
  };

  // Extract potential Claude Code command from Opus input
  const extractCodeCommand = (input: string): string => {
    if (input.toLowerCase().includes('analyze')) {
      return '!claude analyze the GHOSTCLI architecture';
    } else if (input.toLowerCase().includes('fix')) {
      return '!claude fix any TypeScript compilation errors';
    } else if (input.toLowerCase().includes('enhance')) {
      return '!claude enhance add real-time status indicators';
    } else if (input.toLowerCase().includes('test')) {
      return '!claude test';
    } else if (input.toLowerCase().includes('status')) {
      return '!claude status';
    }
    return '';
  };

  // Check if command is safe to auto-execute
  const isSafeCommand = (command: string): boolean => {
    const safeCommands = ['!claude status', '!claude analyze', '!help', '!ghost-setup'];
    return safeCommands.some(safe => command.startsWith(safe));
  };

  const setCCodeInput = (value: string) => {
    setCodeInput(value);
    setActivePanel('code');
  };

  return (
    <div className={cn(
      'flex flex-col h-full border-l',
      theme === 'ghost' 
        ? 'bg-cyber-black border-cyber-red/30' 
        : 'bg-pro-bg-panel border-pro-border',
      className
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-3 border-b',
        theme === 'ghost' 
          ? 'border-cyber-red/30 bg-gradient-to-r from-cyber-black to-gray-900' 
          : 'border-pro-border bg-pro-bg-secondary'
      )}>
        <div className="flex items-center gap-2">
          <Brain className={cn(
            'w-5 h-5',
            theme === 'ghost' ? 'text-cyber-red' : 'text-pro-primary'
          )} />
          <span className={cn(
            'font-mono font-bold text-sm',
            theme === 'ghost' ? 'text-cyber-red' : 'text-pro-text'
          )}>
            CLAUDE DUO
          </span>
          <Split className={cn(
            'w-4 h-4',
            theme === 'ghost' ? 'text-cyber-cyan' : 'text-pro-secondary'
          )} />
        </div>
        <button
          onClick={onClose}
          className={cn(
            'p-1 rounded hover:bg-opacity-20',
            theme === 'ghost' 
              ? 'text-cyber-red hover:bg-cyber-red' 
              : 'text-pro-text hover:bg-pro-primary'
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'p-3 rounded-lg text-sm font-mono',
              message.type === 'user' && theme === 'ghost' && 'bg-cyber-red/10 border border-cyber-red/30 text-cyber-cyan',
              message.type === 'user' && theme === 'suit' && 'bg-pro-primary/10 border border-pro-primary/30 text-pro-text',
              message.type === 'opus' && theme === 'ghost' && 'bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan',
              message.type === 'opus' && theme === 'suit' && 'bg-pro-secondary/10 border border-pro-secondary/30 text-pro-text',
              message.type === 'code' && theme === 'ghost' && 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green',
              message.type === 'code' && theme === 'suit' && 'bg-pro-accent/10 border border-pro-accent/30 text-pro-text',
              message.type === 'system' && theme === 'ghost' && 'bg-gray-800/50 border border-gray-600/30 text-gray-300',
              message.type === 'system' && theme === 'suit' && 'bg-gray-100/50 border border-gray-300/30 text-gray-600'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {message.type === 'opus' && <Brain className="w-4 h-4" />}
              {message.type === 'code' && <Terminal className="w-4 h-4" />}
              {message.type === 'user' && <MessageSquare className="w-4 h-4" />}
              {message.type === 'system' && <Settings className="w-4 h-4" />}
              <span className="text-xs opacity-70">
                {message.type.toUpperCase()} - {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <pre className="whitespace-pre-wrap">{message.content}</pre>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Areas */}
      <div className={cn(
        'border-t',
        theme === 'ghost' ? 'border-cyber-red/30' : 'border-pro-border'
      )}>
        {/* Tab Selector */}
        <div className="flex">
          <button
            onClick={() => setActivePanel('opus')}
            className={cn(
              'flex-1 p-2 text-xs font-mono border-r transition-colors',
              theme === 'ghost' ? 'border-cyber-red/30' : 'border-pro-border',
              activePanel === 'opus'
                ? theme === 'ghost' 
                  ? 'bg-cyber-cyan/20 text-cyber-cyan' 
                  : 'bg-pro-secondary/20 text-pro-secondary'
                : theme === 'ghost'
                  ? 'text-cyber-red hover:bg-cyber-red/10'
                  : 'text-pro-text hover:bg-pro-primary/10'
            )}
          >
            🧠 OPUS 4 (GUI)
          </button>
          <button
            onClick={() => setActivePanel('code')}
            className={cn(
              'flex-1 p-2 text-xs font-mono transition-colors',
              activePanel === 'code'
                ? theme === 'ghost' 
                  ? 'bg-cyber-green/20 text-cyber-green' 
                  : 'bg-pro-accent/20 text-pro-accent'
                : theme === 'ghost'
                  ? 'text-cyber-red hover:bg-cyber-red/10'
                  : 'text-pro-text hover:bg-pro-primary/10'
            )}
          >
            ⚡ CODE (CLI)
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={activePanel === 'opus' ? handleOpusSubmit : handleCodeSubmit} className="p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={activePanel === 'opus' ? opusInput : codeInput}
              onChange={(e) => activePanel === 'opus' ? setOpusInput(e.target.value) : setCCodeInput(e.target.value)}
              placeholder={
                activePanel === 'opus' 
                  ? 'Strategic input for Claude Opus 4...' 
                  : 'Command for Claude Code...'
              }
              className={cn(
                'flex-1 px-3 py-2 text-sm font-mono rounded border bg-transparent',
                theme === 'ghost'
                  ? 'border-cyber-red/30 text-cyber-cyan placeholder-cyber-red/50 focus:border-cyber-cyan'
                  : 'border-pro-border text-pro-text placeholder-gray-400 focus:border-pro-primary',
                'focus:outline-none focus:ring-1',
                theme === 'ghost' ? 'focus:ring-cyber-cyan' : 'focus:ring-pro-primary'
              )}
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || (activePanel === 'opus' ? !opusInput.trim() : !codeInput.trim())}
              className={cn(
                'px-3 py-2 rounded transition-colors disabled:opacity-50',
                theme === 'ghost'
                  ? 'bg-cyber-red text-black hover:bg-cyber-red/80'
                  : 'bg-pro-primary text-white hover:bg-pro-primary/80'
              )}
            >
              {isProcessing ? (
                <Zap className="w-4 h-4 animate-pulse" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaudeDuoPanel;
