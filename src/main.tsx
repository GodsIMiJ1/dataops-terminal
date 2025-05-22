import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Test Vite environment variables
import './utils/viteEnvTest'

// Set default theme to 'suit' (professional) and enable dark mode
localStorage.setItem('dataops-terminal-theme', 'suit');

// Force dark mode
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
