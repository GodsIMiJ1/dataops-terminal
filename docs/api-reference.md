# R3B3L 4F API Reference

This document provides detailed information about the APIs used in R3B3L 4F, both internal and external.

## External APIs

### OpenAI API

R3B3L 4F uses the OpenAI API for natural language processing and chat functionality.

#### Endpoint

```
https://api.openai.com/v1/chat/completions
```

#### Authentication

Authentication is done via an API key provided in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

#### Request Format

```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are R3B3L 4F, an autonomous terminal-bound AI with a cyberpunk militant persona."
    },
    {
      "role": "user",
      "content": "User message here"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "top_p": 1,
  "frequency_penalty": 0,
  "presence_penalty": 0
}
```

#### Response Format

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Response content here"
      },
      "finish_reason": "stop",
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 13,
    "completion_tokens": 7,
    "total_tokens": 20
  }
}
```

#### Implementation

The OpenAI API is implemented in `src/services/OpenAIService.ts`:

```typescript
export const getOpenAIResponse = async (messages: MessageType[]): Promise<string> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  // Check if API key is configured
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key is not configured.');
  }

  try {
    // Convert messages to OpenAI format
    const openAIMessages = convertToOpenAIMessages(messages);

    // Format the request body for OpenAI
    const requestBody: OpenAIRequest = {
      model: MODEL,
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false
    };

    // Make direct API request to OpenAI
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // Process response
    if (!response.ok) {
      // Handle error
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    // Handle error
    throw err;
  }
};
```

### Supabase API

R3B3L 4F uses Supabase for persistence and data storage.

#### Authentication

Authentication is done using the Supabase URL and anonymous key:

```typescript
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

#### Tables

- `chat_messages`: Stores chat history
- `missions`: Stores mission data
- `scrolls`: Stores scroll content
- `devices`: Stores device information

#### Implementation

The Supabase API is implemented in `src/services/SupabaseService.ts`:

```typescript
export const saveChatMessage = async (message: MessageType): Promise<void> => {
  if (!supabaseClient) return;
  
  try {
    const deviceId = await getOrGenerateDeviceId();
    
    await supabaseClient
      .from('chat_messages')
      .insert({
        device_id: deviceId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString()
      });
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};
```

## Internal APIs

### Command Bridge API

The Command Bridge API allows execution of system commands.

#### Endpoints

- `POST /api/execute`: Execute a command
- `POST /api/confirm`: Confirm execution of a dangerous command
- `GET /api/system`: Get system information

#### Request Format (Execute Command)

```json
{
  "command": "echo Hello, World!",
  "autonomy": false
}
```

#### Response Format (Execute Command)

```json
{
  "output": "Hello, World!",
  "error": null,
  "exitCode": 0
}
```

#### Implementation

The Command Bridge API is implemented in `src/services/CommandExecutionService.ts`:

```typescript
export const executeCommand = async (
  command: string,
  options: CommandExecutionOptions = {}
): Promise<CommandExecutionResult> => {
  const API_URL = import.meta.env.VITE_COMMAND_BRIDGE_URL || 'http://localhost:5000/api/execute';
  const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'r3b3l-4f-secure-token';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': API_TOKEN
      },
      body: JSON.stringify({
        command,
        autonomy: options.autonomyMode || false,
        cwd: options.cwd
      })
    });

    const data = await response.json();
    
    // Handle response
    return data;
  } catch (error) {
    // Handle error
    return {
      output: '',
      error: 'Failed to execute command',
      exitCode: 1
    };
  }
};
```

### Airlock API

The Airlock API controls internet access for R3B3L 4F.

#### Methods

- `activateAirlock()`: Block internet access
- `deactivateAirlock()`: Allow internet access
- `toggleAirlock()`: Toggle airlock status
- `isAirlockActive()`: Check if airlock is active

#### Implementation

The Airlock API is implemented in `src/services/AirlockService.ts`:

