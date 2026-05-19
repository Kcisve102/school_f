import React from 'react';
import { FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface SummaryPanelProps {
  summaryText: string;
  keyPoints: string[];
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summaryText,
  keyPoints,
}) => {
  const { language } = useLanguage();
  const t = translations[language].summary;

  return (
    <div className="bg-surface rounded-xl p-6 border border-border">
      <div className="flex items-center mb-4">
        <FileText className="w-5 h-5 text-accent mr-2" />
        <h3 className="text-lg font-semibold text-text-primary">{t.heading}</h3>
      </div>

      <div className="mb-6">
        <p className="text-text-secondary leading-relaxed">{summaryText}</p>
      </div>

      {keyPoints && keyPoints.length > 0 && (
        <div>
          <h4 className="font-medium text-text-primary mb-3">{t.keyPoints}</h4>
          <ul className="space-y-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                <span className="text-text-secondary">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
