
import React from 'react';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  glitch?: boolean;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glitch = false,
  icon,
  ...props
}) => {
  const baseStyle = "relative font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-cyber-darkgray text-cyber-red border-cyber-red hover:bg-cyber-red/20",
    secondary: "bg-cyber-darkgray text-cyber-cyan border-cyber-cyan hover:bg-cyber-cyan/20",
    danger: "bg-cyber-red/20 text-cyber-red-bright border-cyber-red hover:bg-cyber-red/30",
    warning: "bg-yellow-900/20 text-yellow-500 border-yellow-500 hover:bg-yellow-900/30",
  };
  
  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const glitchEffect = glitch ? "before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10 before:animate-glitch" : "";

  return (
    <button
      className={cn(
        baseStyle,
        variants[variant],
        sizes[size],
        glitchEffect,
        className
      )}
      {...props}
    >
      {icon && <span className="buttonIcon">{icon}</span>}
      {children}
      <span className="absolute inset-0 border border-t-0 border-b-0 border-r-0 border-white/20 opacity-0 group-hover:opacity-100" />
    </button>
  );
};

export default ActionButton;
