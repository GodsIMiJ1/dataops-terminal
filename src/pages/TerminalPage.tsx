import React, { useEffect, useState } from 'react';
import { Terminal, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import CommandTerminal from '@/components/terminal/CommandTerminal';
import { cn } from '@/lib/utils';

const TerminalPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<'suit' | 'ghost'>(() => {
    const savedTheme = localStorage.getItem('dataops-terminal-theme');
    return (savedTheme === 'ghost') ? 'ghost' : 'suit';
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    // Listen for theme changes
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('dataops-terminal-theme');
      setTheme(currentTheme === 'ghost' ? 'ghost' : 'suit');
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle('theme-ghost', theme === 'ghost');
    document.body.classList.toggle('theme-suit', theme === 'suit');
  }, [theme]);

  if (!isLoaded) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col items-center justify-center",
        theme === 'ghost' ? "bg-cyber-black" : "bg-pro-bg"
      )}>
        <div className={cn(
          "rounded-lg p-6 max-w-md w-full",
          theme === 'ghost' 
            ? "cyber-panel" 
            : "bg-white dark:bg-pro-bg-dark shadow-lg border border-pro-border"
        )}>
          {theme === 'ghost' && <div className="cyber-scanline"></div>}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal className={cn(
                "w-8 h-8",
                theme === 'ghost' ? "text-cyber-red" : "text-pro-primary"
              )} />
              <h1 className={cn(
                "text-2xl font-bold",
                theme === 'ghost' ? "text-cyber-red" : "text-pro-text dark:text-pro-text-dark"
              )}>
                DataOps Terminal
              </h1>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className={cn(
                "h-full animate-pulse",
                theme === 'ghost' ? "bg-cyber-red" : "bg-pro-primary"
              )} style={{ width: '75%' }} />
            </div>
            <div className={cn(
              "text-sm font-mono animate-pulse",
              theme === 'ghost' ? "text-cyber-cyan" : "text-pro-secondary"
            )}>
              Initializing terminal...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen relative overflow-auto",
      theme === 'ghost' 
        ? "bg-cyber-black text-white" 
        : "bg-pro-bg text-pro-text dark:bg-pro-bg-dark dark:text-pro-text-dark"
    )}>
      {/* Background elements - only shown in ghost theme */}
      {theme === 'ghost' && (
        <>
          {/* Digital rain background would go here */}
          <div className="digital-noise"></div>
        </>
      )}

      {/* Main content */}
      <div className="container mx-auto py-2 min-h-screen flex flex-col max-w-[95%] lg:max-w-[90%]">
        {/* Header */}
        <header className={cn(
          "flex items-center justify-between mb-2 px-2",
          theme === 'ghost' ? "" : "border-b border-pro-border pb-2"
        )}>
          <div className="flex items-center gap-2">
            <Terminal className={cn(
              "w-5 h-5",
              theme === 'ghost' ? "text-cyber-red" : "text-pro-primary"
            )} />
            <h1 className={cn(
              "text-xl font-bold",
              theme === 'ghost' ? "text-cyber-red" : "text-pro-text dark:text-pro-text-dark"
            )}>
              DataOps Terminal
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className={cn(
                "flex items-center gap-1 px-3 py-1 text-sm font-mono transition-colors rounded",
                theme === 'ghost'
                  ? "bg-cyber-black border border-cyber-red text-cyber-red hover:bg-cyber-red/20"
                  : "bg-white dark:bg-pro-bg-darkPanel border border-pro-primary text-pro-primary hover:bg-pro-primary/10 dark:bg-pro-bg-darkPanel"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              {isMobile ? "HOME" : "RETURN HOME"}
            </a>
          </div>
        </header>

        {/* Main terminal layout */}
        <div className="flex-1 flex flex-col">
          <CommandTerminal className="flex-1" />
        </div>

        {/* Footer */}
        <footer className="mt-1 flex justify-center">
          <div className={cn(
            "text-xs font-mono",
            theme === 'ghost' ? "text-gray-500" : "text-pro-text-muted dark:text-pro-text-mutedDark"
          )}>
            DataOps Terminal — Advanced Web Data Operations Platform
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TerminalPage;
