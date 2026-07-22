import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'mark';
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 22, className = '', variant = 'full' }) => {
  return (
    <span
      className={`font-mono uppercase text-text-primary tracking-tight ${className}`}
      style={{ fontSize: size }}
    >
      {variant === 'mark' ? 'K' : 'knowverd'}
    </span>
  );
};

export default LogoMark;
