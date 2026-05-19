import api from './api';
import { Video, Transcription, Summary, ApiResponse } from '../types';

// Mock videos for development when API is unavailable
const MOCK_VIDEOS: Video[] = [
  {
    id: 1,
    title: 'Industrial Safety Fundamentals',
    description: 'Learn essential safety protocols for factory environments including PPE usage and hazard identification.',
    s3_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop',
    category: 'Safety',
    duration: 485,
    compression_status: 'completed',
    transcription_status: 'completed',
    summary_status: 'completed',
    created_at: '2026-03-18T10:00:00Z',
    uploaded_by: 1,
    upload_type: 'file',
  },
  {
    id: 2,
    title: 'CNC Machine Operation Basics',
    description: 'Master the fundamentals of CNC machining including setup, tooling, and basic G-code programming.',
    s3_url: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=450&fit=crop',
    category: 'Factory',
    duration: 720,
    compression_status: 'completed',
    transcription_status: 'completed',
    summary_status: 'completed',
    created_at: '2026-03-17T14:30:00Z',
    uploaded_by: 1,
    upload_type: 'file',
  },
  {
    id: 3,
    title: 'Welding Techniques for Beginners',
    description: 'Introduction to MIG and TIG welding with practical demonstrations and safety guidelines.',
    s3_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=450&fit=crop',
    category: 'Factory',
    duration: 650,
    compression_status: 'completed',
    transcription_status: 'completed',
    summary_status: 'completed',
    created_at: '2026-03-16T09:15:00Z',
    uploaded_by: 1,
    upload_type: 'file',
  },
  {
    id: 4,
    title: 'Factory Communication: Mandarin',
    description: 'Essential Mandarin phrases for factory floor communication and team coordination.',
    s3_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop',
    category: 'Language',
    duration: 420,
    compression_status: 'completed',
    transcription_status: 'completed',
    summary_status: 'completed',
    created_at: '2026-03-15T11:00:00Z',
    uploaded_by: 1,
    upload_type: 'file',
  },
];

export const videoService = {
  getAll: async (limit: number = 50, offset: number = 0): Promise<Video[]> => {
    try {
      const response = await api.get<ApiResponse<Video[]>>(`/videos?limit=${limit}&offset=${offset}`);
      const videos = response.data.data!;
      // Return mock videos if API returns empty array
      return videos.length > 0 ? videos : MOCK_VIDEOS;
    } catch (error) {
      console.warn('API failed, using mock videos:', error);
      return MOCK_VIDEOS;
    }
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
