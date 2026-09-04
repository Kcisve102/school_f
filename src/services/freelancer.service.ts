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
  searchProjects: async (query: string, limit = 10): Promise<FreelancerProject[]> => {
    const response = await api.get<ApiResponse<{ result?: { projects?: FreelancerProject[] } }>>(
      '/freelancer/projects',
      { params: { q: query, limit } }
    );
    return response.data.data?.result?.projects ?? [];
  },
};

export default freelancerService;
