# R3B3L 4F Developer Documentation

This document provides detailed information for developers working on the R3B3L 4F project.

## Project Structure

```
R3B3L-4F/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── chat/           # Chat-related components
│   │   ├── dashboard/      # Dashboard components
│   │   └── ui/             # UI components (shadcn)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point
│   └── index.css           # Global CSS
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Key Components

### Chat Interface

The chat interface is the main interaction point for users. It consists of:

- `ChatInterface.tsx`: Main container component
- `ChatHeader.tsx`: Header with title and controls
- `MessagesList.tsx`: Displays chat messages
- `ChatInputArea.tsx`: Input field and send button
- `SecurityAlert.tsx`: Displays security alerts

### Dashboard

The dashboard displays system metrics and status:

- `StatusDashboard.tsx`: Main dashboard component
- `ResourceMonitor.tsx`: Shows CPU, RAM, and storage usage
- `AlertsPanel.tsx`: Displays system alerts
- `StatusHeader.tsx`: Dashboard header

### UI Components

The project uses shadcn UI components, which are customized for the cyberpunk theme:

- `Button.tsx`: Custom button component
- `Input.tsx`: Text input component
- `Tooltip.tsx`: Tooltip component
- `Avatar.tsx`: User avatar component
- `GlitchText.tsx`: Text with glitch effect
- `DigitalRain.tsx`: Matrix-style digital rain animation

## Custom Hooks

### `useChatAI.tsx`

This hook manages the chat interaction with the OpenAI API:

```typescript
export const useChatAI = (): UseChatAIReturn => {
  // State for messages, loading, and errors
  const [messages, setMessages] = useState<MessageType[]>([...]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get AI response
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // API call to OpenAI
  };

  // Fallback responses
  const getFallbackResponse = (userMessage: string): string => {
    // Generate fallback responses
  };

  // Function to send a message
  const sendMessage = useCallback(async (content: string) => {
    // Add user message and get AI response
  }, [messages]);

  // Function to clear messages
  const clearMessages = useCallback(() => {
    // Reset messages
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};
```

### `useSystemMetrics.ts`

This hook simulates system metrics for the dashboard:

```typescript
export const useSystemMetrics = () => {
  // State for CPU, memory, storage, and model status
  const [cpuUsage, setCpuUsage] = useState<SystemMetric>({...});
  const [memoryUsage, setMemoryUsage] = useState<SystemMetric>({...});
  const [storageUsage, setStorageUsage] = useState<SystemMetric>({...});
  const [modelName, setModelName] = useState<string>('');
  const [modelStatus, setModelStatus] = useState<'idle' | 'processing' | 'error'>('idle');

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = async () => {
      // Update metrics
    };

    // Set interval for updates
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    cpuUsage,
    memoryUsage,
    storageUsage,
    modelName,
    modelStatus
  };
};
```

### `usePlayAI.ts`

This hook manages text-to-speech functionality:

```typescript
export const usePlayAI = () => {
  // State for speaking status and errors
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to speak text
  const speak = useCallback((text: string) => {
    // Text-to-speech implementation
  }, []);

  return {
    speak,
    isSpeaking,
    error
  };
};
```

## API Integration

### OpenAI API

The application uses the OpenAI API to generate responses. The configuration is in `src/hooks/useChatAI.tsx`:

```typescript
// OpenAI API configuration
const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo"; // Using GPT-3.5 Turbo as default
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY || ""; // Get API key from environment variable
```

The API request is formatted as follows:

```typescript
const requestBody = {
  model: MODEL,
  messages: apiMessages,
  temperature: 0.7,
  max_tokens: 2000,
  stream: false // Set to false to get a complete response
};

const response = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`
  },
  body: JSON.stringify(requestBody)
});
```

## Styling

The project uses Tailwind CSS with custom cyberpunk-themed variables defined in `src/index.css`:

```css
@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 5%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 349 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 180 100% 50%;
    --secondary-foreground: 0 0% 100%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 84.9%;
    --accent: 349 100% 50%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 349 100% 50%;
    --input: 240 3.7% 15.9%;
    --ring: 349 100% 50%;
    --radius: 0.5rem;
  }
}
```

Custom cyberpunk-themed classes are defined in the same file:

```css
.cyber-panel {
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  position: relative;
  overflow: hidden;
}

.cyber-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(255, 0, 85, 0.05) 50%
  );
  background-size: 100% 4px;
  z-index: 1;
  pointer-events: none;
}

.cyber-header {
  display: flex;
  align-items: center;
  font-family: monospace;
  text-transform: uppercase;
  color: hsl(var(--primary));
  font-weight: bold;
}
```

## Adding New Features

### Adding a New Chat Feature

1. Create a new component in `src/components/chat/`
2. Import and use it in `ChatInterface.tsx`
3. Update the `useChatAI.tsx` hook if needed

### Adding a New Dashboard Metric

1. Add a new state variable in `useSystemMetrics.ts`
2. Update the `updateMetrics` function to calculate the new metric
3. Create a new component in `src/components/dashboard/` to display the metric
4. Import and use it in `StatusDashboard.tsx`

### Changing the AI Model

To use a different OpenAI model:

1. Open `src/hooks/useChatAI.tsx`
2. Update the `MODEL` constant to the desired model name
3. Adjust the `max_tokens` and other parameters as needed

## Deployment

### Build Process

To build the project for production:

```bash
npm run build
# or
yarn build
```

This will create a `build` directory with the production-ready files.

### Environment Variables

The project uses environment variables for sensitive information like API keys:

1. For local development, create a `.env` file in the root directory
2. Add your API key: `REACT_APP_OPENAI_API_KEY=your_api_key_here`
3. For production, add the environment variable in your hosting platform (e.g., Netlify)

The application is already configured to use the environment variable in `useChatAI.tsx`:
```typescript
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY || "";
```

### Netlify Configuration

For Netlify deployment, create a `netlify.toml` file in the root directory:

```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Troubleshooting

### API Connection Issues

If the OpenAI API connection fails:

1. Check that your API key is correct
2. Verify your internet connection
3. Check the OpenAI service status
4. Look for error messages in the browser console

### Build Errors

Common build errors and solutions:

1. **Module not found**: Check import paths and make sure all dependencies are installed
2. **Type errors**: Fix TypeScript type issues
3. **Missing environment variables**: Make sure all required environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

---

© 2023 GodsIMiJ AI Solutions. All rights reserved.
