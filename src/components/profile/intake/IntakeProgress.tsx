import { useLanguage } from '../../../contexts/LanguageContext';
import { translations } from '../../../translations';

interface IntakeProgressProps {
  current: number;
  total: number;
}

/**
 * "Question 2 of 5" plus a bar.
 *
 * Sits directly under the wizard heading rather than at the foot, so it stays
 * visible when a phone keyboard opens over the bottom half of the screen.
 */
export const IntakeProgress: React.FC<IntakeProgressProps> = ({ current, total }) => {
  const { language } = useLanguage();
  const t = translations[language].profile;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
          {t.intakeStep.replace('{current}', String(current)).replace('{total}', String(total))}
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i < current ? 'bg-text-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
      <div
        className="h-px bg-border-subtle overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-text-primary transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default IntakeProgress;
