import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { language, toggleLanguage } = useLanguage();

  const sizeClasses = {
    sm: 'h-8 px-2',
    md: 'h-10 px-3',
    lg: 'h-12 px-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`
        ${sizeClasses[size]}
        ${textSizes[size]}
        rounded-xl
        flex items-center justify-center
        transition-all duration-300
        bg-surface-secondary
        border border-border
        hover:border-accent/50
        hover:scale-105
        active:scale-95
        font-bold
        text-text-secondary
        hover:text-accent
        min-w-[2.5rem]
        ${className}
      `}
      aria-label={language === 'en' ? 'Switch to Chinese' : 'Switch to English'}
      title={language === 'en' ? '切换到中文' : 'Switch to English'}
    >
      {language === 'en' ? '中' : 'EN'}
    </button>
  );
};

export default LanguageToggle;
