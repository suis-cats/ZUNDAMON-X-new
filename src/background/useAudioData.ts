import { useSetRecoilState, useRecoilValue } from 'recoil';
import { audioDataState, voiceVoxLocalModeState, voiceVoxLocalEndpointState } from '../atom';
import { audioDataObject } from '../types';

//* 字幕から音声ファイルの生成 -> 音声データをstateに保存する処理
const useAudioData = () => {
  const setAudioData = useSetRecoilState<audioDataObject>(audioDataState); // recoilのstateに保存する関数
  const isLocalMode = useRecoilValue(voiceVoxLocalModeState);
  const localEndpoint = useRecoilValue(voiceVoxLocalEndpointState);

  const getAudioData = async (subtitle: string, start: number) => {
    try {
      let audioBuffer: ArrayBuffer;

      if (isLocalMode) {        // Local VoiceVox mode
        console.log('Local VoiceVox mode enabled');
          // まず音声クエリを作成 (VoiceVox APIの正しい形式)
        // 音声クエリ作成: GET メソッドを使用
        const queryResponse = await fetch(
          `${localEndpoint}/audio_query?text=${encodeURIComponent(subtitle)}&speaker=3`,
          { method: 'GET' }
        );

        if (!queryResponse.ok) {
          throw new Error(`Audio query failed: ${queryResponse.status}`);
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
          throw new Error(`Synthesis failed: ${synthesisResponse.status}`);
        }

        audioBuffer = await synthesisResponse.arrayBuffer();
      } else {
        // GCP VoiceVox mode (original)
        console.log('GCP VoiceVox mode enabled');
        const response = await fetch(
          'https://asia-northeast1-zundamon-x.cloudfunctions.net/zundamon-api-proxy/voice?message=' +
            encodeURIComponent(subtitle)
        );

        if (!response.ok) {
          throw new Error(`GCP request failed: ${response.status}`);
        }

        audioBuffer = await response.arrayBuffer();
      }

      // 音声データの変換処理
      const wavFile = new File([audioBuffer], 'filename.wav', { type: 'audio/wav' }); // bufferからwavファイルを作成

      // recoilのstateに保存
      setAudioData((prevData) => ({
        ...prevData,
        [`${start}`]: wavFile,
      }));

      console.log(`Audio generated successfully for text: "${subtitle}" (mode: ${isLocalMode ? 'local' : 'GCP'})`);
    } catch (error) {
      console.error('Audio generation failed:', error);
      // エラーの場合、GCPモードにフォールバックするかユーザーに通知
    }
  };

  return { getAudioData };
};

export default useAudioData;
