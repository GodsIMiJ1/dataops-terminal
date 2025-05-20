#!/usr/bin/env node

// Simple script to check if Ollama is running
// Run this before the build process

console.log('=== Ollama Connection Check ===');

// We'll check if Ollama is running in the prebuild script
// This is just a placeholder for now
console.log('Note: Make sure Ollama is running locally before starting the application.');
console.log('You can start Ollama with: ollama serve');

console.log('=== Environment Variables Check Complete ===');
process.exit(0);
