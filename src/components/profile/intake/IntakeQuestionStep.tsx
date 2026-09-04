import { IntakeQuestion, PROFILE_LIMITS } from '../../../types';
import Button from '../../common/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { translations } from '../../../translations';

interface IntakeQuestionStepProps {
  question: IntakeQuestion;
  value: string;
  isFirst: boolean;
  isLast: boolean;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

/**
 * One question, one screen.
 *
 * Skip is a real, equally-weighted button rather than a faint link. A learner
 * with no work history has to be able to say so and move on — if the only easy
 * path forward is to type something, the form is pressuring them into inventing
 * exactly the history the whole feature exists to avoid.
 */
export const IntakeQuestionStep: React.FC<IntakeQuestionStepProps> = ({
  question,
  value,
  isFirst,
  isLast,
  onChange,
  onBack,
  onNext,
  onSkip,
}) => {
  const { language } = useLanguage();
  const t = translations[language].profile;

  const tooLong = value.length > PROFILE_LIMITS.intakeAnswer;
  const hasAnswer = value.trim().length > 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display text-lg text-text-primary leading-snug min-w-0">
          {question.prompt}
        </h3>
        {question.optional && (
          <span className="flex-shrink-0 text-[10px] uppercase tracking-[0.15em] text-text-muted mt-1.5">
            {t.intakeOptional}
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed mb-4">{question.helper}</p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={5}
        autoFocus
        className={`input w-full resize-y leading-relaxed ${
          tooLong ? 'border-error focus:border-error' : ''
        }`}
      />
      <div className="flex justify-end mt-1">
        <span
          className={`text-[11px] tabular-nums ${tooLong ? 'text-error' : 'text-text-muted'}`}
        >
          {value.length}/{PROFILE_LIMITS.intakeAnswer}
        </span>
      </div>
      {tooLong && <p className="mt-1 text-sm text-error">{t.intakeAnswerTooLong}</p>}

      {/* Wraps rather than overflowing on a narrow phone; every control is at
          least 44px tall. */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={tooLong || !hasAnswer}
        >
          {isLast ? t.intakeFinish : t.intakeNext}
        </Button>
        <Button type="button" variant="secondary" onClick={onSkip}>
          {t.intakeSkip}
        </Button>
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] px-2 text-sm text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            {t.intakeBack}
          </button>
        )}
      </div>
    </div>
  );
};

export default IntakeQuestionStep;
