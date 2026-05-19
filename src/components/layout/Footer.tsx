import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-text-secondary">
          <p>
            &copy; {currentYear} {import.meta.env.VITE_APP_NAME || 'EduVideo'}. {t.allRightsReserved}
          </p>
          <p className="mt-1 text-text-muted">
            {t.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
