# HeyGen Avatar Video Generator

HeyGen APIを使用してアバター動画を自動生成するTypeScriptプログラムです。

## 機能

- 🎭 アバター動画の自動生成
- 🔍 利用可能なアバターと音声の一覧取得
- ⚙️ カスタマイズ可能な音声設定（速度、ピッチ）
- 📐 動画サイズの指定
- 🕒 動画生成の進行状況監視
- 💾 環境変数による設定管理

## インストール

```bash
# プロジェクトをクローン
git clone <repository-url>
cd GenerateHeygenAvaterVideos

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してHeyGen API keyを設定
```

## 設定

1. [HeyGen](https://app.heygen.com/settings?nav=API)でAPI keyを取得
2. `.env`ファイルにAPI keyを設定:

```
HEYGEN_API_KEY=your_heygen_api_key_here
```

## 使用方法

### コマンドライン

```bash
# 利用可能なアバターを表示
npm run dev avatars

# 利用可能な音声を表示
npm run dev voices

# 動画を生成（デフォルトアバター・音声）
npm run dev generate "こんにちは、世界！"

# 特定のアバターと音声で動画を生成
npm run dev generate "Hello, world!" avatar_id voice_id

# 動画のステータスを確認
npm run dev status video_id
```

### プログラムとして使用

```typescript
import { HeyGenClient, VideoGenerator } from './src/index.js';

const client = new HeyGenClient({
  apiKey: process.env.HEYGEN_API_KEY!
});

const generator = new VideoGenerator(client);

// 基本的な動画生成
const result = await generator.generateVideo({
  text: 'こんにちは！AIアバターです。',
  waitForCompletion: true
});

console.log('Video URL:', result.videoUrl);
```

### 高度な使用例

```typescript
// カスタム設定で動画生成
const result = await generator.generateVideo({
  text: 'カスタマイズされた動画です',
  avatarId: 'specific_avatar_id',
  voiceId: 'specific_voice_id',
  voiceSettings: {
    speed: 1.2,
    pitch: 0.9
  },
  dimension: {
    width: 1920,
    height: 1080
  },
  waitForCompletion: true
});
```

### 使用例の実行

```bash
# 基本的な使用例
npm run example basic

# カスタマイズされた例
npm run example custom

# 非同期処理の例
npm run example async
```

## API仕様

### HeyGenClient

HeyGen APIとの通信を管理するクラス。

```typescript
const client = new HeyGenClient({
  apiKey: 'your_api_key',
  baseUrl?: 'https://api.heygen.com' // オプション
});
```

### VideoGenerator

動画生成を簡単に行うためのラッパークラス。

```typescript
const generator = new VideoGenerator(client);

await generator.generateVideo({
  text: string;                    // 必須: 生成するテキスト（最大1500文字）
  avatarId?: string;              // オプション: アバターID
  voiceId?: string;               // オプション: 音声ID
  voiceSettings?: {               // オプション: 音声設定
    speed?: number;               // 再生速度 (0.5-2.0)
    pitch?: number;               // ピッチ (0.5-2.0)
  };
  dimension?: {                   // オプション: 動画サイズ
    width: number;
    height: number;
  };
  background?: string;            // オプション: 背景
  waitForCompletion?: boolean;    // デフォルト: true
  pollInterval?: number;          // デフォルト: 5000ms
  maxWaitTime?: number;           // デフォルト: 300000ms (5分)
});
```

## 制限事項

- テキストは最大1500文字まで
- 無料プランでは720p解像度まで
- 生成された動画URLは7日間で期限切れ
- API使用量に制限あり（プランによる）

## エラーハンドリング

```typescript
try {
  const result = await generator.generateVideo({
    text: 'テストテキスト'
  });
} catch (error) {
  if (error.message.includes('API Error')) {
    // HeyGen APIエラー
    console.error('APIエラー:', error.message);
  } else if (error.message.includes('timeout')) {
    // タイムアウトエラー
    console.error('タイムアウト:', error.message);
  } else {
    // その他のエラー
    console.error('予期しないエラー:', error.message);
  }
}
```

## ライセンス

MIT License

## サポート

- [HeyGen API Documentation](https://docs.heygen.com/)
- [HeyGen API Pricing](https://www.heygen.com/api)

## トラブルシューティング

### よくある問題

1. **API key エラー**
   - `.env`ファイルにAPI keyが正しく設定されているか確認
   - API keyの権限を確認

2. **動画生成タイムアウト**
   - `maxWaitTime`を増やす
   - テキストの長さを短くする

3. **アバター/音声が見つからない**
   - `npm run dev avatars`と`npm run dev voices`で利用可能なIDを確認

4. **依存関係エラー**
   - `npm install`を再実行
   - Node.js バージョンを確認（推奨: Node.js 18以上）