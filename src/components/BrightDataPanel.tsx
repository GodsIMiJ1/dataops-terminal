import React, { useState, useEffect } from 'react';
import { Scroll, getAllScrolls } from '@/lib/scrollManager';
import { Search, Key, Database, Zap, Clock, Download, Trash, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrightDataPanelProps {
  className?: string;
  onClose?: () => void;
  theme?: 'suit' | 'ghost';
}

const BrightDataPanel: React.FC<BrightDataPanelProps> = ({
  className,
  onClose,
  theme = 'suit'
}) => {
  const [scrolls, setScrolls] = useState<Scroll[]>([]);
  const [selectedScroll, setSelectedScroll] = useState<Scroll | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Load scrolls on mount
    setScrolls(getAllScrolls());

    // Set up interval to refresh scrolls
    const interval = setInterval(() => {
      setScrolls(getAllScrolls());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'discover':
        return <Search className="w-4 h-4 text-blue-500" />;
      case 'access':
        return <Key className="w-4 h-4 text-yellow-500" />;
      case 'extract':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'interact':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'collect':
        return <Download className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredScrolls = filter === 'all'
    ? scrolls
    : scrolls.filter(scroll => scroll.operation === filter);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(selectedScroll || scrolls, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedScroll
      ? `dataops-${selectedScroll.operation}-${selectedScroll.id}.json`
      : 'dataops-operations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn(
      'rounded flex flex-col h-full',
      theme === 'ghost' ? 'cyber-panel' : 'pro-panel',
      className
    )}>
      {theme === 'ghost' && <div className="cyber-scanline"></div>}

      {/* Panel Header */}
      <div className={cn(
        "p-2 flex items-center justify-between",
        theme === 'ghost'
          ? "border-b border-cyber-red/30 bg-gradient-to-r from-cyber-black to-gray-900"
          : "border-b border-pro-border bg-pro-bg-panel dark:bg-pro-bg-darkPanel"
      )}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" onClick={onClose} title="Close"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer" title="Minimize"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer" title="Maximize"></div>
          </div>
          <Zap className={cn(
            "w-4 h-4",
            theme === 'ghost' ? "text-cyber-red" : "text-pro-primary"
          )} />
          <span className={cn(
            "text-sm font-mono",
            theme === 'ghost' ? "text-cyber-red" : "text-pro-text dark:text-pro-text-dark"
          )}>
            Bright Data Operations Panel
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className={cn(
              "transition-colors",
              theme === 'ghost'
                ? "text-gray-400 hover:text-cyber-cyan"
                : "text-pro-text-muted hover:text-pro-primary dark:text-pro-text-mutedDark dark:hover:text-pro-primary-light"
            )}
            title="Export Data"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScrolls([])}
            className={cn(
              "transition-colors",
              theme === 'ghost'
                ? "text-gray-400 hover:text-cyber-red"
                : "text-pro-text-muted hover:text-red-500 dark:text-pro-text-mutedDark dark:hover:text-red-400"
            )}
            title="Clear Data"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={cn(
        "flex",
        theme === 'ghost'
          ? "border-b border-cyber-red/30"
          : "border-b border-pro-border dark:border-pro-border-dark"
      )}>
        <button
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            theme === 'ghost'
              ? filter === 'all' ? "bg-cyber-red/20 text-cyber-red" : "text-gray-400 hover:text-cyber-red"
              : filter === 'all' ? "bg-pro-primary/20 text-pro-primary" : "text-pro-text-muted hover:text-pro-primary dark:text-pro-text-mutedDark dark:hover:text-pro-primary-light"
          )}
          onClick={() => setFilter('all')}
        >
          ALL
        </button>
        <button
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            theme === 'ghost'
              ? filter === 'discover' ? "bg-blue-500/20 text-blue-500" : "text-gray-400 hover:text-blue-500"
              : filter === 'discover' ? "bg-blue-500/20 text-blue-500" : "text-pro-text-muted hover:text-blue-500 dark:text-pro-text-mutedDark dark:hover:text-blue-400"
          )}
          onClick={() => setFilter('discover')}
        >
          DISCOVER
        </button>
        <button
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            theme === 'ghost'
              ? filter === 'access' ? "bg-yellow-500/20 text-yellow-500" : "text-gray-400 hover:text-yellow-500"
              : filter === 'access' ? "bg-yellow-500/20 text-yellow-500" : "text-pro-text-muted hover:text-yellow-500 dark:text-pro-text-mutedDark dark:hover:text-yellow-400"
          )}
          onClick={() => setFilter('access')}
        >
          ACCESS
        </button>
        <button
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            theme === 'ghost'
              ? filter === 'extract' ? "bg-green-500/20 text-green-500" : "text-gray-400 hover:text-green-500"
              : filter === 'extract' ? "bg-green-500/20 text-green-500" : "text-pro-text-muted hover:text-green-500 dark:text-pro-text-mutedDark dark:hover:text-green-400"
          )}
          onClick={() => setFilter('extract')}
        >
          EXTRACT
        </button>
        <button
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            theme === 'ghost'
              ? filter === 'interact' ? "bg-purple-500/20 text-purple-500" : "text-gray-400 hover:text-purple-500"
              : filter === 'interact' ? "bg-purple-500/20 text-purple-500" : "text-pro-text-muted hover:text-purple-500 dark:text-pro-text-mutedDark dark:hover:text-purple-400"
          )}
          onClick={() => setFilter('interact')}
        >
          INTERACT
        </button>
        <button
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            theme === 'ghost'
              ? filter === 'collect' ? "bg-red-500/20 text-red-500" : "text-gray-400 hover:text-red-500"
              : filter === 'collect' ? "bg-red-500/20 text-red-500" : "text-pro-text-muted hover:text-red-500 dark:text-pro-text-mutedDark dark:hover:text-red-400"
          )}
          onClick={() => setFilter('collect')}
        >
          COLLECT
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scrolls List */}
        <div className={cn(
          "w-1/3 overflow-y-auto",
          theme === 'ghost'
            ? "border-r border-cyber-red/30"
            : "border-r border-pro-border dark:border-pro-border-dark"
        )}>
          {filteredScrolls.length === 0 ? (
            <div className={cn(
              "p-4 text-center text-sm font-mono",
              theme === 'ghost'
                ? "text-gray-500"
                : "text-pro-text-muted dark:text-pro-text-mutedDark"
            )}>
              No operations recorded
            </div>
          ) : (
            filteredScrolls.map(scroll => (
              <div
                key={scroll.id}
                className={cn(
                  "p-2 cursor-pointer",
                  theme === 'ghost'
                    ? cn(
                        "border-b border-cyber-red/10 hover:bg-cyber-black/50",
                        selectedScroll?.id === scroll.id ? "bg-cyber-black/70" : ""
                      )
                    : cn(
                        "border-b border-pro-border/10 hover:bg-gray-100 dark:hover:bg-gray-800",
                        selectedScroll?.id === scroll.id ? "bg-gray-100 dark:bg-gray-800" : ""
                      )
                )}
                onClick={() => setSelectedScroll(scroll)}
              >
                <div className="flex items-center gap-2">
                  {getOperationIcon(scroll.operation)}
                  <span className="text-xs font-mono uppercase">{scroll.operation}</span>
                </div>
                <div className={cn(
                  "text-xs mt-1",
                  theme === 'ghost'
                    ? "text-gray-400"
                    : "text-pro-text-muted dark:text-pro-text-mutedDark"
                )}>
                  {new Date(scroll.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scroll Details */}
        <div className={cn(
          "flex-1 overflow-y-auto p-2",
          theme === 'ghost'
            ? "bg-cyber-black/30"
            : "bg-gray-50 dark:bg-gray-900/30"
        )}>
          {selectedScroll ? (
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getOperationIcon(selectedScroll.operation)}
                  <h3 className={cn(
                    "text-sm font-mono uppercase",
                    theme === 'ghost'
                      ? "text-cyber-cyan"
                      : "text-pro-primary dark:text-pro-primary-light"
                  )}>
                    {selectedScroll.operation} Operation
                  </h3>
                </div>
                <div className={cn(
                  "text-xs",
                  theme === 'ghost'
                    ? "text-gray-400"
                    : "text-pro-text-muted dark:text-pro-text-mutedDark"
                )}>
                  ID: {selectedScroll.id}
                </div>
                <div className={cn(
                  "text-xs",
                  theme === 'ghost'
                    ? "text-gray-400"
                    : "text-pro-text-muted dark:text-pro-text-mutedDark"
                )}>
                  Timestamp: {new Date(selectedScroll.timestamp).toLocaleString()}
                </div>
                <div className={cn(
                  "text-xs",
                  theme === 'ghost'
                    ? "text-gray-400"
                    : "text-pro-text-muted dark:text-pro-text-mutedDark"
                )}>
                  Node: {selectedScroll.nodeId}
                </div>
              </div>

              <div className={cn(
                "pt-2 mt-2",
                theme === 'ghost'
                  ? "border-t border-cyber-red/30"
                  : "border-t border-pro-border dark:border-pro-border-dark"
              )}>
                <h4 className={cn(
                  "text-xs font-mono mb-2",
                  theme === 'ghost'
                    ? "text-cyber-red"
                    : "text-pro-secondary dark:text-pro-secondary-light"
                )}>
                  DATA PAYLOAD:
                </h4>
                <pre className={cn(
                  "text-xs font-mono p-2 rounded overflow-x-auto whitespace-pre-wrap",
                  theme === 'ghost'
                    ? "bg-cyber-black/50"
                    : "bg-white dark:bg-gray-800 border border-pro-border dark:border-pro-border-dark"
                )}>
                  {JSON.stringify(selectedScroll.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className={cn(
              "flex items-center justify-center h-full text-sm font-mono",
              theme === 'ghost'
                ? "text-gray-500"
                : "text-pro-text-muted dark:text-pro-text-mutedDark"
            )}>
              Select an operation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrightDataPanel;
