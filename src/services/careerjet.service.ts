import api from './api';
import { ApiResponse } from '../types';

/**
 * Careerjet aggregates ~90 country job sites. There is nothing for a learner
 * to connect: one publisher key serves every search, so these are employed-job
 * listings a learner can read before signing up anywhere.
 */

export interface CareerjetJob {
  title: string;
  company: string | null;
  locations: string | null;
  description: string | null;
  /** Careerjet's tracked redirect. Link straight to it; never rewrite it. */
  url: string;
  postedAt: number | null;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  /** Y yearly · M monthly · W weekly · D daily · H hourly. */
  salaryPeriod: 'Y' | 'M' | 'W' | 'D' | 'H' | null;
}

export interface CareerjetSearchResult {
  jobs: CareerjetJob[];
  count: number;
  /** Careerjet could not resolve the location and searched nothing. */
  locationSuggestions?: string[];
}

export interface CareerjetSearchParams {
  location?: string;
  locale?: string;
  contractType?: string;
  workHours?: string;
  limit?: number;
}

export const careerjetService = {
  searchJobs: async (
    query: string,
    params: CareerjetSearchParams = {}
  ): Promise<CareerjetSearchResult> => {
    const response = await api.get<ApiResponse<CareerjetSearchResult>>('/careerjet/search', {
      params: { q: query, ...params },
    });
    return response.data.data ?? { jobs: [], count: 0 };
  },
};

export default careerjetService;
