import {
  ProfileLink,
  ResumeCertification,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
} from '../../types';

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
  /**
   * Everything below is optional and learner-supplied. A profile made before
   * the resume intake existed has none of it, and every layout renders each
   * section only when it holds something — so an untouched profile prints
   * exactly as it always did.
   */
  phone?: string | null;
  city?: string | null;
  links?: ProfileLink[];
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
}

export interface ResumeLabels {
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  sectionSummary: string;
  sectionSkills: string;
  sectionTargets: string;
  sectionExperience: string;
  sectionEducation: string;
  sectionProjects: string;
  sectionCertifications: string;
  /** Shown in place of an end date for a role the learner still holds. */
  present: string;
}

export interface ResumeLayoutProps {
  data: ResumeData;
  labels: ResumeLabels;
}

export type ResumeLayoutId = 'classic' | 'sidebar' | 'compact';

export const RESUME_LAYOUT_IDS: readonly ResumeLayoutId[] = ['classic', 'sidebar', 'compact'];
