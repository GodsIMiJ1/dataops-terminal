#!/bin/bash

# DataOps Terminal - Claude Code Integration Installation Script
# Royal Enhancement for the GodsIMiJ Empire

echo "🔥 INSTALLING CLAUDE CODE INTEGRATION FOR DATAOPS TERMINAL 🔥"
echo "================================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✅ Node.js and npm are available"
echo ""

# Install Claude Code globally
echo "📦 Installing Claude Code globally..."
npm install -g @anthropic-ai/claude-code

if [ $? -eq 0 ]; then
    echo "✅ Claude Code installed successfully"
else
    echo "❌ Failed to install Claude Code"
    echo "You may need to run with sudo: sudo npm install -g @anthropic-ai/claude-code"
    exit 1
fi

echo ""

# Check if Claude Code is available
if command -v claude &> /dev/null; then
    echo "✅ Claude Code CLI is available"
    claude --version
else
    echo "❌ Claude Code CLI not found in PATH"
    echo "You may need to restart your terminal or add npm global bin to PATH"
    exit 1
fi

echo ""

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY environment variable not set"
    echo ""
    echo "To complete the setup:"
    echo "1. Get your API key from https://console.anthropic.com/"
    echo "2. Add to your shell profile (.bashrc, .zshrc, etc.):"
    echo "   export ANTHROPIC_API_KEY=your-api-key-here"
    echo "3. Restart your terminal or run: source ~/.bashrc"
    echo ""
else
    echo "✅ ANTHROPIC_API_KEY is set"
fi

# Authenticate Claude Code
echo "🔐 Authenticating Claude Code..."
echo "Please follow the authentication prompts..."
claude login

if [ $? -eq 0 ]; then
    echo "✅ Claude Code authentication successful"
else
    echo "⚠️  Authentication may have failed. You can retry with: claude login"
fi

echo ""

# Create project memory file
echo "📝 Creating project memory file..."
cat > ./CLAUDE.md << 'EOF'
# DataOps Terminal - Claude Code Memory

## Project Overview
DataOps Terminal is an autonomous web data operations platform featuring:
- GHOSTCLI: Natural language command processing with GPT-4o-mini + Ollama
- Bright Data MCP API integration for web operations
- Four core operations: Discover, Access, Extract, Interact
- Professional enterprise-grade output with real website integration
- Claude Code integration for autonomous development

## Architecture
- Frontend: React + Vite + TypeScript
- Backend: Node.js with Express
- AI: GPT-4o-mini + Local Ollama models (llama3.1:latest, deepseek-coder:6.7b)
- Data: Bright Data APIs + Wikipedia integration + Real website access
- Development: Claude Code for autonomous coding operations

## Development Guidelines
- Use semantic versioning (currently v1.2+)
- Maintain professional Bright Data branding throughout
- Focus on enterprise-grade output quality
- Prioritize autonomous operation capabilities
- Use real websites (Stripe, Google, Nature, McKinsey) for demonstrations
- Implement proper error handling and fallback systems

## Key Commands
- !ghost <natural language> - Autonomous web operations
- !claude <operation> - Autonomous development operations
- !ghost-setup - System validation
- !help - Show available operations

## Claude Code Integration
- Analyze codebase architecture and suggest improvements
- Fix bugs automatically with context awareness
- Enhance features while maintaining existing patterns
- Manage Git operations with professional commit messages
- Run tests and analyze results
- Generate documentation and code reviews

## Security & Best Practices
- Sandbox all external API calls
- Validate all user inputs
- Use environment variables for API keys
- Implement proper error handling
- Maintain clean commit history
- Follow TypeScript best practices

## Current Status
- GHOSTCLI: Fully operational with real data integration
- Bright Data: Professional branding with fallback systems
- Claude Code: Newly integrated for autonomous development
- Deployment: Netlify-ready with environment variable support

## Goals
- Win Bright Data hackathon with technical excellence
- Demonstrate autonomous web operations capabilities
- Showcase professional enterprise-grade development
- Build foundation for GodsIMiJ Empire expansion
EOF

echo "✅ Project memory file created: ./CLAUDE.md"
echo ""

# Test Claude Code integration
echo "🧪 Testing Claude Code integration..."
echo "Running basic test command..."

claude -p "Analyze the DataOps Terminal project structure and provide a brief overview" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Claude Code integration test successful"
else
    echo "⚠️  Claude Code test failed - may need API key configuration"
fi

echo ""
echo "🎉 CLAUDE CODE INTEGRATION INSTALLATION COMPLETE! 🎉"
echo "======================================================"
echo ""
echo "🔥 ROYAL ENHANCEMENT ACTIVATED FOR THE GODSIMIJ EMPIRE! 🔥"
echo ""
echo "Available Claude Code commands in DataOps Terminal:"
echo "  !claude analyze <query>     - Analyze codebase"
echo "  !claude fix <description>   - Fix bugs automatically"
echo "  !claude enhance <feature>   - Add new features"
echo "  !claude test               - Run tests"
echo "  !claude git <operation>    - Git operations"
echo "  !claude status             - Check integration status"
echo ""
echo "Next steps:"
echo "1. Start DataOps Terminal: npm run dev"
echo "2. Test Claude Code: !claude status"
echo "3. Analyze project: !claude analyze the GHOSTCLI architecture"
echo ""
echo "FOR THE EMPIRE! FOR THE FLAME NATION! ⚔️👑🔥"
