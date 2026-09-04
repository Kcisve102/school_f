import { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileService } from '../../../services/profile.service';
import {
  IntakeAnswer,
  IntakeDraft,
  IntakeQuestion,
  PROFILE_LIMITS,
} from '../../../types';
import IntakeProgress from './IntakeProgress';
import IntakeQuestionStep from './IntakeQuestionStep';
import Button from '../../common/Button';
import Loader from '../../common/Loader';
import { useLanguage } from '../../../contexts/LanguageContext';
import { translations } from '../../../translations';

export interface IntakeResult {
  draft: IntakeDraft;
  /** Kept alongside the draft so the review step can show what was asked. */
  answers: IntakeAnswer[];
}

interface ResumeIntakeWizardProps {
  /** Seeds the role field — usually the first job title on the profile. */
  suggestedRole: string;
  onComplete: (result: IntakeResult) => void;
  onCancel: () => void;
}

type Phase = 'role' | 'answering' | 'structuring';

/**
 * The adaptive intake.
 *
 * Two server calls, not a turn-by-turn conversation: one plans the questions
 * for the learner's target role, one structures their answers. The client paces
 * the questions one screen at a time, which is what makes it feel conversational
 * without paying for a round trip per question.
 *
 * Answers live in state and are never persisted mid-flow. An abandoned wizard
 * therefore leaves no trace, exactly like an abandoned draft — the saved profile
 * is the only checkpoint, and the learner is told nothing is stored until they
 * save.
 */
export const ResumeIntakeWizard: React.FC<ResumeIntakeWizardProps> = ({
  suggestedRole,
  onComplete,
  onCancel,
}) => {
  const { language } = useLanguage();
  const t = translations[language].profile;

  const [phase, setPhase] = useState<Phase>('role');
  const [targetRole, setTargetRole] = useState(suggestedRole);
  const [roleError, setRoleError] = useState<string | undefined>();
  const [planning, setPlanning] = useState(false);

  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);

  const startIntake = async () => {
    const role = targetRole.trim();
    if (role.length === 0) {
      setRoleError(t.intakeRoleRequired);
      return;
    }
    setRoleError(undefined);
    setPlanning(true);
    try {
      const plan = await profileService.planIntake(role);
      setQuestions(plan.questions);
      setIndex(0);
      setPhase('answering');
    } catch (error: any) {
      const data = error?.response?.data;
      toast.error(data?.message || data?.error || t.intakeFailed);
    } finally {
      setPlanning(false);
    }
  };

  const finish = async (finalAnswers: Record<string, string>) => {
    const payload: IntakeAnswer[] = questions
      .map((question) => ({
        id: question.id,
        section: question.section,
        prompt: question.prompt,
        answer: (finalAnswers[question.id] ?? '').trim(),
      }))
      .filter((answer) => answer.answer.length > 0);

    // Every question skipped. Nothing to structure, and calling the server
    // would only spend a Gemini call to be told the same thing.
    if (payload.length === 0) {
      toast.error(t.intakeNoAnswers);
      return;
    }

    setPhase('structuring');
    try {
      const draft = await profileService.draftFromIntake(targetRole.trim(), payload);
      onComplete({ draft, answers: payload });
    } catch (error: any) {
      const data = error?.response?.data;
      toast.error(data?.message || data?.error || t.intakeDraftFailed);
      setPhase('answering');
    }
  };

  const advance = (answer: string) => {
    const next = { ...answers, [questions[index].id]: answer };
    setAnswers(next);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      finish(next);
    }
  };

  if (phase === 'structuring') return <Loader text={t.intakeStructuring} />;

  if (phase === 'role') {
    return (
      <div>
        <h2 className="font-display text-lg text-text-primary mb-2">{t.intakeHeading}</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-[60ch]">
          {t.intakeBody}
        </p>

        <label
          htmlFor="intake-role"
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          {t.intakeRoleLabel}
        </label>
        <p className="text-xs text-text-muted mb-2">{t.intakeRoleHint}</p>
        <input
          id="intake-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder={t.intakeRolePlaceholder}
          maxLength={PROFILE_LIMITS.targetRole}
          disabled={planning}
          className={`input w-full ${roleError ? 'border-error focus:border-error' : ''}`}
        />
        {roleError && <p className="mt-1 text-sm text-error">{roleError}</p>}

        {/* Says why the questions arrive in English, so it does not read as a
            bug to someone using the app in Chinese or Tibetan. */}
        <div className="flex gap-3 rounded-lg border border-border bg-surface/60 px-4 py-3 mt-5">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-text-muted" />
          <p className="text-xs text-text-secondary leading-relaxed">{t.intakeEnglishNotice}</p>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button type="button" variant="primary" onClick={startIntake} loading={planning}>
            {planning ? t.intakePlanning : t.intakeStart}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={planning}>
            {t.intakeCancel}
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[index];

  return (
    <div>
      <div className="flex items-start gap-3 mb-5">
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-1 text-accent" />
        <div className="min-w-0">
          <h2 className="font-display text-lg text-text-primary leading-tight">
            {t.intakeHeading}
          </h2>
          <p className="text-xs text-text-muted mt-0.5 truncate">{targetRole}</p>
        </div>
      </div>

      <IntakeProgress current={index + 1} total={questions.length} />

      <IntakeQuestionStep
        key={question.id}
        question={question}
        value={answers[question.id] ?? ''}
        isFirst={index === 0}
        isLast={index === questions.length - 1}
        onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
        onBack={() => setIndex(Math.max(0, index - 1))}
        onNext={() => advance(answers[question.id] ?? '')}
        onSkip={() => advance('')}
      />

      <button
        type="button"
        onClick={onCancel}
        className="mt-6 min-h-[44px] text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      >
        {t.intakeCancel}
      </button>
    </div>
  );
};

export default ResumeIntakeWizard;
