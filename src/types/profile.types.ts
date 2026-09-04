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
} as const;

/**
 * The quiz score at or above which a learner may create a career profile.
 * Mirrors CAREER_PROFILE_THRESHOLD in the backend controller, which is
 * authoritative — this copy only decides whether the UI offers the option.
 */
export const CAREER_PROFILE_THRESHOLD = 80;
