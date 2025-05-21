/**
 * KeyboardShortcutService.ts
 * 
 * A service for managing keyboard shortcuts in the application.
 */

// Shortcut action type
export type ShortcutAction = () => void;

// Shortcut definition
export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: ShortcutAction;
  scope?: string;
}

class KeyboardShortcutService {
  private shortcuts: Shortcut[] = [];
  private enabled: boolean = true;
  private currentScope: string = 'global';
  
  /**
   * Initialize keyboard shortcuts
   */
  initialize(): void {
    // Set up event listener
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Register default shortcuts
    this.registerDefaultShortcuts();
  }
  
  /**
   * Register default keyboard shortcuts
   */
  private registerDefaultShortcuts(): void {
    // Terminal shortcuts
    this.registerShortcut({
      key: 'l',
      ctrlKey: true,
      description: 'Clear terminal',
      action: () => this.executeCommand('!clear'),
      scope: 'terminal'
    });
    
    this.registerShortcut({
      key: 'k',
      ctrlKey: true,
      description: 'Clear terminal (alternative)',
      action: () => this.executeCommand('!clear'),
      scope: 'terminal'
    });
    
    this.registerShortcut({
      key: 'ArrowUp',
      description: 'Previous command',
      action: () => this.navigateCommandHistory('up'),
      scope: 'terminal'
    });
    
    this.registerShortcut({
      key: 'ArrowDown',
      description: 'Next command',
      action: () => this.navigateCommandHistory('down'),
      scope: 'terminal'
    });
    
    this.registerShortcut({
      key: 'h',
      ctrlKey: true,
      description: 'Show help',
      action: () => this.executeCommand('!help'),
      scope: 'terminal'
    });
    
    this.registerShortcut({
      key: 's',
      ctrlKey: true,
      description: 'Show status',
      action: () => this.executeCommand('!status'),
      scope: 'terminal'
    });
    
    this.registerShortcut({
      key: 'i',
      ctrlKey: true,
      altKey: true,
      description: 'Toggle internet access',
      action: () => this.toggleInternet(),
      scope: 'terminal'
    });
    
    this.registerShortcut({
      key: 'a',
      ctrlKey: true,
      altKey: true,
      description: 'Toggle airlock',
      action: () => this.toggleAirlock(),
      scope: 'terminal'
    });
    
    // Global shortcuts
    this.registerShortcut({
      key: '/',
      description: 'Focus search',
      action: () => this.focusSearch(),
      scope: 'global'
    });
    
    this.registerShortcut({
      key: 'Escape',
      description: 'Close modal or cancel operation',
      action: () => this.handleEscape(),
      scope: 'global'
    });
    
    this.registerShortcut({
      key: 'F1',
      description: 'Show keyboard shortcuts',
      action: () => this.showShortcutsHelp(),
      scope: 'global'
    });
  }
  
  /**
   * Register a keyboard shortcut
   * @param shortcut The shortcut to register
   */
  registerShortcut(shortcut: Shortcut): void {
    // Set default scope if not provided
    if (!shortcut.scope) {
      shortcut.scope = 'global';
    }
    
    // Add to shortcuts array
    this.shortcuts.push(shortcut);
  }
  
  /**
   * Unregister a keyboard shortcut
   * @param key The key of the shortcut to unregister
   * @param modifiers Optional modifier keys
   */
  unregisterShortcut(
    key: string,
    modifiers: { ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean, metaKey?: boolean } = {}
  ): void {
    this.shortcuts = this.shortcuts.filter(shortcut => 
      !(shortcut.key === key &&
        shortcut.ctrlKey === (modifiers.ctrlKey || false) &&
        shortcut.altKey === (modifiers.altKey || false) &&
        shortcut.shiftKey === (modifiers.shiftKey || false) &&
        shortcut.metaKey === (modifiers.metaKey || false))
    );
  }
  
  /**
   * Handle keydown events
   * @param event The keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Skip if shortcuts are disabled
    if (!this.enabled) {
      return;
    }
    
    // Skip if target is an input or textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).isContentEditable
    ) {
      // Allow global shortcuts even in input fields
      const matchingGlobalShortcut = this.findMatchingShortcut(event, 'global');
      if (matchingGlobalShortcut) {
        event.preventDefault();
        matchingGlobalShortcut.action();
      }
      return;
    }
    
    // Check for matching shortcut in current scope
    const matchingShortcut = this.findMatchingShortcut(event, this.currentScope) || 
                             this.findMatchingShortcut(event, 'global');
    
    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }
  
  /**
   * Find a matching shortcut for the given event and scope
   * @param event The keyboard event
   * @param scope The scope to check
   * @returns The matching shortcut or undefined
   */
  private findMatchingShortcut(event: KeyboardEvent, scope: string): Shortcut | undefined {
    return this.shortcuts.find(shortcut => 
      shortcut.key === event.key &&
      shortcut.ctrlKey === event.ctrlKey &&
      shortcut.altKey === event.altKey &&
      shortcut.shiftKey === event.shiftKey &&
      shortcut.metaKey === event.metaKey &&
      shortcut.scope === scope
    );
  }
  
