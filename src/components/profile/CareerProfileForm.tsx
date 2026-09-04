import React, { useState } from 'react';
import StringListEditor from './StringListEditor';
import Button from '../common/Button';
import { PROFILE_LIMITS, CareerProfileSaveInput } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export interface CareerProfileFormValues {
  headline: string;
  summary: string;
  skills: string[];
  jobTitles: string[];
}

interface CareerProfileFormProps {
  initialValues: CareerProfileFormValues;
  sourceVideoId: number | null;
  sourceAttemptId: number | null;
  saving: boolean;
  onSave: (input: CareerProfileSaveInput) => void;
  onCancel?: () => void;
}

interface FieldErrors {
  headline?: string;
  summary?: string;
  skills?: string;
  jobTitles?: string;
}

/**
 * The profile editor. Validation here mirrors the server's limits so the
 * learner sees a problem before a round-trip — the server validates
 * independently and remains the authority.
 */
export const CareerProfileForm: React.FC<CareerProfileFormProps> = ({
  initialValues,
  sourceVideoId,
  sourceAttemptId,
  saving,
  onSave,
  onCancel,
}) => {
  const { language } = useLanguage();
  const t = translations[language].profile;

  const [headline, setHeadline] = useState(initialValues.headline);
  const [summary, setSummary] = useState(initialValues.summary);
  const [skills, setSkills] = useState<string[]>(initialValues.skills);
  const [jobTitles, setJobTitles] = useState<string[]>(initialValues.jobTitles);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    const trimmedHeadline = headline.trim();
    if (trimmedHeadline.length === 0) next.headline = t.errorRequired;
    else if (trimmedHeadline.length > PROFILE_LIMITS.headline) next.headline = t.errorTooLong;

    const trimmedSummary = summary.trim();
    if (trimmedSummary.length === 0) next.summary = t.errorRequired;
    else if (trimmedSummary.length > PROFILE_LIMITS.summary) next.summary = t.errorTooLong;

    if (skills.length === 0) next.skills = t.errorListEmpty;
    else if (skills.length > PROFILE_LIMITS.listItems) next.skills = t.errorTooManyItems;

    if (jobTitles.length === 0) next.jobTitles = t.errorListEmpty;
    else if (jobTitles.length > PROFILE_LIMITS.listItems) next.jobTitles = t.errorTooManyItems;

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({
      headline: headline.trim(),
      summary: summary.trim(),
      skills,
      jobTitles,
      sourceVideoId,
      sourceAttemptId,
    });
  };

  const summaryOver = summary.length > PROFILE_LIMITS.summary;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Headline */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <label htmlFor="profile-headline" className="block text-sm font-medium text-text-secondary">
            {t.headlineLabel}
          </label>
          <span className="text-[11px] text-text-muted tabular-nums">
            {headline.length}/{PROFILE_LIMITS.headline}
          </span>
        </div>
        <p className="text-xs text-text-muted mb-2">{t.headlineHint}</p>
        <input
          id="profile-headline"
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder={t.headlinePlaceholder}
          maxLength={PROFILE_LIMITS.headline}
          disabled={saving}
          className={`input ${errors.headline ? 'border-error focus:border-error' : ''}`}
        />
        {errors.headline && <p className="mt-1 text-sm text-error">{errors.headline}</p>}
      </div>

      {/* Summary */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <label htmlFor="profile-summary" className="block text-sm font-medium text-text-secondary">
            {t.summaryLabel}
          </label>
          <span
            className={`text-[11px] tabular-nums ${summaryOver ? 'text-error' : 'text-text-muted'}`}
          >
            {summary.length}/{PROFILE_LIMITS.summary}
          </span>
        </div>
        <p className="text-xs text-text-muted mb-2">{t.summaryHint}</p>
        <textarea
          id="profile-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder={t.summaryPlaceholder}
          rows={7}
          disabled={saving}
          className={`input resize-y leading-relaxed ${
            errors.summary ? 'border-error focus:border-error' : ''
          }`}
        />
        {errors.summary && <p className="mt-1 text-sm text-error">{errors.summary}</p>}
      </div>

      <StringListEditor
        label={t.skillsLabel}
        hint={t.skillsHint}
        placeholder={t.skillsPlaceholder}
        addLabel={t.addItem}
        removeLabel={t.removeItem}
        emptyLabel={t.emptyList}
        items={skills}
        onChange={setSkills}
        error={errors.skills}
        disabled={saving}
      />

      <StringListEditor
        label={t.jobTitlesLabel}
        hint={t.jobTitlesHint}
        placeholder={t.jobTitlesPlaceholder}
        addLabel={t.addItem}
        removeLabel={t.removeItem}
        emptyLabel={t.emptyList}
        items={jobTitles}
        onChange={setJobTitles}
        error={errors.jobTitles}
        disabled={saving}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="primary" loading={saving}>
          {saving ? t.saving : t.save}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
            {t.cancel}
          </Button>
        )}
      </div>
    </form>
  );
};

export default CareerProfileForm;
