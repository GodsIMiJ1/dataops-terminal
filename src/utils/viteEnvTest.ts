// This file is used to test Ollama connection

// Log all environment variables available to Vite
console.log('=== Vite Environment Variables ===');
console.log('All env variables:', Object.keys(import.meta.env));

// Export a function that can be called to test Ollama connection
export const testViteEnv = async () => {
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

  return {
    ollamaRunning,
    ollamaModel: 'r3b3l-4f-r1',
    allEnvVars: Object.keys(import.meta.env)
  };
};

// Auto-run the test when this file is imported
testViteEnv();
