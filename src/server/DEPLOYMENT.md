# R3B3L 4F Server Deployment Guide

This guide explains how to deploy the R3B3L 4F server components to enable the frontend deployed on Netlify to communicate with your local Ollama instance.

## Overview

The R3B3L 4F application consists of:

1. **Frontend**: React application deployed on Netlify
2. **Backend Server**: Node.js server that provides:
   - Ollama API proxy
   - Command execution bridge

The backend server must be running on a machine that has access to the Ollama API (typically localhost:11434).

## Deployment Options

### Option 1: Local Deployment with Port Forwarding

This option is suitable for personal use or development.

#### Prerequisites

- Node.js 18+ installed
- Ollama installed and running
- Router with port forwarding capability (for external access)

#### Steps

1. **Install dependencies**:
   ```bash
   cd src/server
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to set a secure API token and other settings.

3. **Start the server**:
   ```bash
   npm start
   ```
   This will start the combined server on port 5000 (or the port specified in your .env file).

4. **Set up port forwarding**:
   - Access your router's admin panel
   - Set up port forwarding for the port your server is running on (e.g., 5000)
   - Forward this port to the internal IP of the machine running the server

5. **Get your public IP**:
   - Visit a service like [whatismyip.com](https://whatismyip.com) to get your public IP
   - Your server will be accessible at `http://YOUR_PUBLIC_IP:5000`

6. **Update frontend environment variables**:
   - In your Netlify deployment settings, add the following environment variables:
     - `VITE_OLLAMA_PROXY_URL=http://YOUR_PUBLIC_IP:5000/api/ollama/generate`
     - `VITE_OLLAMA_VERSION_URL=http://YOUR_PUBLIC_IP:5000/api/ollama/version`
     - `VITE_COMMAND_BRIDGE_URL=http://YOUR_PUBLIC_IP:5000/api/execute`
     - `VITE_COMMAND_CONFIRM_URL=http://YOUR_PUBLIC_IP:5000/api/confirm`
     - `VITE_API_TOKEN=your-secure-token` (must match the token in your server's .env file)

### Option 2: VPS Deployment

This option provides a more stable and secure setup.

#### Prerequisites

- VPS with Node.js 18+ installed
- SSH access to the VPS
- Domain name (optional but recommended)

#### Steps

1. **Set up your VPS**:
   - Install Node.js and npm
   - Install Ollama on the VPS

2. **Clone the repository**:
   ```bash
   git clone https://github.com/GodsIMiJ1/R3B3L-4F.git
   cd R3B3L-4F/src/server
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to set a secure API token and other settings.

5. **Set up a process manager (PM2)**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name r3b3l-4f-server
   pm2 save
   pm2 startup
   ```

6. **Set up Nginx as a reverse proxy** (optional but recommended):
   ```bash
   sudo apt install nginx
   ```

   Create a new Nginx configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Set up SSL with Let's Encrypt** (optional but recommended):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

8. **Update frontend environment variables**:
   - In your Netlify deployment settings, add the following environment variables:
     - `VITE_OLLAMA_PROXY_URL=https://your-domain.com/api/ollama/generate`
     - `VITE_OLLAMA_VERSION_URL=https://your-domain.com/api/ollama/version`
     - `VITE_COMMAND_BRIDGE_URL=https://your-domain.com/api/execute`
     - `VITE_COMMAND_CONFIRM_URL=https://your-domain.com/api/confirm`
     - `VITE_API_TOKEN=your-secure-token` (must match the token in your server's .env file)

## Security Considerations

1. **API Token**: Always use a strong, random API token and keep it secret.

2. **CORS Configuration**: The server is configured to only accept requests from specified origins. Update the `ALLOWED_ORIGINS` in your .env file to include your Netlify domain.

3. **Rate Limiting**: The server includes rate limiting to prevent abuse. Adjust the settings in your .env file if needed.

4. **Command Execution**: Be cautious with the command execution feature. It runs commands on the server with the permissions of the user running the Node.js process.

5. **Firewall**: Configure your firewall to only allow connections to the necessary ports.

6. **HTTPS**: Always use HTTPS in production. If using Nginx, set up SSL with Let's Encrypt.

## Troubleshooting

1. **CORS Errors**: If you see CORS errors in the browser console, make sure your Netlify domain is included in the `ALLOWED_ORIGINS` in your server's .env file.

2. **Connection Refused**: Make sure your server is running and accessible from the internet. Check your firewall and port forwarding settings.

3. **Authentication Errors**: Verify that the API token in your frontend environment variables matches the one in your server's .env file.

4. **Ollama Connection Issues**: Make sure Ollama is running on the server and accessible at localhost:11434.

## Maintenance

1. **Logs**: Check the server logs for errors:
   ```bash
   pm2 logs r3b3l-4f-server
   ```

2. **Updates**: Regularly update your server dependencies:
   ```bash
   cd src/server
   npm update
   ```

3. **Monitoring**: Use PM2 to monitor your server:
   ```bash
   pm2 monit
   ```

4. **Backups**: Regularly backup your .env file and any other configuration files.

## Support

If you encounter any issues, please open an issue on the GitHub repository or contact the maintainers.
