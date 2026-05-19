export interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
}

export interface Video {
  id: number;
  title: string;
  description: string | null;
  uploaded_by: number;
  s3_url: string;
  duration: number | null;
  upload_type: 'file' | 'link';
  compression_status: 'pending' | 'processing' | 'completed' | 'failed';
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed';
  summary_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface Transcription {
  id: number;
  video_id: number;
  transcript_text: string;
  segments: TranscriptSegment[];
  language: string | null;
  created_at: string;
}

export interface Summary {
  id: number;
  video_id: number;
  summary_text: string;
  key_points: string[];
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
