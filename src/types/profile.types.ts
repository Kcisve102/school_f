/**
 * The learner's skills profile. It lives entirely on our side: no job board
 * exposes a profile-write API, so the handoff to a destination is a clipboard
 * copy plus a redirect the learner completes themselves.
 */
export interface CareerProfile {
  id: number;
  user_id: number;
  headline: string;
  summary: string;
  skills: string[];
  job_titles: string[];
  /**
   * Resume sections the learner supplied themselves. Empty for a profile made
   * before the intake existed, or for a learner who chose not to answer — the
   * resume renders without any of them.
   */
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  phone: string | null;
  city: string | null;
  links: ProfileLink[];
  /** Null once the source video or attempt is deleted (ON DELETE SET NULL). */
  source_video_id: number | null;
  source_attempt_id: number | null;
  generated_language: string;
  is_edited: boolean;
  /**
   * The last destination the learner clicked through to, and when. This means a
   * handoff was *initiated* — nothing more. No job board calls back, so we can
   * never know whether an account was created. Do not render this as
   * "connected", a checkmark, or a completed publish.
   */
  last_handoff_platform: string | null;
  last_handoff_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * A freshly generated draft, before the learner has edited or saved it.
 *
 * Deliberately camelCase and deliberately not a `CareerProfile`: the draft
 * endpoint does not persist anything, so there is no row, no id, and no
 * timestamps. Keeping the two shapes distinct is what stops a draft being
 * mistaken for a saved profile.
 */
export interface CareerProfileDraft {
  headline: string;
  summary: string;
  skills: string[];
  jobTitles: string[];
  sourceVideoId: number | null;
  sourceAttemptId: number | null;
  generatedLanguage: string;
}

/** The request body for PUT /profile. */
export interface CareerProfileSaveInput {
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
  sourceVideoId?: number | null;
  sourceAttemptId?: number | null;
}

export type HandoffPlatform = 'indeed' | 'ziprecruiter' | 'glassdoor' | 'dice';

/**
 * Server-side validation limits, mirrored here so the form can show a counter
 * and block an over-length save before it round-trips. The server enforces
 * these independently; these copies are an affordance, not the gate.
 */
export const PROFILE_LIMITS = {
  headline: 255,
  summary: 5000,
  listItems: 30,
  listItemLength: 100,
  entryField: 150,
  dateText: 40,
  detail: 500,
  bullets: 6,
  bulletLength: 300,
  experienceEntries: 10,
  educationEntries: 6,
  projectEntries: 8,
  certificationEntries: 10,
  phone: 40,
  city: 120,
  links: 5,
  linkLabel: 40,
  linkUrl: 300,
  targetRole: 120,
  intakeAnswer: 1500,
} as const;

/**
 * The quiz score at or above which a learner may create a career profile.
 * Mirrors CAREER_PROFILE_THRESHOLD in the backend controller, which is
 * authoritative — this copy only decides whether the UI offers the option.
 */
export const CAREER_PROFILE_THRESHOLD = 80;

/**
 * The structured resume sections, all supplied by the learner.
 *
 * Nothing here may be generated from thin air: the AI's role is to split what
 * the learner typed into fields and tidy the wording, never to add a fact. See
 * gemini-intake.service.ts on the backend for the contract.
 *
 * Dates are free text ("summer 2022", "March 2021"), never Date objects — a
 * learner's real answer rarely survives being forced into a date picker.
 */
export interface ResumeExperience {
  role: string;
  employer: string;
  location: string | null;
  start: string;
  /** Null when the role is ongoing, or when the learner did not say. */
  end: string | null;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  credential: string;
  /** Null when the learner named a qualification but not where they earned it. */
  institution: string | null;
  location: string | null;
  start: string | null;
  end: string | null;
  detail: string | null;
}

export interface ResumeProject {
  name: string;
  detail: string | null;
  link: string | null;
}

export interface ResumeCertification {
  name: string;
  issuer: string | null;
  issued: string | null;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export type IntakeSection =
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'contact';

/**
 * One question in the adaptive intake. Written by Gemini for the learner's
 * chosen target role, and rendered verbatim — in English, like the resume
 * itself, for the reason the profile's englishNotice already explains.
 */
export interface IntakeQuestion {
  id: string;
  section: IntakeSection;
  prompt: string;
  helper: string;
  placeholder: string;
  /** A usable resume is still possible without this, so Skip is offered. */
  optional: boolean;
}

export interface IntakeAnswer {
  id: string;
  section: IntakeSection;
  prompt: string;
  answer: string;
}

export interface IntakePlan {
  targetRole: string;
  questions: IntakeQuestion[];
}

/**
 * What the structuring call returns: a whole profile shape, so the review step
 * can hand it straight to the existing save path. Nothing is persisted until
 * the learner saves.
 */
export interface IntakeDraft {
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  phone: string | null;
  city: string | null;
  links: ProfileLink[];
  headline: string;
  summary: string;
  skills: string[];
  jobTitles: string[];
}
