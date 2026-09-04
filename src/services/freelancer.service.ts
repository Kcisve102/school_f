import api from './api';
import { ApiResponse } from '../types';
import { API_BASE_URL } from '../config/BaseUrl';

/**
 * Freelancer.com is the one destination that is a real connection rather than
 * a click-through. The learner creates their own account on freelancer.com,
 * then authorises Knowverd through OAuth — and their callback tells us it
 * actually happened, which no other job board does.
 */

export interface FreelancerStatus {
  connected: boolean;
  freelancerUserId?: number | null;
  freelancerUsername?: string | null;
  scope?: string | null;
  expiresAt?: string | null;
  connectedAt?: string | null;
}

export interface FreelancerEmployer {
  id?: number;
  username?: string;
  display_name?: string;
  registration_date?: number;
  country?: { name?: string; flag_url_cdn?: string } | null;
  employer_reputation?: {
    entire_history?: {
      overall?: number;
      reviews?: number;
      complete?: number;
    };
  } | null;
}

export interface FreelancerProject {
  id: number;
  title: string;
  preview_description?: string;
  description?: string;
  type?: string;
  currency?: { code?: string };
  budget?: { minimum?: number; maximum?: number };
  bid_stats?: { bid_count?: number; bid_avg?: number };
  jobs?: { id: number; name: string }[];
  seo_url?: string;
  status?: string;
  frontend_project_status?: string;
  bidperiod?: number;
  time_submitted?: number;
  submitdate?: number;
  owner_id?: number | null;
  language?: string;
  upgrades?: Record<string, boolean | null>;
}

export interface FreelancerProjectDetail {
  project: FreelancerProject;
  employer: FreelancerEmployer | null;
}

export const freelancerService = {
  getStatus: async (): Promise<FreelancerStatus> => {
    const response = await api.get<ApiResponse<FreelancerStatus>>('/freelancer/status');
    return response.data.data!;
  },

  /**
   * Full page navigation, not an XHR: the browser must follow the redirect to
   * freelancer.com's consent screen, and the session cookie has to travel with
   * it so the callback can tie the authorisation back to this learner.
   */
  startConnect: (): void => {
    window.location.href = `${API_BASE_URL}/freelancer/connect`;
  },

  disconnect: async (): Promise<void> => {
    await api.post<ApiResponse>('/freelancer/disconnect');
  },

  /**
   * Live projects matching a search term. Keywords come from the generated job
   * suggestions, which stay in English on purpose so they match how clients
   * write their listings.
   */
  /**
   * One job in full. Public: reading a listing needs no Freelancer.com account,
   * so a learner can explore work in their own language before signing up.
   */
  getProject: async (id: number): Promise<FreelancerProjectDetail> => {
    const response = await api.get<ApiResponse<FreelancerProjectDetail>>(
      `/freelancer/projects/${id}`
    );
    return response.data.data!;
  },

  /**
   * Real jobs matching the learner's skills, filtered on Freelancer's skill
   * taxonomy rather than a text query — a text search for "Video Editing"
   * returns finance and automation work, because it matches anywhere in the
   * description.
   *
   * `skills` is optional: omitted, the server uses the learner's career
   * profile; passed, it matches one quiz attempt instead.
   */
  getRecommended: async (
    skills?: string[],
    limit = 12
  ): Promise<{ projects: FreelancerProject[]; matchedSkills: string[] }> => {
    const response = await api.get<
      ApiResponse<{ projects: FreelancerProject[]; matchedSkills: string[] }>
    >('/freelancer/recommended', {
      params: { limit, ...(skills?.length ? { skills: skills.join(',') } : {}) },
    });
    return response.data.data ?? { projects: [], matchedSkills: [] };
  },

  /** Project search that works whether or not an account is connected. */
  browseProjects: async (query: string, limit = 10): Promise<FreelancerProject[]> => {
    const response = await api.get<ApiResponse<{ result?: { projects?: FreelancerProject[] } }>>(
      '/freelancer/browse',
      { params: { q: query, limit } }
    );
    return response.data.data?.result?.projects ?? [];
  },

  searchProjects: async (query: string, limit = 10): Promise<FreelancerProject[]> => {
    const response = await api.get<ApiResponse<{ result?: { projects?: FreelancerProject[] } }>>(
      '/freelancer/projects',
      { params: { q: query, limit } }
    );
    return response.data.data?.result?.projects ?? [];
  },
};

export default freelancerService;