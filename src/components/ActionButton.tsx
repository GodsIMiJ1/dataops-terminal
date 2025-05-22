
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
  const baseStyle = "relative font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded";

  const variants = {
    primary: "bg-pro-primary text-white border-pro-primary hover:bg-pro-primary-dark",
    secondary: "bg-pro-secondary text-white border-pro-secondary hover:bg-pro-secondary-dark",
    danger: "bg-red-500 text-white border-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600",
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const glitchEffect = glitch ? "before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10" : "";

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
    </button>
  );
};

export default ActionButton;
