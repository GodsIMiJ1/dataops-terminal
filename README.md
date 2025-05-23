# DataOps Terminal - Advanced Web Data Operations Platform

![DataOps Terminal Interface](public/screenshots/dataops-terminal-main.png)
![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red)


DataOps Terminal is an advanced web data operations platform with a modern terminal interface, built for the Bright Data Hackathon. It features comprehensive Bright Data integration, real command execution, natural language parsing, and web-connected task execution capabilities.

## 🏆 Bright Data Hackathon Submission

This project showcases the power of Bright Data's infrastructure through a professional, efficient interface that combines AI with advanced web data operations. DataOps Terminal leverages Bright Data's MCP and Data Collector to enable users to discover, access, extract, and interact with web data in a secure, efficient manner.

## Features

### Core Features
- 🤖 **AI-Powered Responses**: Connects to OpenAI GPT-4o for intelligent guidance
- 🔒 **Security Analysis**: Get expert advice on vulnerabilities, threats, and protection strategies
- 🔍 **Data Protection**: Discover best practices for securing your digital assets
- 💾 **Device Persistence**: Anonymous chat history storage using device ID with Supabase

### Terminal Features
- 💻 **Real Command Execution**: Execute shell commands directly from the terminal
- 🔄 **Natural Language Parsing**: Convert plain English to shell commands
- 🌐 **Web-Connected Tasks**: Perform reconnaissance, scraping, and data retrieval
- 📜 **Command Memory**: Track commands and responses with session-based logging
- 🔐 **Command Confirmation**: Security checks for potentially dangerous commands
- 🎯 **Mission Tracking**: Set mission objectives and track progress
- 🔒 **Airlock System**: Block all outbound HTTP requests for complete isolation

### Bright Data Integration
- 🔍 **Discover**: Find relevant content across the web with advanced search capabilities
- 🔑 **Access**: Navigate complex and protected websites with automated tools
- 📊 **Extract**: Pull structured, real-time data at scale from any website
- 🤖 **Interact**: Engage with dynamic, JavaScript-rendered pages like a human user
- 📥 **Collect**: Run pre-configured data collectors for specialized targets
- 📋 **Operations Panel**: Visual interface for managing all web data operations

### UI Features
- 🔊 **Text-to-Speech**: Listen to AI responses with built-in TTS functionality
- 📊 **System Metrics**: Monitor CPU, RAM, and storage usage in real-time
- 🌐 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Dual Interface Modes**: Choose between professional and cyberpunk themes

## 🚀 Quick Start

> You'll need an OpenAI API key for GPT-4o access and optionally a Supabase account for persistence.

### Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/dataops-solutions/dataops-terminal.git
   cd dataops-terminal
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Add your OpenAI API key to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

4. (Optional) For chat persistence, set up Supabase:
   - Create a free Supabase account at https://supabase.com
   - Create a new project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - Add your Supabase URL and anon key to the `.env` file:
   ```
   VITE_SUPABASE_URL=your-supabase-url-here
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open your browser at http://localhost:5173

### Deployment

This application is deployed on Netlify. You can access the live version at:

```
https://dataops-terminal.netlify.app/
```

For local development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### ⚙️ Commands

```
# Core Commands
!help                             → Show available commands
!mission <n> -o "<objective>"     → Create new mission configuration
!status                           → View current system state
!save md/json                     → Save session logs
!confirm                          → Execute queued dangerous commands

# Mode Controls
!internet on/off                  → Enable/disable internet access
!nlp on/off                       → Enable/disable natural language parsing
!autonomy on/off                  → Enable/disable autonomy mode
!mode suit/ghost                  → Switch between professional/cyberpunk themes

# Security Controls
!airlock on/off                   → Block/allow all outbound HTTP requests
!encrypt on/off                   → Enable/disable log encryption
!decrypt-log <filename>           → Decrypt an encrypted log
!passphrase <key>                 → Set encryption passphrase

# Web Commands (Internet must be enabled)
!recon <url>                      → Scan and log raw HTML
!fetch-pub <doi>                  → Fetch publication metadata
!scrape <keyword> <site>          → Keyword web crawl

# Extended Recon Suite
!net-scan <domain/ip>             → Perform DNS/IP scan and analysis
!git-harvest <org/user>           → Crawl GitHub repositories and metadata
!scan --doi "DOI"                 → Scan academic paper metadata
!science-scan --query "terms"     → Search Science.org for research articles

# Bright Data MCP Commands
!dataops discover --query "terms"   → Find content across the web
!dataops access --url "url"         → Access complex websites
!dataops extract --url "url"        → Extract structured data
!dataops interact --url "url"       → Interact with websites
!dataops collect --target "name"    → Run a Data Collector
!dataops ops                        → Open Bright Data Operations Panel
```

## 📂 File Structure

/dataops-terminal/
├── src/
│   ├── components/            # UI components
│   │   ├── terminal/          # Terminal components
│   │   │   └── CommandTerminal.tsx # Main terminal UI
│   │   ├── chat/              # Chat components
│   │   └── BrightDataPanel.tsx # Bright Data operations panel
│   ├── hooks/
│   │   └── useChatAI.tsx      # OpenAI integration hook
│   ├── lib/
│   │   ├── mcpHandler.ts      # Bright Data MCP integration
│   │   └── logManager.ts      # Log data management
│   ├── services/
│   │   ├── OpenAIService.ts   # OpenAI API integration
│   │   ├── SupabaseService.ts # Supabase persistence layer
│   │   ├── CommandParserService.ts # NLP command parser
│   │   ├── LoggerService.ts   # Markdown + JSON logging
│   │   ├── MissionService.ts  # Track state, mission, and logs
│   │   ├── AirlockService.ts  # Internet access control
│   │   ├── EncryptionService.ts # Encrypted log manager
│   │   ├── NetworkReconService.ts # DNS/IP scanning capabilities
│   │   └── GitHubReconService.ts # GitHub repository crawling
├── netlify/
│   └── functions/             # Serverless functions
│       └── dataCollector.js   # Bright Data collector integration
├── examples/
│   └── mission_sample.json    # Example mission configuration
├── supabase/
│   └── schema.sql             # Supabase database schema
├── public/
│   └── proof/                 # Proof of concept files
│       ├── benchmark.md       # Performance benchmarks
│       ├── pricing_extract_output.md # Sample data extraction
│       └── judge_report.md    # Evaluation report

## 📜 License

© 2025 GodsIMiJ AI Solutions. All Rights Reserved.

This software is proprietary and confidential. Unauthorized use, reproduction, modification, or distribution is strictly prohibited without explicit written consent from GodsIMiJ AI Solutions.

You may:
- View the code for evaluation or submission purposes only
- Not distribute, sell, license, or modify any part of the codebase

For commercial or extended usage, contact: james@godsimij-ai-solutions.com

---

*DataOps Terminal is designed for professional data operations and web data collection.*

## Developer

**Independent Full Stack Dev James Derek Ingersoll**
GodsIMiJ AI Solutions
www.godsimij-ai-solutions.com
james@godsimij-ai-solutions.com