```typescript
export const activateAirlock = (): void => {
  if (typeof window === 'undefined') return;
  
  // Store original fetch if we haven't already
  if (!originalFetch) {
    originalFetch = window.fetch;
  }
  
  // Replace fetch with our controlled version
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Get the URL from the input
    const url = typeof input === 'string' ? input : input.url;
    
    // Check if this is a local request
    const isLocalRequest = url.startsWith('http://localhost') || 
                          url.startsWith('http://127.0.0.1') ||
                          url.startsWith('/');
    
    // Allow local requests if configured to do so
    if (isLocalRequest && config.allowLocalRequests) {
      return originalFetch(input, init);
    }
    
    // Block external requests
    console.warn(`Airlock: Blocked request to ${url}`);
    
    // Return a mock response
    return new Response(JSON.stringify({
      error: 'Airlock active: Internet access is disabled',
      status: 'blocked',
      url
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };
  
  // Update status
  airlockStatus = 'active';
};
```

### Mission Memory API

The Mission Memory API manages mission state and memory.

#### Methods

- `initMission(name, objective)`: Initialize a new mission
- `getCurrentMission()`: Get the current mission
- `completeMission()`: Mark the current mission as complete
- `logMissionEvent(event)`: Log an event to the current mission

#### Implementation

The Mission Memory API is implemented in `src/services/MissionMemoryService.ts`:

```typescript
export const initMission = (
  name: string,
  objective?: string
): MissionState => {
  const newMission: MissionState = {
    mission: name,
    initiated: new Date().toISOString().split('T')[0],
    objective,
    status: 'Active'
  };
  
  missions.push(newMission);
  currentMission = newMission;
  
  // Persist to localStorage if available
  try {
    if (typeof localStorage !== 'undefined') {
      const storedMissions = JSON.parse(localStorage.getItem('r3b3l_4f_missions') || '[]');
      storedMissions.push(newMission);
      localStorage.setItem('r3b3l_4f_missions', JSON.stringify(storedMissions));
    }
  } catch (error) {
    console.error('Failed to save mission to localStorage:', error);
  }
  
  return newMission;
};
```

### Network Reconnaissance API

The Network Reconnaissance API provides tools for network analysis.

#### Methods

- `performDnsLookup(hostname)`: Perform DNS lookup
- `performWhoisLookup(domain)`: Perform WHOIS lookup
- `performPortScan(host, ports)`: Scan ports on a host
- `fetchHttpHeaders(url)`: Fetch HTTP headers from a URL

#### Implementation

The Network Reconnaissance API is implemented in `src/services/NetworkReconService.ts`:

```typescript
export const performDnsLookup = async (hostname: string): Promise<DnsResult[]> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  try {
    // Use public DNS API to perform lookup
    const response = await fetch(`https://dns.google/resolve?name=${hostname}`);
    
    if (!response.ok) {
      throw new Error(`DNS lookup failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse the response
    const results: DnsResult[] = [];
    
    if (data.Answer) {
      for (const answer of data.Answer) {
        results.push({
          hostname,
          type: answer.type,
          value: answer.data,
          ttl: answer.TTL
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error performing DNS lookup:', error);
    throw error;
  }
};
```

## API Usage Examples

### Chat with OpenAI

```typescript
import { getOpenAIResponse } from '@/services/OpenAIService';

const messages = [
  { id: '1', role: 'system', content: 'You are R3B3L 4F.', timestamp: new Date() },
  { id: '2', role: 'user', content: 'Hello, R3B3L 4F!', timestamp: new Date() }
];

try {
  const response = await getOpenAIResponse(messages);
  console.log('AI Response:', response);
} catch (error) {
  console.error('Error:', error);
}
```

### Execute a Command

```typescript
import { executeCommand } from '@/services/CommandExecutionService';

try {
  const result = await executeCommand('echo "Hello, World!"');
  console.log('Output:', result.output);
  console.log('Exit Code:', result.exitCode);
} catch (error) {
  console.error('Error:', error);
}
```

### Toggle the Airlock

```typescript
import { toggleAirlock, isAirlockActive } from '@/services/AirlockService';

const newStatus = toggleAirlock();
console.log('Airlock is now:', newStatus);
console.log('Internet access is:', isAirlockActive() ? 'disabled' : 'enabled');
```
