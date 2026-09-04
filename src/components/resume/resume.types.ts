/**
 * Everything a resume layout needs to render. Assembled by ResumePanel from
 * the saved profile plus the signed-in user, so the layouts stay presentational
 * and know nothing about the API.
 */
export interface ResumeData {
  fullName: string;
  email: string;
  headline: string;
  summary: string;
  skills: string[];
  jobTitles: string[];
}

export interface ResumeLabels {
  contactEmail: string;
  sectionSummary: string;
  sectionSkills: string;
  sectionTargets: string;
}

export interface ResumeLayoutProps {
  data: ResumeData;
  labels: ResumeLabels;
}

export type ResumeLayoutId = 'classic' | 'sidebar' | 'compact';

export const RESUME_LAYOUT_IDS: readonly ResumeLayoutId[] = ['classic', 'sidebar', 'compact'];
