// VoiceVox CORS対応のためのプロキシサーバー
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 50022; // VoiceVoxのプロキシ用ポート

// CORS設定
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// VoiceVoxサーバーへのプロキシ
app.use('/', createProxyMiddleware({
  target: 'http://host.docker.internal:50021',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to VoiceVox`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}));

app.listen(PORT, () => {
  console.log(`🔗 VoiceVox CORS Proxy running on http://localhost:${PORT}`);
  console.log('This proxy forwards requests to http://host.docker.internal:50021');
  console.log('Use this endpoint in ZUNDAMON-X: http://localhost:50022');
});
