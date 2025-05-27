/**
 * Claude API Service for DataOps Terminal
 * Integrates with Anthropic's Claude API for both Opus and Haiku models
 */

export interface ClaudeResponse {
  response: string;
  command?: string;
  model: 'opus' | 'haiku';
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeAPIConfig {
  apiKey: string;
  model: 'opus' | 'haiku';
  maxTokens?: number;
}

class ClaudeAPIService {
  private readonly baseURL = 'https://api.anthropic.com/v1/messages';
  private readonly version = '2023-06-01';

  // Model mappings
  private getModelName(model: 'opus' | 'haiku'): string {
    return model === 'opus' 
      ? 'claude-3-opus-20240229' 
      : 'claude-3-haiku-20240307';
  }

  // System prompt for DataOps Terminal context
  private getSystemPrompt(): string {
    return `You are a DataOps Terminal AI assistant with dual-AI coordination capabilities. Your role:

🎯 CORE FUNCTIONS:
1. Understand natural language requests
2. Translate them into appropriate CLI commands when possible
3. Provide strategic guidance for data operations
4. Coordinate with Claude Code execution terminal

🔧 AVAILABLE COMMANDS:
- !dataops discover --query "search terms" → Search for data across web
- !dataops extract --url "https://example.com" --schema "title,content" → Extract structured data
- !dataops access --url "https://example.com" → Navigate complex/protected sites
- !dataops interact --url "https://example.com" --actions "click:.button" → Interact with dynamic pages
- !ghost <natural language> → Autonomous GHOSTCLI operations
- !claude <analyze|fix|enhance|test> → Claude Code development tasks
- !help → Show all available commands
- !mode ghost/rebel → Switch between professional/cyberpunk themes
- !dual-status → System status check

🧠 RESPONSE STYLE:
- Be concise but strategic
- When you can translate a request to a command, include it
- Use appropriate emojis for visual clarity
- Maintain the DataOps Terminal's professional yet cutting-edge tone

🚀 COMMAND EXTRACTION:
If you generate a CLI command, wrap it in backticks like: \`!dataops discover --query "AI research"\``;
  }

  // Call Claude API
  async callClaude(input: string, config: ClaudeAPIConfig): Promise<ClaudeResponse> {
    const modelName = this.getModelName(config.model);
    const maxTokens = config.maxTokens || (config.model === 'opus' ? 2000 : 1000);

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': this.version
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: maxTokens,
          system: this.getSystemPrompt(),
          messages: [
            {
              role: 'user',
              content: input
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiResponse = data.content[0].text;

      // Extract command if present (look for commands in backticks)
      const commandMatch = aiResponse.match(/`(![^`]+)`/);
      const command = commandMatch ? commandMatch[1] : undefined;

      return {
        response: aiResponse,
        command,
        model: config.model,
        usage: data.usage
      };
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw error;
    }
  }

  // Simulate Claude response for fallback
  simulateResponse(input: string, model: 'opus' | 'haiku'): ClaudeResponse {
    const lowerInput = input.toLowerCase();
    const modelEmoji = model === 'opus' ? '🧠' : '⚡';
    const modelName = model === 'opus' ? 'Claude Opus 4' : 'Claude Haiku 3.5';

    // Pattern matching for common requests
    if (lowerInput.includes('search') || lowerInput.includes('find')) {
      const searchTerms = input.replace(/search|find|for/gi, '').trim();
      return {
        response: `${modelEmoji} ${modelName}: I'll search for "${searchTerms}" using Bright Data's discovery capabilities.`,
        command: `!dataops discover --query "${searchTerms}"`,
        model
      };
    }

    if (lowerInput.includes('extract') && lowerInput.includes('data')) {
      const urlMatch = input.match(/https?:\/\/[^\s]+/);
      const url = urlMatch ? urlMatch[0] : 'https://example.com';
      return {
        response: `${modelEmoji} ${modelName}: I'll extract structured data from the specified website.`,
        command: `!dataops extract --url "${url}" --schema "title,content,links"`,
        model
      };
    }

    if (lowerInput.includes('help') || lowerInput.includes('commands')) {
      return {
        response: `${modelEmoji} ${modelName}: I'll show you all available commands in the terminal.`,
        command: `!help`,
        model
      };
    }

    if (lowerInput.includes('status') || lowerInput.includes('system')) {
      return {
        response: `${modelEmoji} ${modelName}: Let me check the current system status for you.`,
        command: `!dual-status`,
        model
      };
    }

    if (lowerInput.includes('theme') || lowerInput.includes('mode')) {
      const mode = lowerInput.includes('ghost') ? 'ghost' : 'rebel';
      return {
        response: `${modelEmoji} ${modelName}: I'll switch the interface to ${mode} mode.`,
        command: `!mode ${mode}`,
        model
      };
    }

    // Default response with model-specific personality
    const personality = model === 'opus' 
      ? 'Let me analyze this strategically and provide the best approach.'
      : 'Quick analysis - here\'s what I recommend:';

    return {
      response: `${modelEmoji} ${modelName}: I understand you want to: "${input}"\n\n${personality} You can also type specific commands in the CLI panel or ask me to help translate your request into terminal commands.`,
      model
    };
  }

  // Check if API key is available
  isAPIKeyAvailable(): boolean {
    return !!(process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || 
             localStorage.getItem('anthropic_api_key'));
  }

  // Get API key from environment or localStorage
  getAPIKey(): string | null {
    return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || 
           localStorage.getItem('anthropic_api_key') || 
           null;
  }

  // Set API key in localStorage
  setAPIKey(apiKey: string): void {
    localStorage.setItem('anthropic_api_key', apiKey);
  }

  // Remove API key
  removeAPIKey(): void {
    localStorage.removeItem('anthropic_api_key');
  }
}

export const claudeAPIService = new ClaudeAPIService();
export default claudeAPIService;
