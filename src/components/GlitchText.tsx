
import React from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  intense?: boolean;
}

const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  className,
  intense = false
}) => {
  return (
    <span className={cn(
      "glitch-wrapper",
      className
    )}>
      <span 
        className={cn(
          "glitch-text",
          intense && "animate-glitch-slow"
        )} 
        data-text={text}
      >
        {text}
      </span>
    </span>
  );
};

export default GlitchText;
