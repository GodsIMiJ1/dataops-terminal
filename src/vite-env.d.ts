/// <reference types="vite/client" />

interface ImportMetaEnv {
  // No environment variables needed for Ollama
  // Add any other environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
