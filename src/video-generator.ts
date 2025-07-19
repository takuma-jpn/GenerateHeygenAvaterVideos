import { HeyGenClient } from './heygen-client.js';
import { VideoGenerationRequest, Avatar, Voice } from './types.js';

export interface VideoGeneratorOptions {
  text: string;
  avatarId?: string;
  voiceId?: string;
  voiceSettings?: {
    speed?: number;
  };
  dimension?: {
    width: number;
    height: number;
  };
  background?: string;
  waitForCompletion?: boolean;
  pollInterval?: number;
  maxWaitTime?: number;
}

export class VideoGenerator {
  private client: HeyGenClient;

  constructor(client: HeyGenClient) {
    this.client = client;
  }

  async generateVideo(options: VideoGeneratorOptions): Promise<{ videoId: string; videoUrl?: string }> {
    let avatarId = options.avatarId;
    let voiceId = options.voiceId;

    if (!avatarId) {
      const avatars = await this.client.listAvatars();
      if (avatars.length === 0) {
        throw new Error('No avatars available');
      }
      avatarId = avatars[0].avatar_id;
      console.log(`Using default avatar: ${avatars[0].avatar_name} (${avatarId})`);
    }

    if (!voiceId) {
      const voices = await this.client.listVoices();
      if (voices.length === 0) {
        throw new Error('No voices available');
      }
      const englishVoices = voices.filter(v => v.language.toLowerCase().includes('english'));
      voiceId = englishVoices.length > 0 ? englishVoices[0].voice_id : voices[0].voice_id;
      const selectedVoice = voices.find(v => v.voice_id === voiceId);
      console.log(`Using default voice: ${selectedVoice?.name} (${voiceId})`);
    }

    const request: VideoGenerationRequest = {
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: options.text,
          voice_id: voiceId,
          speed: options.voiceSettings?.speed
        }
      }],
      dimension: options.dimension || { width: 1280, height: 720 },
      background: options.background
    };

    console.log('Generating video...');
    const videoId = await this.client.generateVideo(request);
    console.log(`Video generation started. Video ID: ${videoId}`);

    if (options.waitForCompletion !== false) {
      console.log('Waiting for video completion...');
      const videoUrl = await this.client.waitForVideoCompletion(
        videoId,
        options.pollInterval || 5000,
        options.maxWaitTime || 300000
      );
      console.log(`Video completed! URL: ${videoUrl}`);
      return { videoId, videoUrl };
    }

    return { videoId };
  }

  async listAvailableAvatars(): Promise<Avatar[]> {
    return await this.client.listAvatars();
  }

  async listAvailableVoices(): Promise<Voice[]> {
    return await this.client.listVoices();
  }

  async getVideoStatus(videoId: string) {
    return await this.client.getVideoStatus(videoId);
  }

  async waitForVideo(videoId: string, pollInterval: number = 5000, maxWaitTime: number = 300000): Promise<string> {
    return await this.client.waitForVideoCompletion(videoId, pollInterval, maxWaitTime);
  }
}