  /**
   * Set the current scope for shortcuts
   * @param scope The new scope
   */
  setScope(scope: string): void {
    this.currentScope = scope;
  }
  
  /**
   * Enable or disable keyboard shortcuts
   * @param enabled True to enable, false to disable
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Get all registered shortcuts
   * @returns Array of shortcuts
   */
  getShortcuts(): Shortcut[] {
    return [...this.shortcuts];
  }
  
  /**
   * Get shortcuts for a specific scope
   * @param scope The scope to get shortcuts for
   * @returns Array of shortcuts for the scope
   */
  getShortcutsForScope(scope: string): Shortcut[] {
    return this.shortcuts.filter(shortcut => shortcut.scope === scope);
  }
  
  /**
   * Execute a terminal command
   * @param command The command to execute
   */
  private executeCommand(command: string): void {
    // Find terminal input
    const terminalInput = document.querySelector('.terminal-input') as HTMLInputElement;
    if (terminalInput) {
      terminalInput.value = command;
      terminalInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
  }
  
  /**
   * Navigate command history
   * @param direction 'up' for previous, 'down' for next
   */
  private navigateCommandHistory(direction: 'up' | 'down'): void {
    // This would be implemented in the terminal component
    console.log(`Navigate command history: ${direction}`);
  }
  
  /**
   * Toggle internet access
   */
  private toggleInternet(): void {
    // Get current internet status
    const statusElement = document.querySelector('.internet-status');
    const isEnabled = statusElement?.classList.contains('enabled');
    
    // Toggle internet
    this.executeCommand(isEnabled ? '!internet off' : '!internet on');
  }
  
  /**
   * Toggle airlock
   */
  private toggleAirlock(): void {
    // Get current airlock status
    const statusElement = document.querySelector('.airlock-status');
    const isEnabled = statusElement?.classList.contains('enabled');
    
    // Toggle airlock
    this.executeCommand(isEnabled ? '!airlock off' : '!airlock on');
  }
  
  /**
   * Focus search input
   */
  private focusSearch(): void {
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }
  
  /**
   * Handle escape key
   */
  private handleEscape(): void {
    // Close any open modal
    const modal = document.querySelector('.modal.open');
    if (modal) {
      const closeButton = modal.querySelector('.close-button') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }
  
  /**
   * Show keyboard shortcuts help
   */
  private showShortcutsHelp(): void {
    // Create and show shortcuts modal
    const modal = document.createElement('div');
    modal.className = 'modal shortcuts-modal open';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.onclick = () => modal.remove();
    
    const title = document.createElement('h2');
    title.textContent = 'Keyboard Shortcuts';
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    
    // Group shortcuts by scope
    const scopes = [...new Set(this.shortcuts.map(s => s.scope))];
    
    scopes.forEach(scope => {
      const scopeShortcuts = this.getShortcutsForScope(scope!);
      
      const scopeTitle = document.createElement('h3');
      scopeTitle.textContent = scope === 'global' ? 'Global Shortcuts' : `${scope} Shortcuts`;
      modalContent.appendChild(scopeTitle);
      
      const shortcutsList = document.createElement('ul');
      shortcutsList.className = 'shortcuts-list';
      
      scopeShortcuts.forEach(shortcut => {
        const shortcutItem = document.createElement('li');
        
        const keyCombo = document.createElement('span');
        keyCombo.className = 'key-combo';
        
        let keyText = '';
        if (shortcut.ctrlKey) keyText += 'Ctrl + ';
        if (shortcut.altKey) keyText += 'Alt + ';
        if (shortcut.shiftKey) keyText += 'Shift + ';
        if (shortcut.metaKey) keyText += 'Meta + ';
        keyText += shortcut.key;
        
        keyCombo.textContent = keyText;
        
        const description = document.createElement('span');
        description.className = 'shortcut-description';
        description.textContent = shortcut.description;
        
        shortcutItem.appendChild(keyCombo);
        shortcutItem.appendChild(description);
        shortcutsList.appendChild(shortcutItem);
      });
      
      modalContent.appendChild(shortcutsList);
    });
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
  }
}

// Export a singleton instance
export const keyboardShortcutService = new KeyboardShortcutService();
export default keyboardShortcutService;
