export interface HeyGenConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  preview_image_url?: string;
  gender?: string;
  type?: string;
}

export interface Voice {
  voice_id: string;
  language: string;
  gender: string;
  name: string;
  preview_audio?: string;
  support_pause: boolean;
  emotion_support: boolean;
}

export interface VideoGenerationRequest {
  video_inputs: Array<{
    character: {
      type: 'avatar';
      avatar_id: string;
      avatar_style?: string;
    };
    voice: {
      type: 'text';
      input_text: string;
      voice_id: string;
      speed?: number;
    };
  }>;
  dimension?: {
    width: number;
    height: number;
  };
  background?: string;
}

export interface VideoGenerationResponse {
  code: number;
  data: {
    video_id: string;
  };
  message?: string;
}

export interface VideoStatusResponse {
  code: number;
  data: {
    id: string;
    status: 'pending' | 'processing' | 'waiting' | 'completed' | 'failed';
    video_url?: string;
    thumbnail_url?: string;
    duration?: number;
    error?: {
      code: string;
      message: string;
    };
  };
  message?: string;
}

export interface ListResponse<T> {
  code: number;
  data: {
    data: T[];
    total: number;
  };
  message?: string;
}