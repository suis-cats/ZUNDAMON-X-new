const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 50021;

// CORS設定 - Chrome拡張機能対応
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: false
}));

// Preflight requests対応
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
  res.sendStatus(200);
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// VoiceVox APIエンドポイントのモック

// バージョン情報
app.get('/version', (req, res) => {
  res.json({
    version: "0.14.0",
    core_version: "0.14.0"
  });
});

// スピーカー情報
app.get('/speakers', (req, res) => {
  res.json([
    {
      name: "ずんだもん",
      speaker_uuid: "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9",
      styles: [
        {
          name: "ノーマル",
          id: 3,
          type: "talk"
        }
      ]
    }
  ]);
});

// 音声クエリ作成
app.post('/audio_query', (req, res) => {
  const { text, speaker } = req.query;
  
  console.log(`Audio query request: text="${text}", speaker=${speaker}`);
  
  // モック音声クエリデータ
  const audioQuery = {
    accent_phrases: [
      {
        moras: [
          {
            text: "テ",
            consonant: "t",
            consonant_length: 0.1,
            vowel: "e",
            vowel_length: 0.2,
            pitch: 5.0
          },
          {
            text: "ス",
            consonant: "s",
            consonant_length: 0.1,
            vowel: "u",
            vowel_length: 0.2,
            pitch: 5.0
          },
          {
            text: "ト",
            consonant: "t",
            consonant_length: 0.1,
            vowel: "o",
            vowel_length: 0.2,
            pitch: 5.0
          }
        ],
        accent: 1,
        pause_mora: null
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
    kana: "テスト"
  };
  
  res.json(audioQuery);
});

// 音声合成
app.post('/synthesis', (req, res) => {
  const { speaker } = req.query;
  const audioQuery = req.body;
  
  console.log(`Synthesis request: speaker=${speaker}`);
  console.log('Audio query data received:', JSON.stringify(audioQuery, null, 2));
  
  // ダミーWAVファイルを作成
  const createDummyWav = () => {
    const sampleRate = 24000;
    const duration = 2; // 2秒
    const numSamples = sampleRate * duration;
    const numChannels = 1;
    const bytesPerSample = 2;
    
    const headerSize = 44;
    const dataSize = numSamples * numChannels * bytesPerSample;
    const fileSize = headerSize + dataSize - 8;
    
    const buffer = Buffer.alloc(headerSize + dataSize);
    
    // WAVヘッダー
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // PCMフォーマットサイズ
    buffer.writeUInt16LE(1, 20);  // PCMフォーマット
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
    buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
    buffer.writeUInt16LE(bytesPerSample * 8, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // 440Hz（ラ音）のサイン波を生成
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3;
      const intSample = Math.round(sample * 32767);
      buffer.writeInt16LE(intSample, headerSize + i * 2);
    }
    
    return buffer;
  };
  
  const wavData = createDummyWav();
  
  res.setHeader('Content-Type', 'audio/wav');
  res.setHeader('Content-Length', wavData.length);
  res.send(wavData);
});

app.listen(PORT, () => {
  console.log(`🎤 VoiceVox Mock Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /version');
  console.log('  GET  /speakers'); 
  console.log('  POST /audio_query?text={text}&speaker={speaker_id}');
  console.log('  POST /synthesis?speaker={speaker_id}');
  console.log('');
  console.log('🎯 Ready for ZUNDAMON-X Local Mode testing!');
});
