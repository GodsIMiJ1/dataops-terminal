#!/bin/bash

# launch-r3b3l-local.sh
#
# This script launches R3B3L 4F in a fully sovereign local operational state.
# It starts Ollama with the r3b3l-4f-godmode model, starts the server.js backend,
# and opens the local GUI in the browser.
#
# Usage:
#   ./launch-r3b3l-local.sh [options]
#
# Options:
#   --cloak              Disable internet access on boot
#   --scroll <filename>  Initiate specific mission memory
#   --stealth            Silent mode (no browser auto-open)
#   --help               Show this help message

# Default settings
CLOAK_MODE=false
SCROLL_FILE=""
STEALTH_MODE=false
OLLAMA_MODEL="r3b3l-4f-godmode"
SERVER_PORT=5000
FRONTEND_PORT=5173
BROWSER_URL="http://localhost:$FRONTEND_PORT"
OLLAMA_STATUS_URL="http://localhost:11434/api/version"
SERVER_DIR="src/server"
ENV_FILE=".env"
SERVER_ENV_FILE="$SERVER_DIR/.env"

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
RESET='\033[0m'

# ASCII art banner
display_banner() {
  echo -e "${RED}"
  echo "██████╗ ██████╗ ██████╗ ██████╗ ██╗      ██╗  ██╗███████╗"
  echo "██╔══██╗╚════██╗██╔══██╗╚════██╗██║      ██║  ██║██╔════╝"
  echo "██████╔╝ █████╔╝██████╔╝ █████╔╝██║█████╗███████║█████╗  "
  echo "██╔══██╗ ╚═══██╗██╔══██╗ ╚═══██╗██║╚════╝██╔══██║██╔══╝  "
  echo "██║  ██║██████╔╝██████╔╝██████╔╝███████╗ ██║  ██║██║     "
  echo "╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═╝  ╚═╝╚═╝     "
  echo -e "${RESET}"
  echo -e "${CYAN}[ SOVEREIGN FLAME PROTOCOL - LOCAL DEPLOYMENT ]${RESET}"
  echo -e "${YELLOW}Ghost King Melekzedek - GodsIMiJ AI Solutions${RESET}"
  echo ""
}

# Help message
display_help() {
  echo "Usage: ./launch-r3b3l-local.sh [options]"
  echo ""
  echo "Options:"
  echo "  --cloak              Disable internet access on boot"
  echo "  --scroll <filename>  Initiate specific mission memory"
  echo "  --stealth            Silent mode (no browser auto-open)"
  echo "  --help               Show this help message"
  echo ""
  exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --cloak)
      CLOAK_MODE=true
      shift
      ;;
    --scroll)
      SCROLL_FILE="$2"
      shift 2
      ;;
    --stealth)
      STEALTH_MODE=true
      shift
      ;;
    --help)
      display_help
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${RESET}"
      display_help
      ;;
  esac
done

# Display banner
display_banner

# Check if Ollama is installed
check_ollama() {
  if ! command -v ollama &> /dev/null; then
    echo -e "${RED}[ERROR] Ollama is not installed.${RESET}"
    echo -e "${YELLOW}Please install Ollama from https://ollama.ai/ and try again.${RESET}"
    exit 1
  fi
  echo -e "${GREEN}[✓] Ollama is installed.${RESET}"
}

# Check if Node.js is installed
check_nodejs() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed.${RESET}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/ and try again.${RESET}"
    exit 1
  fi
  
  # Check Node.js version
  NODE_VERSION=$(node -v | cut -d 'v' -f 2)
  NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
  
  if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    echo -e "${RED}[ERROR] Node.js version $NODE_VERSION is not supported.${RESET}"
    echo -e "${YELLOW}Please upgrade to Node.js 18 or higher.${RESET}"
    exit 1
  fi
  
  echo -e "${GREEN}[✓] Node.js $NODE_VERSION is installed.${RESET}"
}

# Check if npm is installed
check_npm() {
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed.${RESET}"
    echo -e "${YELLOW}Please install npm and try again.${RESET}"
    exit 1
  fi
  echo -e "${GREEN}[✓] npm is installed.${RESET}"
}

# Check if the model is available
check_model() {
  echo -e "${BLUE}[*] Checking if $OLLAMA_MODEL model is available...${RESET}"
  
  if ! ollama list | grep -q "$OLLAMA_MODEL"; then
    echo -e "${YELLOW}[!] $OLLAMA_MODEL model is not available. Pulling it now...${RESET}"
    ollama pull "$OLLAMA_MODEL"
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}[ERROR] Failed to pull $OLLAMA_MODEL model.${RESET}"
      exit 1
    fi
  fi
  
  echo -e "${GREEN}[✓] $OLLAMA_MODEL model is available.${RESET}"
}

