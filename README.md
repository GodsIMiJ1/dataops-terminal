# R3B3L 4F - Advanced Cybersecurity AI Assistant

![R3B3L 4F Interface](public/screenshot.png)

R3B3L 4F is an advanced cybersecurity AI assistant with a cyberpunk-inspired interface. It provides expert guidance on security analysis, ethical hacking, and digital protection in a technical but accessible manner.

## Features

- 🤖 **AI-Powered Responses**: Connects to Ollama for intelligent cybersecurity guidance using the r3b3l-4f-r1 model
- 🔒 **Security Analysis**: Get expert advice on vulnerabilities, threats, and protection strategies
- 🎭 **Ethical Hacking Guidance**: Learn about penetration testing and security assessment techniques
- 🔍 **Digital Protection**: Discover best practices for securing your digital assets
- 🔊 **Text-to-Speech**: Listen to AI responses with built-in TTS functionality
- 📊 **System Metrics**: Monitor CPU, RAM, and storage usage in real-time
- 🌐 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Cyberpunk Interface**: Immersive, futuristic UI with glitch effects and digital rain animation

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Ollama installed locally (https://ollama.ai/)

### Setup

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

3. Install the r3b3l-4f-r1 model in Ollama:
   ```bash
   ollama pull r3b3l-4f-r1
   # or create your own model with a Modelfile
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Usage

### Interacting with R3B3L 4F

1. Type your cybersecurity-related question in the input field at the bottom of the chat interface.
2. Press Enter or click the Send button to submit your question.
3. R3B3L 4F will process your question and provide a detailed response.
4. Use the voice button to hear the response read aloud.
5. The system metrics panel shows real-time resource usage.

### Example Questions

- "What are common vulnerabilities in web applications?"
- "How can I protect my network from ransomware attacks?"
- "Explain the concept of zero trust security."
- "What tools should I use for a basic security audit?"
- "How do I secure my home Wi-Fi network?"

## API Configuration

R3B3L 4F uses the Ollama API to generate responses. The API connects to your local Ollama instance.

If you need to modify the API settings:

1. Open `src/hooks/useChatAI.tsx` and update:
   ```typescript
   const API_URL = "http://localhost:11434/api/generate";
   const MODEL = "r3b3l-4f-r1"; // Change to your preferred Ollama model
   ```

2. Make sure Ollama is running locally before starting the application:
   ```bash
   # Start Ollama service
   ollama serve
   ```

## Deployment

### Deploying to Netlify

1. Create a Netlify account if you don't have one.
2. Connect your GitHub repository to Netlify.
3. Configure the build settings:
   - Build command: `npm run build` or `yarn build`
   - Publish directory: `dist`
4. Note: Since this application now uses Ollama which runs locally, the deployed version will need to connect to a hosted Ollama instance or be modified to use a cloud-based API service.
5. Deploy your site.

## Technologies Used

- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: UI component library
- **Ollama**: Local AI model for generating responses
- **Lucide Icons**: Icon library
- **React Router**: Client-side routing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Cyberpunk aesthetic inspired by classic sci-fi films and games
- Digital rain animation inspired by "The Matrix"
- Created by GodsIMiJ AI Solutions

---

© 2023 GodsIMiJ AI Solutions. All rights reserved.