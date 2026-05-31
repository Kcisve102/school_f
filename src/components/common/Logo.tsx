import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 32, className = '' }) => {
  return (
    <img
      src="/knowverd.png"
      alt="Knowverd"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default LogoMark;