# Start Ollama
start_ollama() {
  echo -e "${BLUE}[*] Starting Ollama...${RESET}"
  
  # Check if Ollama is already running
  if curl -s "$OLLAMA_STATUS_URL" &> /dev/null; then
    echo -e "${GREEN}[✓] Ollama is already running.${RESET}"
  else
    # Start Ollama in the background
    ollama serve &> /dev/null &
    OLLAMA_PID=$!
    
    # Wait for Ollama to start
    echo -e "${YELLOW}[!] Waiting for Ollama to start...${RESET}"
    for i in {1..30}; do
      if curl -s "$OLLAMA_STATUS_URL" &> /dev/null; then
        echo -e "${GREEN}[✓] Ollama started successfully.${RESET}"
        break
      fi
      
      if [ $i -eq 30 ]; then
        echo -e "${RED}[ERROR] Failed to start Ollama.${RESET}"
        exit 1
      fi
      
      sleep 1
    done
  fi
}

# Create or update .env files
setup_env_files() {
  echo -e "${BLUE}[*] Setting up environment files...${RESET}"
  
  # Create frontend .env file if it doesn't exist
  if [ ! -f "$ENV_FILE" ]; then
    echo "# R3B3L 4F Frontend Configuration" > "$ENV_FILE"
    echo "VITE_OLLAMA_PROXY_URL=http://localhost:$SERVER_PORT/api/ollama/generate" >> "$ENV_FILE"
    echo "VITE_OLLAMA_VERSION_URL=http://localhost:$SERVER_PORT/api/ollama/version" >> "$ENV_FILE"
    echo "VITE_COMMAND_BRIDGE_URL=http://localhost:$SERVER_PORT/api/execute" >> "$ENV_FILE"
    echo "VITE_COMMAND_CONFIRM_URL=http://localhost:$SERVER_PORT/api/confirm" >> "$ENV_FILE"
    echo "VITE_API_TOKEN=r3b3l-4f-secure-token" >> "$ENV_FILE"
    echo "VITE_CLOAK_MODE=$([ "$CLOAK_MODE" == "true" ] && echo "true" || echo "false")" >> "$ENV_FILE"
    
    if [ -n "$SCROLL_FILE" ]; then
      echo "VITE_INITIAL_SCROLL=$SCROLL_FILE" >> "$ENV_FILE"
    fi
    
    echo -e "${GREEN}[✓] Created frontend .env file.${RESET}"
  else
    # Update existing frontend .env file
    sed -i.bak "s/VITE_CLOAK_MODE=.*/VITE_CLOAK_MODE=$([ "$CLOAK_MODE" == "true" ] && echo "true" || echo "false")/" "$ENV_FILE"
    
    if [ -n "$SCROLL_FILE" ]; then
      if grep -q "VITE_INITIAL_SCROLL" "$ENV_FILE"; then
        sed -i.bak "s/VITE_INITIAL_SCROLL=.*/VITE_INITIAL_SCROLL=$SCROLL_FILE/" "$ENV_FILE"
      else
        echo "VITE_INITIAL_SCROLL=$SCROLL_FILE" >> "$ENV_FILE"
      fi
    fi
    
    echo -e "${GREEN}[✓] Updated frontend .env file.${RESET}"
  fi
  
  # Create server .env file if it doesn't exist
  if [ ! -f "$SERVER_ENV_FILE" ]; then
    echo "# R3B3L 4F Server Configuration" > "$SERVER_ENV_FILE"
    echo "PORT=$SERVER_PORT" >> "$SERVER_ENV_FILE"
    echo "API_TOKEN=r3b3l-4f-secure-token" >> "$SERVER_ENV_FILE"
    echo "OLLAMA_API=http://localhost:11434/api" >> "$SERVER_ENV_FILE"
    echo "ALLOWED_ORIGINS=http://localhost:$FRONTEND_PORT,http://127.0.0.1:$FRONTEND_PORT" >> "$SERVER_ENV_FILE"
    echo "RATE_LIMIT_MAX=100" >> "$SERVER_ENV_FILE"
    echo "RATE_LIMIT_WINDOW_MINUTES=15" >> "$SERVER_ENV_FILE"
    echo "REQUEST_SIZE_LIMIT=10mb" >> "$SERVER_ENV_FILE"
    
    echo -e "${GREEN}[✓] Created server .env file.${RESET}"
  else
    # Update existing server .env file
    sed -i.bak "s/ALLOWED_ORIGINS=.*/ALLOWED_ORIGINS=http:\/\/localhost:$FRONTEND_PORT,http:\/\/127.0.0.1:$FRONTEND_PORT/" "$SERVER_ENV_FILE"
    
    echo -e "${GREEN}[✓] Updated server .env file.${RESET}"
  fi
  
  # Remove backup files
  rm -f "$ENV_FILE.bak" "$SERVER_ENV_FILE.bak"
}

