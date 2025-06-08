const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 50022; // 異なるポートを使用

// より詳細なCORSの設定
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

// プリフライトリクエストの明示的な処理
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.sendStatus(200);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// すべてのレスポンスにCORSヘッダーを追加
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  next();
});

// バージョン情報
app.get('/version', (req, res) => {
  console.log('GET /version - External server');
  res.json({
    version: "0.14.0",
    core_version: "0.14.0"
  });
});

// 話者一覧
app.get('/speakers', (req, res) => {
  console.log('GET /speakers - External server');
  res.json([
    {
      "name": "ずんだもん",
      "speaker_uuid": "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9",
      "styles": [
        { "name": "ノーマル", "id": 3 },
        { "name": "あまあま", "id": 1 },
        { "name": "つよがり", "id": 7 },
        { "name": "セクシー", "id": 5 }
      ],
      "version": "0.0.1"
    }
  ]);
});

// 音声合成クエリ（GETメソッド、クエリパラメータ使用）
app.get('/audio_query', (req, res) => {
  const { text, speaker } = req.query;
  console.log(`GET /audio_query - External server - text: ${text}, speaker: ${speaker}`);
  
  if (!text || !speaker) {
    return res.status(400).json({ error: 'text and speaker are required' });
  }

  res.json({
    accent_phrases: [
      {
        moras: [
          { text: "テ", vowel: "e", vowel_length: 0.1, pitch: 5.0 },
          { text: "ス", vowel: "u", vowel_length: 0.1, pitch: 5.0 },
          { text: "ト", vowel: "o", vowel_length: 0.1, pitch: 5.0 }
        ],
        accent: 1,
        pause_mora: { text: "、", vowel: "", vowel_length: 0.2, pitch: 0.0 }
      }
    ],
    speedScale: 1.0,
    pitchScale: 0.0,
    intonationScale: 1.0,
    volumeScale: 1.0,
    prePhonemeLength: 0.1,
    postPhonemeLength: 0.1,
    outputSamplingRate: 24000,
    outputStereo: false,
    kana: text
  });
});

// 音声合成
app.post('/synthesis', (req, res) => {
  const { speaker } = req.query;
  console.log(`POST /synthesis - External server - speaker: ${speaker}`);
  console.log('Request body:', req.body);
  
  if (!speaker) {
    return res.status(400).json({ error: 'speaker parameter is required' });
  }

  // シンプルなWAVファイルのバイナリデータ（実際の音声ではなくテスト用）
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x26, 0x00, 0x00, 0x00, // ファイルサイズ
    0x57, 0x41, 0x56, 0x45, // WAVE
    0x66, 0x6d, 0x74, 0x20, // fmt 
    0x10, 0x00, 0x00, 0x00, // フォーマットチャンクサイズ
    0x01, 0x00, 0x01, 0x00, // PCM, モノラル
    0x40, 0x1f, 0x00, 0x00, // サンプリングレート 8000Hz
    0x40, 0x1f, 0x00, 0x00, // バイトレート
    0x01, 0x00, 0x08, 0x00, // ブロックアライン、ビット深度
    0x64, 0x61, 0x74, 0x61, // data
    0x02, 0x00, 0x00, 0x00, // データサイズ
    0x00, 0x00              // 実際のデータ（無音）
  ]);

  res.set({
    'Content-Type': 'audio/wav',
    'Content-Length': wavHeader.length
  });
  
  res.send(wavHeader);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`External VoiceVox mock server running on http://0.0.0.0:${PORT}`);
  console.log('This server is accessible from external Chrome browsers');
});
