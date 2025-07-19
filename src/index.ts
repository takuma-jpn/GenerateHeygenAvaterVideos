import dotenv from 'dotenv';
import { HeyGenClient } from './heygen-client.js';
import { VideoGenerator } from './video-generator.js';

dotenv.config();

export { HeyGenClient, VideoGenerator };
export * from './types.js';

async function main() {
  const apiKey = process.env.HEYGEN_API_KEY;
  
  if (!apiKey) {
    console.error('Error: HEYGEN_API_KEY environment variable is required');
    console.error('Please create a .env file with your HeyGen API key:');
    console.error('HEYGEN_API_KEY=your_api_key_here');
    process.exit(1);
  }

  try {
    const client = new HeyGenClient({ apiKey });
    const generator = new VideoGenerator(client);

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'avatars':
        console.log('Fetching available avatars...');
        const avatars = await generator.listAvailableAvatars();
        console.log('\nAvailable Avatars:');
        avatars.forEach(avatar => {
          console.log(`- ${avatar.avatar_name} (ID: ${avatar.avatar_id})`);
        });
        break;

      case 'voices':
        console.log('Fetching available voices...');
        const voices = await generator.listAvailableVoices();
        console.log('\nAvailable Voices:');
        voices.forEach(voice => {
          console.log(`- ${voice.name} (${voice.language}, ID: ${voice.voice_id})`);
        });
        break;

      case 'generate':
        const text = args[1];
        if (!text) {
          console.error('Error: Text is required for video generation');
          console.error('Usage: npm run dev generate "Your text here"');
          process.exit(1);
        }

        const avatarId = args[2];
        const voiceId = args[3];

        console.log(`Generating video with text: "${text}"`);
        const result = await generator.generateVideo({
          text,
          avatarId,
          voiceId,
          waitForCompletion: true
        });

        console.log(`\nVideo generated successfully!`);
        console.log(`Video ID: ${result.videoId}`);
        if (result.videoUrl) {
          console.log(`Video URL: ${result.videoUrl}`);
          console.log('Note: Video URL expires in 7 days');
        }
        break;

      case 'status':
        const videoId = args[1];
        if (!videoId) {
          console.error('Error: Video ID is required');
          console.error('Usage: npm run dev status <video_id>');
          process.exit(1);
        }

        const status = await generator.getVideoStatus(videoId);
        console.log(`Video Status: ${status.status}`);
        if (status.video_url) {
          console.log(`Video URL: ${status.video_url}`);
        }
        if (status.error) {
          console.log(`Error: ${status.error.message}`);
        }
        break;

      default:
        console.log('HeyGen Avatar Video Generator');
        console.log('\nUsage:');
        console.log('  npm run dev avatars                           - List available avatars');
        console.log('  npm run dev voices                            - List available voices');
        console.log('  npm run dev generate "text" [avatar] [voice]  - Generate video');
        console.log('  npm run dev status <video_id>                 - Check video status');
        console.log('\nExamples:');
        console.log('  npm run dev generate "Hello, world!"');
        console.log('  npm run dev generate "Hello, world!" avatar_id voice_id');
        break;
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}