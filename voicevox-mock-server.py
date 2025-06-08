#!/usr/bin/env python3
"""
VoiceVox API Mock Server for Local Mode Testing
DockerコンテナでVoiceVoxのLocal Modeをテストするためのモックサーバー
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import urllib.parse
import struct
import math

class VoiceVoxMockHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """GET リクエストの処理"""
        if self.path == '/version':
            self.send_version_response()
        elif self.path == '/speakers':
            self.send_speakers_response()
        else:
            self.send_404_response()
    
    def do_POST(self):
        """POST リクエストの処理"""
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)
        
        if parsed_path.path == '/audio_query':
            self.send_audio_query_response(query_params)
        elif parsed_path.path == '/synthesis':
            self.send_synthesis_response(query_params)
        else:
            self.send_404_response()
    
    def send_version_response(self):
        """バージョン情報のレスポンス"""
        response = {
            "version": "0.14.0",
            "core_version": "0.14.0"
        }
        self.send_json_response(response)
    
    def send_speakers_response(self):
        """スピーカー情報のレスポンス"""
        response = [
            {
                "name": "ずんだもん",
                "speaker_uuid": "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9",
                "styles": [
                    {
                        "name": "ノーマル",
                        "id": 3,
                        "type": "talk"
                    }
                ]
            }
        ]
        self.send_json_response(response)
    
    def send_audio_query_response(self, query_params):
        """音声クエリのレスポンス"""
        text = query_params.get('text', [''])[0]
        speaker = query_params.get('speaker', ['3'])[0]
        
        print(f"Audio query request: text='{text}', speaker={speaker}")
        
        # モック音声クエリデータ
        response = {
            "accent_phrases": [
                {
                    "moras": [
                        {
                            "text": "テ",
                            "consonant": "t",
                            "consonant_length": 0.1,
                            "vowel": "e",
                            "vowel_length": 0.2,
                            "pitch": 5.0
                        },
                        {
                            "text": "ス",
                            "consonant": "s",
                            "consonant_length": 0.1,
                            "vowel": "u",
                            "vowel_length": 0.2,
                            "pitch": 5.0
                        },
                        {
                            "text": "ト",
                            "consonant": "t",
                            "consonant_length": 0.1,
                            "vowel": "o",
                            "vowel_length": 0.2,
                            "pitch": 5.0
                        }
                    ],
                    "accent": 1,
                    "pause_mora": None
                }
            ],
            "speedScale": 1.0,
            "pitchScale": 0.0,
            "intonationScale": 1.0,
            "volumeScale": 1.0,
            "prePhonemeLength": 0.1,
            "postPhonemeLength": 0.1,
            "outputSamplingRate": 24000,
            "outputStereo": False,
            "kana": "テスト"
        }
        
        self.send_json_response(response)
    
    def send_synthesis_response(self, query_params):
        """音声合成のレスポンス（ダミーWAVファイル）"""
        speaker = query_params.get('speaker', ['3'])[0]
        
        # POSTボディから音声クエリデータを読み取り
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        print(f"Synthesis request: speaker={speaker}")
        print(f"Audio query data received: {post_data.decode('utf-8')[:100]}...")
        
        # ダミーWAVファイルを作成
        wav_data = self.create_dummy_wav()
        
        self.send_response(200)
        self.send_header('Content-Type', 'audio/wav')
        self.send_header('Content-Length', str(len(wav_data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(wav_data)
    
    def create_dummy_wav(self):
        """440Hz（ラ音）のダミーWAVファイルを作成"""
        sample_rate = 24000
        duration = 2  # 2秒
        num_samples = sample_rate * duration
        
        # WAVヘッダー
        header = bytearray()
        header.extend(b'RIFF')
        header.extend(struct.pack('<I', 36 + num_samples * 2))  # ファイルサイズ
        header.extend(b'WAVE')
        header.extend(b'fmt ')
        header.extend(struct.pack('<I', 16))  # フォーマットサイズ
        header.extend(struct.pack('<H', 1))   # PCM
        header.extend(struct.pack('<H', 1))   # モノラル
        header.extend(struct.pack('<I', sample_rate))
        header.extend(struct.pack('<I', sample_rate * 2))  # バイト/秒
        header.extend(struct.pack('<H', 2))   # ブロックアライン
        header.extend(struct.pack('<H', 16))  # ビット/サンプル
        header.extend(b'data')
        header.extend(struct.pack('<I', num_samples * 2))  # データサイズ
        
        # 440Hzのサイン波データ
        audio_data = bytearray()
        for i in range(num_samples):
            sample = math.sin(2 * math.pi * 440 * i / sample_rate) * 0.3
            int_sample = int(sample * 32767)
            audio_data.extend(struct.pack('<h', int_sample))
        
        return header + audio_data
    
    def send_json_response(self, data):
        """JSONレスポンスを送信"""
        response_json = json.dumps(data, ensure_ascii=False)
        response_bytes = response_json.encode('utf-8')
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)
    
    def send_404_response(self):
        """404レスポンスを送信"""
        self.send_response(404)
        self.send_header('Content-Type', 'text/plain')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'Not Found')
    
    def do_OPTIONS(self):
        """OPTIONSリクエストの処理（CORS）"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server():
    """サーバーを起動"""
    server_address = ('', 50021)
    httpd = HTTPServer(server_address, VoiceVoxMockHandler)
    
    print("🎤 VoiceVox Mock Server is running on http://localhost:50021")
    print("Available endpoints:")
    print("  GET  /version")
    print("  GET  /speakers")
    print("  POST /audio_query?text={text}&speaker={speaker_id}")
    print("  POST /synthesis?speaker={speaker_id}")
    print("")
    print("🎯 Ready for ZUNDAMON-X Local Mode testing!")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
