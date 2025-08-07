/**
 * Ollama Local AI Service for Ethical Hacking Terminal
 * Auto-detects Ollama service and available models
 */

export interface OllamaModel {
  name: string;
  size: string;
  modified: string;
  digest: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaServiceStatus {
  isRunning: boolean;
  version?: string;
  models: OllamaModel[];
  error?: string;
}

class OllamaService {
  private readonly baseURL = 'http://localhost:11434';
  private models: OllamaModel[] = [];
  private isServiceRunning = false;
  private lastCheck = 0;
  private checkInterval = 30000; // 30 seconds

  // Check if Ollama service is running
  async checkService(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/version`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        this.isServiceRunning = true;
        return true;
      }
    } catch (error) {
      console.log('Ollama service not detected:', error);
    }
    
    this.isServiceRunning = false;
    return false;
  }

  // Get list of available models
  async getModels(): Promise<OllamaModel[]> {
    if (!this.isServiceRunning) {
      await this.checkService();
    }

    if (!this.isServiceRunning) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        this.models = data.models || [];
        return this.models;
      }
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
    }

    return [];
  }

  // Get service status with models
  async getStatus(): Promise<OllamaServiceStatus> {
    const isRunning = await this.checkService();
    
    if (!isRunning) {
      return {
        isRunning: false,
        models: [],
        error: 'Ollama service not running. Start with: ollama serve'
      };
    }

    const models = await this.getModels();
    
    try {
      const versionResponse = await fetch(`${this.baseURL}/api/version`);
      const versionData = await versionResponse.json();
      
      return {
        isRunning: true,
        version: versionData.version,
        models
      };
    } catch (error) {
      return {
        isRunning: true,
        models,
        error: 'Could not fetch version info'
      };
    }
  }

  // Generate response from Ollama model
  async generate(model: string, prompt: string, system?: string): Promise<string> {
    if (!this.isServiceRunning) {
      throw new Error('Ollama service not running');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          system,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generation failed:', error);
      throw error;
    }
  }

  // Chat with Ollama model (for conversation context)
  async chat(model: string, messages: Array<{role: string, content: string}>): Promise<string> {
    if (!this.isServiceRunning) {
      throw new Error('Ollama service not running');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Ollama chat failed:', error);
      throw error;
    }
  }

  // Get recommended model for ethical hacking tasks
  getRecommendedModel(task: 'recon' | 'exploit' | 'analysis' | 'coding' | 'general'): string | null {
    if (this.models.length === 0) return null;

    // Priority mapping for different tasks
    const taskModels = {
      recon: ['r3b3l-4f-godmode', 'llama3.1:latest', 'deepseek-coder:6.7b'],
      exploit: ['r3b3l-4f-godmode', 'bianca', 'llama3.1:latest'],
      analysis: ['deepseek-coder:6.7b', 'llama3.1:latest', 'r3b3l-4f-godmode'],
      coding: ['deepseek-coder:6.7b', 'r3b3l-4f-godmode', 'llama3.1:latest'],
      general: ['llama3.1:latest', 'r3b3l-4f-godmode', 'bianca']
    };

    const preferences = taskModels[task];
    
    for (const preferred of preferences) {
      const found = this.models.find(m => m.name.includes(preferred));
      if (found) return found.name;
    }

    // Fallback to first available model
    return this.models[0]?.name || null;
  }

  // Auto-refresh models periodically
  async startAutoRefresh(): Promise<void> {
    setInterval(async () => {
      if (Date.now() - this.lastCheck > this.checkInterval) {
        await this.getStatus();
        this.lastCheck = Date.now();
      }
    }, this.checkInterval);
  }

  // Get current models (cached)
  getCachedModels(): OllamaModel[] {
    return this.models;
  }

  // Check if specific model is available
  hasModel(modelName: string): boolean {
    return this.models.some(m => m.name.includes(modelName));
  }

  // Get service URL
  getServiceURL(): string {
    return this.baseURL;
  }
}

export const ollamaService = new OllamaService();
export default ollamaService;
