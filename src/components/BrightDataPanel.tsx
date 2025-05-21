import React, { useState, useEffect } from 'react';
import { Scroll, getAllScrolls } from '@/lib/scrollManager';
import { Search, Key, Database, Zap, Clock, Download, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrightDataPanelProps {
  className?: string;
  onClose?: () => void;
}

const BrightDataPanel: React.FC<BrightDataPanelProps> = ({ className, onClose }) => {
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
      ? `r3b3l-${selectedScroll.operation}-${selectedScroll.id}.json` 
      : 'r3b3l-scrolls.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('cyber-panel rounded flex flex-col h-full', className)}>
      <div className="cyber-scanline"></div>
      
      {/* Panel Header */}
      <div className="p-2 border-b border-cyber-red/30 flex items-center justify-between bg-gradient-to-r from-cyber-black to-gray-900">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer" onClick={onClose} title="Close"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer" title="Minimize"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer" title="Maximize"></div>
          </div>
          <Zap className="w-4 h-4 text-cyber-red" />
          <span className="text-sm font-mono text-cyber-red">Bright Data OPS — MCP Server</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="text-gray-400 hover:text-cyber-cyan transition-colors"
            title="Export Scrolls"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setScrolls([])}
            className="text-gray-400 hover:text-cyber-red transition-colors"
            title="Clear Scrolls"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex border-b border-cyber-red/30">
        <button 
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            filter === 'all' ? "bg-cyber-red/20 text-cyber-red" : "text-gray-400 hover:text-cyber-red"
          )}
          onClick={() => setFilter('all')}
        >
          ALL
        </button>
        <button 
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            filter === 'discover' ? "bg-blue-500/20 text-blue-500" : "text-gray-400 hover:text-blue-500"
          )}
          onClick={() => setFilter('discover')}
        >
          DISCOVER
        </button>
        <button 
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            filter === 'access' ? "bg-yellow-500/20 text-yellow-500" : "text-gray-400 hover:text-yellow-500"
          )}
          onClick={() => setFilter('access')}
        >
          ACCESS
        </button>
        <button 
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            filter === 'extract' ? "bg-green-500/20 text-green-500" : "text-gray-400 hover:text-green-500"
          )}
          onClick={() => setFilter('extract')}
        >
          EXTRACT
        </button>
        <button 
          className={cn(
            "flex-1 py-1 text-xs font-mono",
            filter === 'interact' ? "bg-purple-500/20 text-purple-500" : "text-gray-400 hover:text-purple-500"
          )}
          onClick={() => setFilter('interact')}
        >
          INTERACT
        </button>
      </div>
      
      {/* Panel Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Scrolls List */}
        <div className="w-1/3 border-r border-cyber-red/30 overflow-y-auto">
          {filteredScrolls.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm font-mono">
              No operations recorded
            </div>
          ) : (
            filteredScrolls.map(scroll => (
              <div 
                key={scroll.id}
                className={cn(
                  "p-2 border-b border-cyber-red/10 cursor-pointer hover:bg-cyber-black/50",
                  selectedScroll?.id === scroll.id ? "bg-cyber-black/70" : ""
                )}
                onClick={() => setSelectedScroll(scroll)}
              >
                <div className="flex items-center gap-2">
                  {getOperationIcon(scroll.operation)}
                  <span className="text-xs font-mono uppercase">{scroll.operation}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(scroll.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Scroll Details */}
        <div className="flex-1 overflow-y-auto p-2 bg-cyber-black/30">
          {selectedScroll ? (
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getOperationIcon(selectedScroll.operation)}
                  <h3 className="text-sm font-mono uppercase text-cyber-cyan">
                    {selectedScroll.operation} Operation
                  </h3>
                </div>
                <div className="text-xs text-gray-400">
                  ID: {selectedScroll.id}
                </div>
                <div className="text-xs text-gray-400">
                  Timestamp: {new Date(selectedScroll.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  Node: {selectedScroll.nodeId}
                </div>
              </div>
              
              <div className="border-t border-cyber-red/30 pt-2 mt-2">
                <h4 className="text-xs font-mono mb-2 text-cyber-red">DATA PAYLOAD:</h4>
                <pre className="text-xs font-mono bg-cyber-black/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedScroll.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm font-mono">
              Select an operation to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrightDataPanel;
