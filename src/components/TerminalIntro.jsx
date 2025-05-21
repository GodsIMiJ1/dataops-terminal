import { useEffect, useState } from 'react';
import '../styles/TerminalIntro.css';

const introLines = [
  'r3b3l@boot:~$ sudo ./ignite_sequence.sh',
  'Initializing R3B3L 4F [v1.0.7] ...',
  'Connecting to Bright Data MCP server...',
  'Loading witness scrolls... ',
  'Engaging BlackOpsTerminal → /docs/',
  'Command index loaded.',
  '████ SYSTEM ONLINE ████',
  '',
  'r3b3l@docs:~$'
];

export default function TerminalIntro({ onFinish }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (currentLine < introLines.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + introLines[currentLine] + '\n');
        setCurrentLine((prev) => prev + 1);
      }, 600);
      return () => clearTimeout(timeout);
    } else {
      const finishTimeout = setTimeout(() => {
        onFinish();
      }, 800);
      return () => clearTimeout(finishTimeout);
    }
  }, [currentLine, onFinish]);

  return (
    <div className="terminal-intro">
      <pre className="flicker">{displayedText}</pre>
    </div>
  );
}
