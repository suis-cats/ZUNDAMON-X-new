import { atom } from 'recoil';

// 音声データの型
export const audioDataState = atom<Record<string, File>>({
  key: 'audioDataState',
  default: {}, // { [start]: File }
});

// VoiceVox local mode設定
export const voiceVoxLocalModeState = atom<boolean>({
  key: 'voiceVoxLocalModeState',
  default: false,
});

// VoiceVox local endpoint設定
export const voiceVoxLocalEndpointState = atom<string>({
  key: 'voiceVoxLocalEndpointState',
  default: 'http://localhost:50021',  // 外部のVoiceVoxサーバー（ホストマシン）
});
