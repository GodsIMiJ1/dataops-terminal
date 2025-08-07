/**
 * Ethical Hacking Service for Local AI Terminal
 * Integrates with Ollama for penetration testing assistance
 */

import ollamaService from './OllamaService';

export interface HackingTask {
  type: 'recon' | 'exploit' | 'analysis' | 'coding' | 'general';
  target?: string;
  description: string;
  model?: string;
}

export interface HackingResponse {
  success: boolean;
  response: string;
  model: string;
  task: HackingTask;
  warnings?: string[];
}

class EthicalHackingService {
  
  // System prompts for different hacking scenarios
  private getSystemPrompt(task: HackingTask): string {
    const baseEthics = `You are an ethical hacking assistant. ONLY provide guidance for:
- Authorized penetration testing
- Security research on owned systems
- Educational purposes
- Bug bounty programs with proper authorization

NEVER assist with:
- Unauthorized access to systems
- Illegal activities
- Malicious attacks
- Privacy violations

Always remind users to obtain proper authorization before testing.`;

    const taskPrompts = {
      recon: `${baseEthics}

You specialize in reconnaissance and information gathering for authorized security testing:
- Network scanning and enumeration
- OSINT (Open Source Intelligence)
- Subdomain discovery
- Port scanning analysis
- Service fingerprinting
- DNS enumeration

Provide step-by-step guidance with appropriate tools and techniques.`,

      exploit: `${baseEthics}

You specialize in vulnerability assessment and exploitation for authorized testing:
- Common vulnerability analysis (OWASP Top 10)
- Exploit development guidance
- Payload crafting
- Privilege escalation techniques
- Post-exploitation strategies

CRITICAL: Always emphasize proper authorization and responsible disclosure.`,

      analysis: `${baseEthics}

You specialize in security analysis and code review:
- Static code analysis
- Dynamic analysis techniques
- Log analysis
- Incident response
- Forensics guidance
- Vulnerability assessment

Focus on defensive security and threat hunting.`,

      coding: `${baseEthics}

You specialize in security tool development and automation:
- Python/Bash scripting for security tools
- Custom exploit development
- Automation scripts
- Security testing frameworks
- API security testing

Provide clean, well-commented code with security best practices.`,

      general: `${baseEthics}

You are a general ethical hacking assistant covering all aspects of cybersecurity:
- Security fundamentals
- Best practices
- Tool recommendations
- Learning resources
- Career guidance

Maintain focus on ethical, legal, and authorized activities.`
    };

    return taskPrompts[task.type];
  }

  // Process ethical hacking request
  async processRequest(task: HackingTask): Promise<HackingResponse> {
    try {
      // Check if Ollama is running
      const status = await ollamaService.getStatus();
      if (!status.isRunning) {
        return {
          success: false,
          response: '❌ Ollama service not running. Start with: ollama serve',
          model: 'none',
          task
        };
      }

      // Get recommended model or use specified one
      const model = task.model || ollamaService.getRecommendedModel(task.type);
      if (!model) {
        return {
          success: false,
          response: '❌ No suitable models available. Install models with: ollama pull llama3.1',
          model: 'none',
          task
        };
      }

      // Generate system prompt
      const systemPrompt = this.getSystemPrompt(task);

      // Create user prompt
      let userPrompt = task.description;
      if (task.target) {
        userPrompt += `\n\nTarget: ${task.target}`;
      }

      // Generate response
      const response = await ollamaService.generate(model, userPrompt, systemPrompt);

      // Add ethical warnings for sensitive tasks
      const warnings = this.getEthicalWarnings(task);

      return {
        success: true,
        response,
        model,
        task,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        response: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        model: 'error',
        task
      };
    }
  }

  // Get ethical warnings based on task type
  private getEthicalWarnings(task: HackingTask): string[] {
    const warnings: string[] = [];

    if (task.type === 'exploit') {
      warnings.push('⚠️ AUTHORIZATION REQUIRED: Only test on systems you own or have explicit permission to test');
      warnings.push('⚠️ RESPONSIBLE DISCLOSURE: Report vulnerabilities through proper channels');
    }

    if (task.type === 'recon' && task.target) {
      warnings.push('⚠️ LEGAL COMPLIANCE: Ensure reconnaissance activities comply with local laws');
      warnings.push('⚠️ SCOPE LIMITATION: Stay within authorized testing scope');
    }

    if (task.type === 'coding') {
      warnings.push('⚠️ ETHICAL USE: Use security tools only for authorized testing and defense');
    }

    return warnings;
  }

  // Quick commands for common hacking tasks
  async quickRecon(target: string, model?: string): Promise<HackingResponse> {
    return this.processRequest({
      type: 'recon',
      target,
      description: `Perform initial reconnaissance on ${target}. Provide a systematic approach including subdomain enumeration, port scanning, and service identification.`,
      model
    });
  }

  async quickExploit(vulnerability: string, model?: string): Promise<HackingResponse> {
    return this.processRequest({
      type: 'exploit',
      description: `Analyze the ${vulnerability} vulnerability. Provide exploitation techniques, payloads, and mitigation strategies.`,
      model
    });
  }

  async quickAnalysis(target: string, model?: string): Promise<HackingResponse> {
    return this.processRequest({
      type: 'analysis',
      target,
      description: `Perform security analysis on ${target}. Include vulnerability assessment and security recommendations.`,
      model
    });
  }

  async quickCode(requirement: string, model?: string): Promise<HackingResponse> {
    return this.processRequest({
      type: 'coding',
      description: `Create a security tool or script for: ${requirement}. Include proper error handling and security best practices.`,
      model
    });
  }

  // Get available models for hacking tasks
  async getAvailableModels(): Promise<{model: string, recommended: string[]}[]> {
    const models = await ollamaService.getModels();
    
    return models.map(model => ({
      model: model.name,
      recommended: this.getRecommendedTasks(model.name)
    }));
  }

  // Get recommended tasks for a model
  private getRecommendedTasks(modelName: string): string[] {
    if (modelName.includes('r3b3l-4f-godmode')) {
      return ['recon', 'exploit', 'general'];
    }
    if (modelName.includes('deepseek-coder')) {
      return ['coding', 'analysis'];
    }
    if (modelName.includes('bianca')) {
      return ['exploit', 'analysis'];
    }
    if (modelName.includes('llama3.1')) {
      return ['general', 'recon', 'analysis'];
    }
    return ['general'];
  }
}

export const ethicalHackingService = new EthicalHackingService();
export default ethicalHackingService;
