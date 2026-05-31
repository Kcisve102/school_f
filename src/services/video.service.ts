import api from './api';
import { Video, Transcription, Summary, ApiResponse } from '../types';

export const videoService = {
  getAll: async (limit: number = 50, offset: number = 0): Promise<Video[]> => {
    const response = await api.get<ApiResponse<Video[]>>(`/videos?limit=${limit}&offset=${offset}`);
    return response.data.data!;
  },

  getById: async (id: number): Promise<Video> => {
    const response = await api.get<ApiResponse<Video>>(`/videos/${id}`);
    return response.data.data!;
  },

  getTranscript: async (id: number): Promise<Transcription> => {
    const response = await api.get<ApiResponse<Transcription>>(`/videos/${id}/transcript`);
    return response.data.data!;
  },

  getSummary: async (id: number): Promise<Summary> => {
    const response = await api.get<ApiResponse<Summary>>(`/videos/${id}/summary`);
    return response.data.data!;
  },

  uploadVideo: async (formData: FormData): Promise<{ videoId: number }> => {
    const response = await api.post<ApiResponse<{ videoId: number }>>('/admin/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  },

  uploadVideoLink: async (url: string, title: string, description?: string, category?: string): Promise<{ videoId: number }> => {
    const response = await api.post<ApiResponse<{ videoId: number }>>('/admin/videos/upload-link', {
      url,
      title,
      description,
      category,
    });
    return response.data.data!;
  },

  deleteVideo: async (id: number): Promise<void> => {
    await api.delete(`/admin/videos/${id}`);
  },

  updateVideo: async (id: number, title: string, description?: string, category?: string): Promise<void> => {
    await api.put(`/admin/videos/${id}`, {
      title,
      description,
      category,
    });
  },

  getByCategory: async (category: string): Promise<Video[]> => {
    const response = await api.get<ApiResponse<Video[]>>(`/videos/category/${encodeURIComponent(category)}`);
    return response.data.data!;
  },

  reRenderTranscript: async (id: number): Promise<void> => {
    await api.post(`/admin/videos/${id}/re-render`);
  },

  getAIStatus: async (videoId: number): Promise<{
    compression_status: string;
    transcription_status: string;
    summary_status: string;
  }> => {
    const response = await api.get<ApiResponse<any>>(`/ai/status/${videoId}`);
    return response.data.data!;
  },
};

export default videoService;
