import { HeyGenClient, VideoGenerator } from '../src/index.js';

async function basicExample() {
  const client = new HeyGenClient({
    apiKey: process.env.HEYGEN_API_KEY!
  });
  
  const generator = new VideoGenerator(client);

  try {
    console.log('基本的な動画生成の例');
    
    const result = await generator.generateVideo({
      text: 'こんにちは！私はAIアバターです。HeyGen APIを使って動画を生成しています。',
      waitForCompletion: true
    });

    console.log('動画生成完了！');
    console.log('Video ID:', result.videoId);
    console.log('Video URL:', result.videoUrl);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

async function customizedExample() {
  const client = new HeyGenClient({
    apiKey: process.env.HEYGEN_API_KEY!
  });
  
  const generator = new VideoGenerator(client);

  try {
    console.log('カスタマイズされた動画生成の例');

    const avatars = await generator.listAvailableAvatars();
    const voices = await generator.listAvailableVoices();
    
    console.log('利用可能なアバター数:', avatars.length);
    console.log('利用可能な音声数:', voices.length);

    const result = await generator.generateVideo({
      text: 'This is a customized video with specific settings for voice and dimensions.',
      avatarId: avatars[0]?.avatar_id,
      voiceId: voices[0]?.voice_id,
      voiceSettings: {
        speed: 1.1,
        pitch: 0.95
      },
      dimension: {
        width: 1920,
        height: 1080
      },
      waitForCompletion: true
    });

    console.log('カスタマイズされた動画生成完了！');
    console.log('Video ID:', result.videoId);
    console.log('Video URL:', result.videoUrl);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

async function asyncExample() {
  const client = new HeyGenClient({
    apiKey: process.env.HEYGEN_API_KEY!
  });
  
  const generator = new VideoGenerator(client);

  try {
    console.log('非同期動画生成の例');

    const result = await generator.generateVideo({
      text: 'This video will be generated asynchronously.',
      waitForCompletion: false
    });

    console.log('動画生成を開始しました');
    console.log('Video ID:', result.videoId);

    console.log('動画の完成を待っています...');
    const videoUrl = await generator.waitForVideo(result.videoId);
    
    console.log('動画生成完了！');
    console.log('Video URL:', videoUrl);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const example = process.argv[2] || 'basic';
  
  switch (example) {
    case 'basic':
      basicExample();
      break;
    case 'custom':
      customizedExample();
      break;
    case 'async':
      asyncExample();
      break;
    default:
      console.log('使用例:');
      console.log('  npm run example basic   - 基本的な使用例');
      console.log('  npm run example custom  - カスタマイズされた例');
      console.log('  npm run example async   - 非同期処理の例');
  }
}