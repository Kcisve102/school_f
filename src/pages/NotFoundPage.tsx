import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].notFound;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <h1 className="text-9xl font-bold text-accent">404</h1>
        <h2 className="text-3xl font-semibold text-text-primary mt-4 mb-2">
          {t.heading}
        </h2>
        <p className="text-text-secondary mb-8 max-w-md">
          {t.message}
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          {t.backToHome}
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
