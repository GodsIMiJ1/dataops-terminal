# R3B3L 4F Deployment Guide

This guide covers the various deployment options for R3B3L 4F, from local development to production hosting.

## Deployment Options

R3B3L 4F can be deployed in several ways:

1. **Local Development**: Run on your local machine for development
2. **Netlify Deployment**: Host on Netlify for public access
3. **Custom Server**: Deploy to your own server or VPS
4. **Docker Deployment**: Run in a containerized environment

## Local Development Deployment

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- OpenAI API key

### Steps

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

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenAI API key to the `.env` file:
   ```
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Access R3B3L 4F at `http://localhost:5173`

## Netlify Deployment

### Prerequisites

- GitHub account
- Netlify account
- OpenAI API key

### Steps

1. Fork the R3B3L 4F repository on GitHub

2. Log in to Netlify and click "New site from Git"

3. Select GitHub as your Git provider and authorize Netlify

4. Select your forked R3B3L 4F repository

5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. Add environment variables in the Netlify dashboard:
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key
   - (Optional) `VITE_SUPABASE_URL`: Your Supabase URL
   - (Optional) `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

7. Click "Deploy site"

8. Once deployed, you can access your site at the Netlify-provided URL

### Custom Domain (Optional)

1. In the Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to configure your domain's DNS settings

## Custom Server Deployment

### Prerequisites

- VPS or dedicated server
- Node.js 18.0.0 or higher
- Nginx or Apache web server
- SSL certificate (recommended)

### Steps

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/GodsIMiJ1/R3B3L-4F.git
   cd R3B3L-4F
   ```

2. Install dependencies:
   ```bash
   npm install --production
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your environment variables to the `.env` file

5. Build the application:
   ```bash
   npm run build
   ```

6. Configure your web server to serve the `dist` directory

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /path/to/R3B3L-4F/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Process Management

For production deployments, use a process manager like PM2:

```bash
npm install -g pm2
pm2 start npm --name "r3b3l-4f" -- run preview
pm2 save
pm2 startup
```

## Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose (optional)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/GodsIMiJ1/R3B3L-4F.git
   cd R3B3L-4F
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Add your environment variables to the `.env` file

4. Build and run the Docker container:
   ```bash
   docker build -t r3b3l-4f .
   docker run -p 8080:80 --env-file .env r3b3l-4f
   ```

5. Access R3B3L 4F at `http://localhost:8080`

### Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  r3b3l-4f:
    build: .
    ports:
      - "8080:80"
    env_file:
      - .env
    restart: unless-stopped
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## Environment Variables

### Required Variables

- `VITE_OPENAI_API_KEY`: Your OpenAI API key

### Optional Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Security Considerations

### API Key Security

- Never commit your `.env` file to version control
- Use environment variables for sensitive information
- Consider using a secrets manager for production deployments

### CORS Configuration

If you're deploying the backend server separately, configure CORS appropriately:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

### SSL/TLS

Always use HTTPS in production to encrypt data in transit:

- Use Let's Encrypt for free SSL certificates
- Configure your web server to redirect HTTP to HTTPS
- Enable HSTS for additional security

## Monitoring and Maintenance

### Logging

Configure logging to monitor application health:

```javascript
console.log(`[${new Date().toISOString()}] Server started on port ${PORT}`);
```

### Updates

Regularly update dependencies to patch security vulnerabilities:

```bash
npm audit fix
npm update
```

### Backups

Regularly backup your data, especially if using Supabase for persistence:

```bash
# Example backup script for Supabase
npx supabase db dump -f backup.sql
```

## Troubleshooting Deployment Issues

### Common Issues

- **404 errors**: Ensure your web server is configured to serve the SPA correctly
- **API connection errors**: Check your environment variables and network configuration
- **CORS errors**: Verify your CORS configuration in the server
- **Build failures**: Check for dependency issues or build script errors

### Logs

Check logs for error messages:

```bash
# Netlify logs
netlify logs

# Server logs
tail -f /var/log/nginx/error.log

# Docker logs
docker logs r3b3l-4f
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Build completes successfully
- [ ] Static assets are served correctly
- [ ] API connections work
- [ ] HTTPS is enabled
- [ ] CORS is configured properly
- [ ] Error logging is set up
- [ ] Backup strategy is in place
