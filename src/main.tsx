import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Test Vite environment variables
import './utils/viteEnvTest'

createRoot(document.getElementById("root")!).render(<App />);
