/**
 * Command Parser Service
 *
 * This service handles parsing natural language commands into executable shell commands.
 * It uses the Ollama API to generate command suggestions.
 */

// Define the command parsing result interface
export interface CommandParsingResult {
  originalQuery: string;
  parsedCommand: string;
  explanation: string;
  confidence: number;
  alternatives?: string[];
}

// Define the command parsing options
export interface CommandParsingOptions {
  model?: string;
  maxAlternatives?: number;
  requireConfirmation?: boolean;
}

/**
 * Parse a natural language query into a shell command
 */
export const parseNaturalLanguageCommand = async (
  query: string,
  options: CommandParsingOptions = {}
): Promise<CommandParsingResult> => {
  const model = options.model || 'r3b3l-4f-godmode';
  const maxAlternatives = options.maxAlternatives || 3;

  try {
    // Call Ollama API to parse the command
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt: generatePrompt(query),
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to parse command: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return parseOllamaResponse(data.response, query);
  } catch (error) {
    console.error('Error parsing natural language command:', error);

    // Fallback to simple parsing
    return fallbackCommandParsing(query);
  }
};

/**
 * Generate a prompt for the Ollama model
 */
const generatePrompt = (query: string): string => {
  return `You are R3B3L 4F, a command-line AI assistant. Convert the following natural language query into a bash shell command.

Your response should be in JSON format with the following structure:
{
  "command": "the shell command",
  "explanation": "brief explanation of what the command does",
  "confidence": 0.0 to 1.0,
  "alternatives": ["alternative command 1", "alternative command 2"]
}

Natural language query: "${query}"

JSON response:`;
};

/**
 * Parse the Ollama response into a CommandParsingResult
 */
const parseOllamaResponse = (response: string, originalQuery: string): CommandParsingResult => {
  try {
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsedJson = JSON.parse(jsonMatch[0]);

    return {
      originalQuery,
      parsedCommand: parsedJson.command || '',
      explanation: parsedJson.explanation || '',
      confidence: parsedJson.confidence || 0.5,
      alternatives: parsedJson.alternatives || []
    };
  } catch (error) {
    console.error('Error parsing Ollama response:', error);

    // If we can't parse the JSON, try to extract the command directly
    const commandMatch = response.match(/\`\`\`(?:bash|sh)?\s*(.*?)\s*\`\`\`/s);
    if (commandMatch && commandMatch[1]) {
      return {
        originalQuery,
        parsedCommand: commandMatch[1].trim(),
        explanation: 'Command extracted from code block',
        confidence: 0.7
      };
    }

    return fallbackCommandParsing(originalQuery);
  }
};

/**
 * Fallback command parsing for when the Ollama API is not available
 */
const fallbackCommandParsing = (query: string): CommandParsingResult => {
  // Simple rule-based parsing
  let command = '';
  let explanation = '';
  let confidence = 0.5;

  // List files
  if (/list (?:all )?files/i.test(query)) {
    command = 'ls -la';
    explanation = 'List all files in the current directory with details';
    confidence = 0.9;
  }
  // Current directory
  else if (/current directory|where am i/i.test(query)) {
    command = 'pwd';
    explanation = 'Print working directory';
    confidence = 0.9;
  }
  // Find files
  else if (/find (?:all )?files? (?:with|containing) (.+)/i.test(query)) {
    const match = query.match(/find (?:all )?files? (?:with|containing) (.+)/i);
    const term = match ? match[1].trim() : '';
    command = `find . -type f -name "*${term}*"`;
    explanation = `Find files containing "${term}" in their name`;
    confidence = 0.8;
  }
  // Search file contents
  else if (/search (?:for )?(.+) in (?:all )?files/i.test(query)) {
    const match = query.match(/search (?:for )?(.+) in (?:all )?files/i);
    const term = match ? match[1].trim() : '';
    command = `grep -r "${term}" .`;
    explanation = `Search for "${term}" in all files recursively`;
    confidence = 0.8;
  }
  // Create directory
  else if (/create (?:a )?(?:new )?(?:directory|folder)(?: named| called)? (.+)/i.test(query)) {
    const match = query.match(/create (?:a )?(?:new )?(?:directory|folder)(?: named| called)? (.+)/i);
    const name = match ? match[1].trim() : '';
    command = `mkdir -p "${name}"`;
    explanation = `Create directory "${name}"`;
    confidence = 0.8;
  }
  // Default: just echo the query as a comment
  else {
    command = `echo "Command not understood: ${query}"`;
    explanation = 'Could not parse the natural language query';
    confidence = 0.2;
  }

  return {
    originalQuery: query,
    parsedCommand: command,
    explanation,
    confidence
  };
};
