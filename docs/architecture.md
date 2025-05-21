# R3B3L 4F Architecture

This document provides a technical overview of the R3B3L 4F system architecture.

## System Overview

R3B3L 4F is built as a modern web application with a React frontend and optional backend services. The architecture is designed to be modular, allowing for both online and offline operation.

```
┌─────────────────────────────────────────────────────────────┐
│                      R3B3L 4F System                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │   Frontend  │◄──►│  Services   │◄──►│  External APIs  │  │
│  │  (React/TS) │    │  (TypeScript)│    │ (OpenAI/Supabase)│  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

The frontend is built with React, TypeScript, and Vite, using a component-based architecture.

### Key Components

- **App.tsx**: Main application component
- **Terminal**: Terminal UI components
- **Chat**: Chat interface components
- **SidePanel**: Status and control panels
- **UI Components**: Reusable UI elements

### State Management

- **React Hooks**: Custom hooks for state management
- **Context API**: Shared state across components
- **Local Storage**: Persistence for offline operation

## Services Layer

The services layer handles business logic and external integrations.

### Core Services

- **OpenAIService**: Integration with OpenAI's GPT-4o
- **AirlockService**: Controls internet access
- **CommandParserService**: Parses natural language into commands
- **CommandExecutionService**: Executes system commands
- **SupabaseService**: Handles persistence with Supabase
- **MissionMemoryService**: Manages mission state and memory
- **ScrollLoggerService**: Handles logging to scrolls
- **NetworkReconService**: Network reconnaissance tools
- **GitHubReconService**: GitHub repository analysis

## Data Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───►│   UI     │───►│ Services │───►│ External │
│ Interface│    │Components│    │  Layer   │    │   APIs   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
      ▲               ▲               ▲               │
      │               │               │               │
      └───────────────┴───────────────┴───────────────┘
                      Response Flow
```

1. User inputs text or commands in the UI
2. UI components process and route the input
3. Service layer handles business logic
4. External APIs are called if needed
5. Responses flow back through the system
6. UI is updated with the results

## Key Technologies

### Frontend

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library

### Backend (Optional)

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **dotenv**: Environment variable management

### External Services

- **OpenAI API**: GPT-4o for natural language processing
- **Supabase**: Backend-as-a-Service for persistence
- **GitHub API**: Repository data for reconnaissance
- **DNS/WHOIS APIs**: Network reconnaissance

## Security Architecture

### Airlock System

The airlock system controls internet access by intercepting fetch requests:

```javascript
// Simplified airlock implementation
window.fetch = async (input, init) => {
  if (airlockActive) {
    // Block external requests
    return new Response(JSON.stringify({
      error: 'Airlock active: Internet access is disabled'
    }), { status: 403 });
  }
  // Allow requests to proceed
  return originalFetch(input, init);
};
```

### Command Execution Security

Commands are validated and potentially dangerous operations require confirmation:

```javascript
if (isDangerousCommand(command)) {
  const confirmationToken = generateConfirmationToken(command);
  return {
    requiresConfirmation: true,
    confirmationToken,
    message: `This command is potentially dangerous. Confirm execution?`
  };
}
```

## Deployment Architecture

### Local Deployment

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │◄──►│  Optional   │◄──►│  External   │
│  (Vite)     │    │  Backend    │    │  Services   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Netlify Deployment

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │◄──►│  Netlify    │◄──►│  External   │
│  (Static)   │    │  Functions  │    │  Services   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## File Structure

```
/
├── public/                 # Static assets
├── src/
│   ├── components/         # UI components
│   │   ├── terminal/       # Terminal components
│   │   ├── chat/           # Chat components
│   │   └── ui/             # UI components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic services
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── scrolls/                # Mission scrolls
└── server/                 # Optional backend server
```

## Performance Considerations

- **Code Splitting**: Lazy loading of components
- **Memoization**: Optimized rendering with React.memo and useMemo
- **Service Workers**: Offline capabilities
- **Efficient State Management**: Minimizing rerenders

## Future Architecture Considerations

- **WebAssembly**: For performance-critical operations
- **WebWorkers**: For background processing
- **IndexedDB**: For larger offline storage
- **WebSockets**: For real-time communication
