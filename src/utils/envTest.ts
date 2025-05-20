// Simple utility to test Ollama connection

export const testEnvVariables = async () => {
  console.log('=== Ollama Connection Test ===');
  console.log('All env variables:', Object.keys(import.meta.env));

  // Check if Ollama is running
  let ollamaRunning = false;
  try {
    const response = await fetch('http://localhost:11434/api/version');
    if (response.ok) {
      const data = await response.json();
      ollamaRunning = true;
      console.log('Ollama is running. Version:', data.version);
    } else {
      console.error('Ollama API returned an error');
    }
  } catch (error) {
    console.error('Failed to connect to Ollama:', error);
  }

  console.log('=== End Ollama Connection Test ===');

  return {
    ollamaRunning,
    ollamaModel: 'r3b3l-4f-r1'
  };
};
