# Getting Started with R3B3L 4F

This guide will help you set up and start using R3B3L 4F quickly.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js 18.0.0 or higher
- npm or yarn package manager
- An OpenAI API key with access to GPT-4o
- (Optional) A Supabase account for persistence features

## Installation

### Option 1: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/GodsIMiJ1/R3B3L-4F.git
   cd R3B3L-4F
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenAI API key to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

5. (Optional) Add Supabase credentials for persistence:
   ```
   VITE_SUPABASE_URL=your-supabase-url-here
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open your browser and navigate to `http://localhost:5173`

### Option 2: Using the Launch Script

For a more streamlined setup, you can use the included launch script:

1. Make the script executable:
   ```bash
   chmod +x launch-r3b3l-local.sh
   ```

2. Run the script:
   ```bash
   ./launch-r3b3l-local.sh
   ```

The script will:
- Check for required dependencies
- Set up environment files
- Start the frontend
- Open your browser automatically

## First Steps

Once R3B3L 4F is running, you can:

1. **Chat with the AI**: Type a message in the chat input and press Enter
2. **Execute commands**: Type a command prefixed with `!` (e.g., `!help`)
3. **Toggle the airlock**: Use the `!airlock on` or `!airlock off` commands to control internet access
4. **Explore the interface**: Check out the status panels, terminal, and other UI elements

## Basic Commands

Here are some basic commands to get you started:

- `!help` - Display available commands
- `!status` - Check system status
- `!airlock [on|off]` - Control internet access
- `!clear` - Clear the terminal
- `!mission [name]` - Start a new mission
- `!net-scan [domain]` - Perform network reconnaissance
- `!git-harvest [username]` - Gather GitHub repository information

## Next Steps

Once you're familiar with the basics, check out the [User Guide](./user-guide.md) for a more comprehensive overview of R3B3L 4F's capabilities.
