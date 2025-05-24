# ⚙️ DataOps Terminal – Advanced Web Data Operations Platform
**License**: Proprietary | © 2025 GodsIMiJ AI Solutions

**DataOps Terminal** is a high-performance, professional-grade web data operations platform designed for real-time scraping, extraction, and analysis using Bright Data's infrastructure.
Developed for the Bright Data Hackathon, it provides a seamless command-line interface powered by AI, automation, and secure data flow management.

---

## 🏆 Bright Data Hackathon Submission

This project showcases:
- Full integration with **Bright Data’s MCP and Data Collectors**
- Advanced **command-based workflows** for automating Discover → Access → Extract pipelines
- A **professional terminal interface** with dual UI themes: *Suit (Business)* and *Ghost (Cyberpunk)*
- Autonomous and secure data handling for enterprise-ready deployments

---

## 💡 Key Features

### 🤖 GHOSTCLI - Autonomous Operations (NEW!)
- 🔥 **Revolutionary Natural Language Processing** – GPT-4o-mini + Bright Data integration
- 🧠 **Autonomous Command Interpretation** – Convert any natural language into structured web operations
- ⚡ **Four Core Operations**: discover, access, extract, interact
- 🎯 **Rich Terminal Output** – Beautiful formatted results with confidence scoring

### Core Functionality
- 🤖 **AI-Powered Interface** – GPT-4o integration for smart ops and command parsing
- 🔄 **Natural Language → Shell Command Execution**
- 📜 **Command Memory + Logs** – Markdown/JSON mission logging
- 🎯 **Mission Tracker** – Assign and monitor objectives

### Bright Data Operations
- 🔍 `!dataops discover` – Intelligent web content discovery
- 🔑 `!dataops access` – Navigate and authenticate through complex sites
- 📊 `!dataops extract` – Pull structured data at scale
- 🤖 `!dataops interact` – Engage dynamic, JavaScript-driven pages
- 🧠 `!dataops collect` – Run predefined Data Collectors (e.g. academic articles)
- 🧭 `!dataops ops` – Launch Bright Data control panel

### Recon + Web Tools
- 🛰️ `!recon`, `!scan`, `!fetch-pub`, `!science-scan`
- 🔗 GitHub recon, DOI lookups, and metadata aggregation

### Security & Control
- 🔒 `!airlock`, `!encrypt`, `!passphrase` – Lock down external requests and secure logs
- 🔐 `!confirm` – Prevent accidental destructive commands

---

## 🧠 Command Suite

```bash
# 🤖 GHOSTCLI - Autonomous Operations (NEW!)
!ghost search for AI research papers
!ghost extract pricing from stripe.com
!ghost access complex website with authentication
!ghost interact with search form on site
!ghost-setup

# Core Ops
!mission INFILTRATE -o "Extract product pricing"
!save md/json
!confirm

# Bright Data Flow
!dataops discover --query "AI agents"
!dataops access --url "https://example.com"
!dataops extract --url "https://example.com/products"
!dataops collect --target "science_papers"
```

---

## 🚀 Setup Instructions

### Quick Start (Demo Mode)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/GodsIMiJ1/dataops-terminal.git
   cd dataops-terminal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the terminal**: Open http://localhost:5173

### Production Deployment (Netlify)
1. **Fork/Clone** this repository to your GitHub account
2. **Connect to Netlify** and deploy from GitHub
3. **Set environment variables** in Netlify dashboard:
   ```
   VITE_BRIGHT_DATA_API_KEY=your-bright-data-key
   VITE_BRIGHT_DATA_COLLECTOR_ID=your-collector-id
   VITE_OPENAI_API_KEY=your-openai-key (for GHOSTCLI)
   ```

### 🔐 Mock Mode Explanation

**DataOps Terminal works in two modes:**

#### 🎭 **Demo Mode** (No API Keys Required)
- **GHOSTCLI** uses fallback parser for natural language processing
- **Bright Data operations** return realistic mock data
- **All commands functional** for demonstration purposes
- **Perfect for evaluation** and testing the interface

#### ⚡ **Production Mode** (API Keys Required)
- **Full GPT-4o-mini integration** for intelligent command parsing
- **Live Bright Data API calls** for real web data operations
- **Actual data extraction** from target websites
- **Enterprise-ready** for production deployments

**Mock data includes**: Realistic research papers, pricing tables, contact information, and structured datasets that demonstrate the full capability of the platform.

### 🎯 Live Demo Commands

Try these commands immediately after setup:

```bash
# Test GHOSTCLI autonomous operations
!ghost search for machine learning research papers
!ghost extract pricing information from SaaS websites
!ghost-setup

# Test traditional Bright Data operations
!dataops discover --query "AI startups"
!extract-doi --doi "10.1126/sciadv.adu9368"

# Test system features
!help
!mission DEMO -o "Test all terminal capabilities"
!mode ghost
```

---

## 📁 File Structure Summary

src/
├── components/       # Terminal, chat, and BrightData panels
├── hooks/            # AI hooks (useChatAI)
├── lib/              # Bright Data MCP, log manager
├── services/         # GPT-4o, Supabase, Recon tools, Encryption
netlify/
└── functions/        # Serverless Bright Data handlers

supabase/
└── schema.sql        # Session log structure
public/proof/         # Screenshots, benchmarks, judge reports

📜 License

This codebase is proprietary. Unauthorized use, cloning, or redistribution is strictly prohibited.
For evaluation or partnership inquiries: james@godsimij-ai-solutions.com

    DataOps Terminal is engineered for secure, professional web data collection.

👨‍💻 Developer

James Derek Ingersoll
Independent Full Stack Developer
Founder, GodsIMiJ AI Solutions
✉️ james@godsimij-ai-solutions.com
