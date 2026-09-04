import React from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface CareerProfileCTAProps {
  onCreateProfile: () => void;
}

/**
 * Offered only after a score at or above CAREER_PROFILE_THRESHOLD. The caller
 * owns that check; this component just presents the offer. The server enforces
 * the threshold independently, so a learner who reaches the endpoint another
 * way still gets turned away.
 */
export const CareerProfileCTA: React.FC<CareerProfileCTAProps> = ({ onCreateProfile }) => {
  const { language } = useLanguage();
  const t = translations[language].profile;

  return (
    <div className="mb-8 p-6 bg-surface rounded-lg border border-border">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-text-primary" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display font-medium text-text-primary text-base tracking-[-0.02em]">
            {t.ctaHeading}
          </h3>
          <p className="text-text-secondary text-sm mt-2 leading-relaxed">{t.ctaBody}</p>
          <button
            onClick={onCreateProfile}
            className="mt-4 inline-flex items-center gap-2 bg-white text-[#16171b] px-5 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            {t.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerProfileCTA;