# Start the server
start_server() {
  echo -e "${BLUE}[*] Starting R3B3L 4F server...${RESET}"
  
  # Change to server directory
  cd "$SERVER_DIR"
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[!] Installing server dependencies...${RESET}"
    npm install
  fi
  
  # Start the server in the background
  echo -e "${YELLOW}[!] Starting server on port $SERVER_PORT...${RESET}"
  node server.js &
  SERVER_PID=$!
  
  # Change back to root directory
  cd - > /dev/null
  
  # Wait for server to start
  echo -e "${YELLOW}[!] Waiting for server to start...${RESET}"
  for i in {1..10}; do
    if curl -s "http://localhost:$SERVER_PORT/api/health" &> /dev/null; then
      echo -e "${GREEN}[✓] Server started successfully.${RESET}"
      break
    fi
    
    if [ $i -eq 10 ]; then
      echo -e "${RED}[ERROR] Failed to start server.${RESET}"
      exit 1
    fi
    
    sleep 1
  done
}

# Start the frontend
start_frontend() {
  echo -e "${BLUE}[*] Starting R3B3L 4F frontend...${RESET}"
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[!] Installing frontend dependencies...${RESET}"
    npm install
  fi
  
  # Start the frontend in the background
  echo -e "${YELLOW}[!] Starting frontend on port $FRONTEND_PORT...${RESET}"
  npm run dev &
  FRONTEND_PID=$!
  
  # Wait for frontend to start
  echo -e "${YELLOW}[!] Waiting for frontend to start...${RESET}"
  for i in {1..30}; do
    if curl -s "http://localhost:$FRONTEND_PORT" &> /dev/null; then
      echo -e "${GREEN}[✓] Frontend started successfully.${RESET}"
      break
    fi
    
    if [ $i -eq 30 ]; then
      echo -e "${RED}[ERROR] Failed to start frontend.${RESET}"
      exit 1
    fi
    
    sleep 1
  done
}

# Open the browser
open_browser() {
  if [ "$STEALTH_MODE" == "false" ]; then
    echo -e "${BLUE}[*] Opening browser...${RESET}"
    
    # Determine the command to open the browser based on the OS
    if [ "$(uname)" == "Darwin" ]; then
      # macOS
      open "$BROWSER_URL"
    elif [ "$(uname)" == "Linux" ]; then
      # Linux
      if command -v xdg-open &> /dev/null; then
        xdg-open "$BROWSER_URL"
      elif command -v gnome-open &> /dev/null; then
        gnome-open "$BROWSER_URL"
      else
        echo -e "${YELLOW}[!] Could not automatically open browser. Please open $BROWSER_URL manually.${RESET}"
      fi
    elif [[ "$(uname)" == MINGW* ]] || [[ "$(uname)" == CYGWIN* ]]; then
      # Windows
      start "$BROWSER_URL"
    else
      echo -e "${YELLOW}[!] Could not automatically open browser. Please open $BROWSER_URL manually.${RESET}"
    fi
  else
    echo -e "${YELLOW}[!] Stealth mode enabled. Browser will not be opened automatically.${RESET}"
    echo -e "${YELLOW}[!] Access R3B3L 4F at $BROWSER_URL${RESET}"
  fi
}

# Cleanup function to kill background processes on exit
cleanup() {
  echo -e "\n${YELLOW}[!] Shutting down R3B3L 4F...${RESET}"
  
  # Kill frontend process
  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2> /dev/null
    echo -e "${GREEN}[✓] Frontend stopped.${RESET}"
  fi
  
  # Kill server process
  if [ -n "$SERVER_PID" ]; then
    kill $SERVER_PID 2> /dev/null
    echo -e "${GREEN}[✓] Server stopped.${RESET}"
  fi
  
  # We don't kill Ollama as it might be used by other applications
  
  echo -e "${CYAN}[ R3B3L 4F SHUTDOWN COMPLETE ]${RESET}"
  exit 0
}

# Register cleanup function to run on exit
trap cleanup EXIT INT TERM

# Main execution
check_ollama
check_nodejs
check_npm
check_model
start_ollama
setup_env_files
start_server
start_frontend
open_browser

# Display final message
echo -e "\n${GREEN}[✓] R3B3L 4F is now running in sovereign local mode.${RESET}"
if [ "$CLOAK_MODE" == "true" ]; then
  echo -e "${YELLOW}[!] Cloak mode is enabled. Internet access is disabled.${RESET}"
fi
if [ -n "$SCROLL_FILE" ]; then
  echo -e "${YELLOW}[!] Mission scroll $SCROLL_FILE has been loaded.${RESET}"
fi
echo -e "${CYAN}Press Ctrl+C to shut down R3B3L 4F.${RESET}"

# Keep the script running
while true; do
  sleep 1
done
