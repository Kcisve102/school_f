import React, { useEffect, useRef, useState } from 'react';
import { useLanguage, LANGUAGES, Language } from '../../contexts/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LANGUAGE_LABELS: Record<Language, { short: string; full: string }> = {
  en: { short: 'EN', full: 'English' },
  zh: { short: '中', full: '中文' },
  bo: { short: 'བོད', full: 'བོད་ཡིག' },
};

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          ${sizeClasses[size]}
          ${textSizes[size]}
          rounded-xl
          flex items-center justify-center
          transition-all duration-300
          bg-surface-secondary
          border border-border
          hover:border-text-primary
          font-display
          text-text-secondary
          hover:text-text-primary
          min-w-[2.5rem]
        `}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Change language"
      >
        {LANGUAGE_LABELS[language].short}
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 py-1 min-w-[8rem] bg-surface border border-border-hover z-50"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              role="option"
              aria-selected={language === lang}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2 text-left text-sm
                flex items-center justify-between gap-3
                transition-colors
                ${language === lang ? 'text-text-primary font-medium' : 'text-text-secondary hover:text-text-primary'}
                hover:bg-surface-secondary
              `}
            >
              <span>{LANGUAGE_LABELS[lang].full}</span>
              <span className="text-xs text-text-muted">{LANGUAGE_LABELS[lang].short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
