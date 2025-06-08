import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { voiceVoxLocalModeState, voiceVoxLocalEndpointState } from '../atom';

const VoiceVoxSettings = () => {
  const [isLocalMode, setIsLocalMode] = useRecoilState(voiceVoxLocalModeState);
  const [localEndpoint, setLocalEndpoint] = useRecoilState(voiceVoxLocalEndpointState);
  const [testMessage, setTestMessage] = useState('');
  const [isTestingLocal, setIsTestingLocal] = useState(false);
  const [isTestingGCP, setIsTestingGCP] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | null; message: string }>({
    status: null,
    message: ''
  });

  // Local VoiceVoxのテスト
  const testLocalVoiceVox = async () => {
    setIsTestingLocal(true);
    setTestResult({ status: null, message: '' });
    
    try {
      // まずversionエンドポイントで接続テスト
      console.log(`Testing connection to: ${localEndpoint}/version`);
      const versionResponse = await fetch(`${localEndpoint}/version`, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!versionResponse.ok) {
        throw new Error(`VoiceVoxサーバーに接続できません (Status: ${versionResponse.status})`);
      }

      const versionData = await versionResponse.text();
      console.log('VoiceVox version:', versionData);

      const testText = 'こんにちは、テスト音声です';
      
      // 音声クエリを作成 (VoiceVox APIの正しい形式)
      console.log(`Creating audio query for: "${testText}"`);
      // 音声クエリ作成: GET メソッドを使用
      const queryResponse = await fetch(`${localEndpoint}/audio_query?text=${encodeURIComponent(testText)}&speaker=3`, {
        method: 'GET',
        mode: 'cors'
      });

      if (!queryResponse.ok) {
        throw new Error(`音声クエリの作成に失敗しました: ${queryResponse.status}`);
      }

      const queryData = await queryResponse.json();

      // 音声合成を実行
      const synthesisResponse = await fetch(`${localEndpoint}/synthesis?speaker=3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(queryData)
      });

      if (!synthesisResponse.ok) {
        throw new Error(`音声合成に失敗しました: ${synthesisResponse.status}`);
      }

      const audioBuffer = await synthesisResponse.arrayBuffer();
      
      // 音声を再生
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();

      setTestResult({
        status: 'success',
        message: 'Local VoiceVoxのテストが成功しました！音声が再生されます。'
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: `Local VoiceVoxのテストに失敗しました: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsTestingLocal(false);
    }
  };

  // GCP VoiceVoxのテスト
  const testGCPVoiceVox = async () => {
    setIsTestingGCP(true);
    setTestResult({ status: null, message: '' });
    
    try {
      const testText = 'こんにちは、テスト音声です';
      const response = await fetch(
        'https://asia-northeast1-zundamon-x.cloudfunctions.net/zundamon-api-proxy/voice?message=' +
          encodeURIComponent(testText)
      );

      if (!response.ok) {
        throw new Error(`GCPリクエストに失敗しました: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      // 音声を再生
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();

      setTestResult({
        status: 'success',
        message: 'GCP VoiceVoxのテストが成功しました！音声が再生されます。'
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: `GCP VoiceVoxのテストに失敗しました: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsTestingGCP(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">VoiceVox設定</h2>
        
        {/* モード切替 */}
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="voicevox-mode"
              checked={!isLocalMode}
              onChange={() => setIsLocalMode(false)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">GCP VoiceVox (デフォルト)</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="voicevox-mode"
              checked={isLocalMode}
              onChange={() => setIsLocalMode(true)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Local VoiceVox</span>
          </label>
        </div>

        {/* Local mode設定 */}
        {isLocalMode && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Local VoiceVoxエンドポイント
            </label>
            <input
              type="text"
              value={localEndpoint}
              onChange={(e) => setLocalEndpoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="http://localhost:50021"
            />
            <p className="mt-2 text-xs text-gray-600">
              ※ VoiceVoxを起動してからテストしてください
            </p>
          </div>
        )}
      </div>

      {/* テストボタン */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">接続テスト</h3>
        
        <div className="flex space-x-4">
          <button
            onClick={testLocalVoiceVox}
            disabled={isTestingLocal}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingLocal ? 'テスト中...' : 'Local VoiceVoxテスト'}
          </button>
          
          <button
            onClick={testGCPVoiceVox}
            disabled={isTestingGCP}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTestingGCP ? 'テスト中...' : 'GCP VoiceVoxテスト'}
          </button>
        </div>

        {/* テスト結果 */}
        {testResult.status && (
          <div className={`p-3 rounded-md ${
            testResult.status === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>

      {/* 使用方法 */}
      <div className="p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Local VoiceVoxの使用方法</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>ホストマシン（Docker外）でVoiceVoxアプリケーションを起動してください</li>
          <li>VoiceVoxの設定で「エンジン起動時に追加で読み込むエンジン」を確認してください</li>
          <li>Docker環境からは http://172.17.0.1:50021 でアクセスします</li>
          <li>VoiceVoxがホストマシンのポート50021で起動していることを確認してください</li>
          <li>上記のテストボタンで接続を確認してください</li>
          <li>Local VoiceVoxモードを選択して使用してください</li>
        </ol>
      </div>
    </div>
  );
};

export default VoiceVoxSettings;
