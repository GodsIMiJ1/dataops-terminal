/**
 * Scroll Logger Service
 *
 * This service handles logging commands, responses, and AI interactions
 * in both Markdown and JSON formats.
 */

export interface ScrollEntry {
  id: string;
  timestamp: Date;
  type: 'command' | 'response' | 'ai_prompt' | 'ai_response' | 'system' | 'error';
  content: string;
  metadata?: Record<string, any>;
}

export interface ScrollSession {
  id: string;
  name: string;
  timestamp: Date;
  entries: ScrollEntry[];
  metadata?: Record<string, any>;
}

// In-memory storage for scroll sessions
let sessions: ScrollSession[] = [];
let currentSession: ScrollSession | null = null;

/**
 * Initialize a new scroll session
 */
export const initScrollSession = (name: string = 'Unnamed Session'): ScrollSession => {
  const sessionId = `Scroll_${new Date().toISOString().slice(0, 10)}_${sessions.length.toString().padStart(3, '0')}`;

  const newSession: ScrollSession = {
    id: sessionId,
    name,
    timestamp: new Date(),
    entries: [],
    metadata: {
      agentVersion: 'DataOps-Terminal-v1.0',
      platform: navigator.platform,
      userAgent: navigator.userAgent
    }
  };

  sessions.push(newSession);
  currentSession = newSession;

  // Log system entry for session start
  logEntry('system', `Session ${sessionId} started at ${new Date().toLocaleString()}`);

  return newSession;
};

/**
 * Get the current scroll session or create one if none exists
 */
export const getCurrentSession = (): ScrollSession => {
  if (!currentSession) {
    return initScrollSession();
  }
  return currentSession;
};

/**
 * Log an entry to the current session
 */
export const logEntry = (
  type: ScrollEntry['type'],
  content: string,
  metadata?: Record<string, any>
): ScrollEntry => {
  const session = getCurrentSession();

  const entry: ScrollEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date(),
    type,
    content,
    metadata
  };

  session.entries.push(entry);

  // Persist to localStorage if available
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`dataops_terminal_session_${session.id}`, JSON.stringify(session));
    }
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }

  return entry;
};

/**
 * Export the current session as Markdown
 */
export const exportSessionAsMarkdown = (): string => {
  const session = getCurrentSession();

  let markdown = `# DataOps Terminal Session: ${session.name}\n\n`;
  markdown += `Session ID: ${session.id}\n`;
  markdown += `Date: ${session.timestamp.toLocaleString()}\n\n`;

  markdown += `## Entries\n\n`;

  session.entries.forEach(entry => {
    const timestamp = entry.timestamp.toLocaleTimeString();

    switch (entry.type) {
      case 'command':
        markdown += `### Command (${timestamp})\n\`\`\`bash\n${entry.content}\n\`\`\`\n\n`;
        break;
      case 'response':
        markdown += `### Response\n\`\`\`\n${entry.content}\n\`\`\`\n\n`;
        break;
      case 'ai_prompt':
        markdown += `### AI Prompt (${timestamp})\n${entry.content}\n\n`;
        break;
      case 'ai_response':
        markdown += `### AI Response\n${entry.content}\n\n`;
        break;
      case 'system':
        markdown += `> **System**: ${entry.content}\n\n`;
        break;
      case 'error':
        markdown += `> **Error**: ${entry.content}\n\n`;
        break;
    }
  });

  return markdown;
};

/**
 * Export the current session as JSON
 */
export const exportSessionAsJSON = (): string => {
  const session = getCurrentSession();
  return JSON.stringify(session, null, 2);
};

/**
 * Save the current session to a file
 */
export const saveSessionToFile = (format: 'markdown' | 'json' = 'markdown'): void => {
  const session = getCurrentSession();
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'markdown') {
    content = exportSessionAsMarkdown();
    filename = `dataops_terminal_session_${session.id}_${timestamp}.md`;
    mimeType = 'text/markdown';
  } else {
    content = exportSessionAsJSON();
    filename = `dataops_terminal_session_${session.id}_${timestamp}.json`;
    mimeType = 'application/json';
  }

  // Create a blob and download it
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};
