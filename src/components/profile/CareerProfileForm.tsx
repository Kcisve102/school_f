import React, { useState } from 'react';
import StringListEditor from './StringListEditor';
import ResumeSectionEditor, { EntryField } from './intake/ResumeSectionEditor';
import ContactFieldsEditor from './intake/ContactFieldsEditor';
import Button from '../common/Button';
import {
  PROFILE_LIMITS,
  CareerProfileSaveInput,
  ProfileLink,
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
} from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

export interface CareerProfileFormValues {
  headline: string;
  summary: string;
  skills: string[];
  jobTitles: string[];
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  phone?: string | null;
  city?: string | null;
  links?: ProfileLink[];
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
  links?: string;
  entries?: string;
}

/**
 * The profile editor. Validation here mirrors the server's limits so the
 * learner sees a problem before a round-trip — the server validates
 * independently and remains the authority.
 */
/* The translation object is `as const`, so each language's block has its own
   literal string types. Only the field labels are needed here, widened to
   `string` so a zh or bo block is just as assignable as the en one. */
type ProfileStrings = {
  [K in keyof (typeof translations)['en']['profile']]: string;
};

/* Field definitions live outside the component: they are constant, and
   rebuilding them on every keystroke would remount the inputs. */
const EXPERIENCE_FIELDS = (t: ProfileStrings): EntryField<ResumeExperience>[] => [
  { key: 'role', label: t.fieldRole, half: true },
  { key: 'employer', label: t.fieldEmployer, half: true },
  { key: 'location', label: t.fieldLocation, half: true },
  { key: 'start', label: t.fieldStart, kind: 'date', half: true, hint: t.dateHint },
  { key: 'end', label: t.fieldEnd, kind: 'date', half: true },
  { key: 'current', label: t.fieldCurrent, kind: 'check' },
  { key: 'bullets', label: t.fieldBullets, kind: 'bullets' },
];

const EDUCATION_FIELDS = (t: ProfileStrings): EntryField<ResumeEducation>[] => [
  { key: 'credential', label: t.fieldCredential, half: true },
  { key: 'institution', label: t.fieldInstitution, half: true },
  { key: 'location', label: t.fieldLocation, half: true },
  { key: 'end', label: t.fieldIssued, kind: 'date', half: true },
  { key: 'detail', label: t.fieldDetail, kind: 'detail' },
];

const PROJECT_FIELDS = (t: ProfileStrings): EntryField<ResumeProject>[] => [
  { key: 'name', label: t.fieldProjectName },
  { key: 'detail', label: t.fieldDetail, kind: 'detail' },
  { key: 'link', label: t.fieldLink },
];

const CERTIFICATION_FIELDS = (t: ProfileStrings): EntryField<ResumeCertification>[] => [
  { key: 'name', label: t.fieldCertName, half: true },
  { key: 'issuer', label: t.fieldIssuer, half: true },
  { key: 'issued', label: t.fieldIssued, kind: 'date', half: true },
];

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
  const [experience, setExperience] = useState<ResumeExperience[]>(initialValues.experience ?? []);
  const [education, setEducation] = useState<ResumeEducation[]>(initialValues.education ?? []);
  const [projects, setProjects] = useState<ResumeProject[]>(initialValues.projects ?? []);
  const [certifications, setCertifications] = useState<ResumeCertification[]>(
    initialValues.certifications ?? []
  );
  const [phone, setPhone] = useState(initialValues.phone ?? '');
  const [city, setCity] = useState(initialValues.city ?? '');
  const [links, setLinks] = useState<ProfileLink[]>(initialValues.links ?? []);
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

    // Mirrors the server's scheme check. That one is the gate — this only saves
    // the learner a round-trip to find out.
    for (const link of links) {
      if (!link.url.trim() && !link.label.trim()) continue;
      if (!/^https?:\/\/\S+/i.test(link.url.trim())) {
        next.links = t.errorInvalidUrl;
        break;
      }
    }

    // The server rejects an entry whose required fields are blank, and the
    // message it returns names a field the learner cannot see. Catch it here so
    // they are told which card to fix instead.
    const incomplete =
      experience.some((e) => !e.role.trim() || !e.employer.trim() || !e.start.trim()) ||
      education.some((e) => !e.credential.trim()) ||
      projects.some((e) => !e.name.trim()) ||
      certifications.some((e) => !e.name.trim());
    if (incomplete) next.entries = t.errorEntryRequired;

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
      experience,
      education,
      projects,
      certifications,
      phone: phone.trim() || null,
      city: city.trim() || null,
      // A half-typed link row is dropped rather than failing the save.
      links: links.filter((link) => link.url.trim() && link.label.trim()),
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

      {/* The resume sections. These are what turn a skills blurb into a resume
          an employer can act on, and they are editable by hand so the feature
          works whether or not the learner ran the guided questions. */}
      <div className="mt-10 pt-8 border-t border-border">
        <ResumeSectionEditor<ResumeExperience>
          label={t.sectionExperience}
          addLabel={t.addExperience}
          removeLabel={t.removeEntry}
          emptyLabel={t.emptyList}
          items={experience}
          onChange={setExperience}
          maxEntries={PROFILE_LIMITS.experienceEntries}
          bulletPlaceholder={t.fieldBulletPlaceholder}
          blank={() => ({
            role: '',
            employer: '',
            location: null,
            start: '',
            end: null,
            current: false,
            bullets: [],
          })}
          fields={EXPERIENCE_FIELDS(t)}
          disabled={saving}
        />

        <ResumeSectionEditor<ResumeEducation>
          label={t.sectionEducation}
          addLabel={t.addEducation}
          removeLabel={t.removeEntry}
          emptyLabel={t.emptyList}
          items={education}
          onChange={setEducation}
          maxEntries={PROFILE_LIMITS.educationEntries}
          blank={() => ({
            credential: '',
            institution: null,
            location: null,
            start: null,
            end: null,
            detail: null,
          })}
          fields={EDUCATION_FIELDS(t)}
          disabled={saving}
        />

        <ResumeSectionEditor<ResumeProject>
          label={t.sectionProjects}
          addLabel={t.addProject}
          removeLabel={t.removeEntry}
          emptyLabel={t.emptyList}
          items={projects}
          onChange={setProjects}
          maxEntries={PROFILE_LIMITS.projectEntries}
          blank={() => ({ name: '', detail: null, link: null })}
          fields={PROJECT_FIELDS(t)}
          disabled={saving}
        />

        <ResumeSectionEditor<ResumeCertification>
          label={t.sectionCertifications}
          addLabel={t.addCertification}
          removeLabel={t.removeEntry}
          emptyLabel={t.emptyList}
          items={certifications}
          onChange={setCertifications}
          maxEntries={PROFILE_LIMITS.certificationEntries}
          blank={() => ({ name: '', issuer: null, issued: null })}
          fields={CERTIFICATION_FIELDS(t)}
          disabled={saving}
        />

        <ContactFieldsEditor
          phone={phone}
          city={city}
          links={links}
          onPhoneChange={setPhone}
          onCityChange={setCity}
          onLinksChange={setLinks}
          linkError={errors.links}
          disabled={saving}
        />

        {errors.entries && <p className="mb-4 text-sm text-error">{errors.entries}</p>}
      </div>

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
