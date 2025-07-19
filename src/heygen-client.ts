import axios, { AxiosInstance } from 'axios';
import {
  HeyGenConfig,
  Avatar,
  Voice,
  VideoGenerationRequest,
  VideoGenerationResponse,
  VideoStatusResponse,
  ListResponse
} from './types.js';

export class HeyGenClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: HeyGenConfig) {
    this.apiKey = config.apiKey;
    
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.heygen.com',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async listAvatars(): Promise<Avatar[]> {
    try {
      const response = await this.client.get('/v2/avatars');
      
      // HeyGen API v2 returns avatars in data.avatars structure
      if (response.data && response.data.data && response.data.data.avatars) {
        return response.data.data.avatars.map((avatar: any) => ({
          avatar_id: avatar.avatar_id,
          avatar_name: avatar.avatar_name,
          preview_image_url: avatar.preview_image_url,
          gender: avatar.gender,
          type: avatar.premium ? 'premium' : 'standard'
        }));
      }
      
      throw new Error('Invalid response format from avatars API');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch avatars (${status}): ${message}`);
      }
      throw error;
    }
  }

  async listVoices(): Promise<Voice[]> {
    try {
      const response = await this.client.get('/v2/voices');
      
      console.log('Voices API Response:', JSON.stringify(response.data, null, 2));
      
      // HeyGen API v2 returns voices in data.voices structure
      if (response.data && response.data.data && response.data.data.voices) {
        return response.data.data.voices.map((voice: any) => ({
          voice_id: voice.voice_id,
          language: voice.language,
          gender: voice.gender,
          name: voice.name,
          preview_audio: voice.preview_audio,
          support_pause: voice.support_pause || false,
          emotion_support: voice.emotion_support || false
        }));
      }
      
      throw new Error('Invalid response format from voices API');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        console.log('Voice Error response:', error.response?.data);
        throw new Error(`Failed to fetch voices (${status}): ${message}`);
      }
      throw error;
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<string> {
    try {
      if (!request.video_inputs || request.video_inputs.length === 0) {
        throw new Error('Video inputs must be provided');
      }

      const inputText = request.video_inputs[0].voice.input_text;
      if (!inputText || inputText.length > 1500) {
        throw new Error('Input text must be provided and cannot exceed 1500 characters');
      }

      console.log('Video generation request:', JSON.stringify(request, null, 2));

      const response = await this.client.post('/v2/video/generate', request);
      
      console.log('Video generation response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.data && response.data.data.video_id) {
        return response.data.data.video_id;
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(response.data)}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        console.log('Video generation error response:', error.response?.data);
        throw new Error(`Failed to generate video (${status}): ${message}`);
      }
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoStatusResponse['data']> {
    try {
      const response = await this.client.get<VideoStatusResponse>(`/v1/video_status.get?video_id=${videoId}`);
      
      if (response.data.code !== 100) {
        throw new Error(`API Error: ${response.data.message || 'Unknown error'}`);
      }
      
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get video status: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async waitForVideoCompletion(videoId: string, pollInterval: number = 5000, maxWaitTime: number = 300000): Promise<string> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getVideoStatus(videoId);
      
      if (status.status === 'completed') {
        if (!status.video_url) {
          throw new Error('Video completed but no URL provided');
        }
        return status.video_url;
      }
      
      if (status.status === 'failed') {
        const errorMessage = status.error?.message || 'Video generation failed';
        throw new Error(`Video generation failed: ${errorMessage}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Video generation timed out after ${maxWaitTime / 1000} seconds`);
  }
}