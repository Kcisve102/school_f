import api from './api';
import { Video, Transcription, Summary, ApiResponse } from '../types';

export const videoService = {
  getAll: async (limit: number = 50, offset: number = 0): Promise<Video[]> => {
    const response = await api.get<ApiResponse<Video[]>>(`/videos?limit=${limit}&offset=${offset}`);
    return response.data.data!;
  },

  getPage: async (limit: number, offset: number): Promise<{ videos: Video[]; total: number }> => {
    const response = await api.get<ApiResponse<Video[]>>(`/videos?limit=${limit}&offset=${offset}`);
    return {
      videos: response.data.data!,
      total: response.data.total ?? response.data.data!.length,
    };
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

  uploadVideo: async (formData: FormData, onProgress?: (pct: number) => void): Promise<{ videoId: number }> => {
    const response = await api.post<ApiResponse<{ videoId: number }>>('/admin/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
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

  getPageByCategory: async (
    category: string,
    limit: number,
    offset: number
  ): Promise<{ videos: Video[]; total: number }> => {
    const response = await api.get<ApiResponse<Video[]>>(
      `/videos/category/${encodeURIComponent(category)}?limit=${limit}&offset=${offset}`
    );
    return {
      videos: response.data.data!,
      total: response.data.total ?? response.data.data!.length,
    };
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
