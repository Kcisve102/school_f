import api from './api';
import {
  ApiResponse,
  CareerProfile,
  CareerProfileDraft,
  CareerProfileSaveInput,
  HandoffPlatform,
  IntakeAnswer,
  IntakeDraft,
  IntakePlan,
} from '../types';

export const profileService = {
  /**
   * Returns null when the learner has no profile yet. That is a normal first
   * visit, not an error — the server answers 200 with a null body rather than
   * 404 precisely so this does not have to be caught.
   */
  getProfile: async (): Promise<CareerProfile | null> => {
    const response = await api.get<ApiResponse<CareerProfile | null>>('/profile');
    return response.data.data ?? null;
  },

  /**
   * Generates a draft from a passing quiz attempt. Nothing is persisted — the
   * learner reviews and saves it themselves, so an abandoned draft leaves no
   * trace and a regeneration cannot silently overwrite edited text.
   */
  generateDraft: async (attemptId: number): Promise<CareerProfileDraft> => {
    const response = await api.post<ApiResponse<CareerProfileDraft>>('/profile/draft', {
      attemptId,
    });
    return response.data.data!;
  },

  saveProfile: async (input: CareerProfileSaveInput): Promise<CareerProfile> => {
    const response = await api.put<ApiResponse<CareerProfile>>('/profile', input);
    return response.data.data!;
  },

  /**
   * Asks the server which questions this learner still needs to answer for a
   * given target role. Nothing is persisted; the questions are chosen against
   * the saved profile, so a profile must exist first.
   */
  planIntake: async (targetRole: string): Promise<IntakePlan> => {
    const response = await api.post<ApiResponse<IntakePlan>>('/profile/intake/questions', {
      targetRole,
    });
    return response.data.data!;
  },

  /**
   * Turns the learner's answers into structured resume sections.
   *
   * Like generateDraft, this persists nothing: the result is shown for review
   * and correction first. That review is the last check on the model before
   * anything reaches the learner's resume, so it must not be skipped.
   */
  draftFromIntake: async (targetRole: string, answers: IntakeAnswer[]): Promise<IntakeDraft> => {
    const response = await api.post<ApiResponse<IntakeDraft>>('/profile/intake/draft', {
      targetRole,
      answers,
    });
    return response.data.data!;
  },

  /**
   * Records that the learner clicked through to a destination's signup page.
   * This is a click-through, never a registration: no job board tells us
   * whether the learner finished, so nothing may present it as success.
   */
  recordHandoff: async (platform: HandoffPlatform): Promise<void> => {
    await api.post<ApiResponse>('/profile/handoff', { platform });
  },
};

export default profileService;
