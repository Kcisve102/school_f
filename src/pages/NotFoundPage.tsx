import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].notFound;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center">
      <div className="w-full px-6 lg:px-12 xl:px-20 py-20">
        <div className="max-w-[1600px] mx-auto">
          <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-8">
            {t.heading}
          </p>

          {/* The numeral is the display element here, so it carries the page.
              Left-aligned and in text-primary — the accent is reserved for
              interactive elements and would read as decoration on a heading. */}
          <h1 className="font-display font-medium text-text-primary text-[clamp(4rem,18vw,14rem)] leading-[0.85] tracking-[-0.04em]">
            404
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-[46ch] mt-8 sm:mt-12">
            {t.message}
          </p>

          <button
            onClick={() => navigate('/')}
            className="group mt-10 sm:mt-16 inline-flex items-center gap-6 bg-white text-[#16171b] px-8 py-5 font-display text-sm uppercase tracking-[0.09em] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171b]"
          >
            {t.backToHome}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
