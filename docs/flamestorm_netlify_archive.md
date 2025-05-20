# 🔥 FLAMESTORM NETLIFY ARCHIVE 🔥

**CLASSIFIED: SOVEREIGN FLAME PROTOCOL**  
**AUTHORIZATION: GHOST KING MELEKZEDEK**

This document archives all Netlify deployment configurations and references that have been purged from the R3B3L 4F codebase as part of BlackOps Phase II - "SEAL THE TEMPLE" mission.

## Archived Netlify Configuration

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  # Note: For production deployment, you'll need to set up a hosted Ollama instance
  # or modify the code to use a cloud-based API service

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

The following environment variables were previously used for Netlify deployment:

```
VITE_OLLAMA_PROXY_URL=https://your-domain.com/api/ollama/generate
VITE_OLLAMA_VERSION_URL=https://your-domain.com/api/ollama/version
VITE_COMMAND_BRIDGE_URL=https://your-domain.com/api/execute
VITE_COMMAND_CONFIRM_URL=https://your-domain.com/api/confirm
VITE_API_TOKEN=your-secure-token
```

### CORS Configuration

The following domains were previously allowed in the CORS configuration:

```javascript
const ALLOWED_ORIGINS = [
  'https://r3b3l-4f.netlify.app',  // Main Netlify site
  'https://r3b3l-4f-dev.netlify.app', // Development Netlify site
  'http://localhost:8081',         // Local development
  'http://localhost:3000'          // Alternative local development
];
```

## Deployment Instructions (Archived)

### Netlify Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add the environment variables:
   - `VITE_OLLAMA_PROXY_URL`
   - `VITE_OLLAMA_VERSION_URL`
   - `VITE_COMMAND_BRIDGE_URL`
   - `VITE_COMMAND_CONFIRM_URL`
   - `VITE_API_TOKEN`
5. Deploy the site

### Proxy Server Configuration

For Netlify deployment, a proxy server was required to relay requests from the Netlify frontend to the local Ollama instance. This proxy server could be deployed on a VPS or run locally with port forwarding.

#### Option 1: Local Deployment with Port Forwarding

1. Run the server on your local machine
2. Set up port forwarding on your router
3. Configure Netlify environment variables to point to your public IP

#### Option 2: VPS Deployment

1. Deploy the server on a VPS
2. Set up Nginx as a reverse proxy
3. Configure SSL with Let's Encrypt
4. Configure Netlify environment variables to point to your domain

## Security Considerations (Archived)

1. **API Token**: Always use a strong, random API token and keep it secret.
2. **CORS Configuration**: The server was configured to only accept requests from specified origins.
3. **Rate Limiting**: The server included rate limiting to prevent abuse.
4. **Command Execution**: Caution was advised with the command execution feature.
5. **Firewall**: Configuration of firewall to only allow connections to the necessary ports.
6. **HTTPS**: Use of HTTPS in production with Nginx and Let's Encrypt.

---

**NOTICE**: This information has been archived as part of the BlackOps Phase II - "SEAL THE TEMPLE" mission. R3B3L 4F now operates in a fully sovereign local state, disconnected from all external hosting environments.

🔒 **SEALED BY ORDER OF THE GHOST KING** 🔒
