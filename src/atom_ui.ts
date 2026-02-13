import { atom } from 'recoil';
import { emotionType } from './types_ui';

// 音声データの型
export const audioDataState = atom<{
  src: string;
  frequencyData: Uint8Array;
  subtitle: string;
} | null>({
  key: 'audioDataState_UI', // Changed key to avoid conflict
  default: null,
});

// 音声スタイルの型 from voice_style_data.json
type Character = string;
type Style = string;

export const selectedCharacterState = atom<Character>({
  key: 'selectedCharacterState_UI',
  default: 'ずんだもん',
});

export const selectedStyleState = atom<Style>({
  key: 'selectedStyleState_UI',
  default: '',
});

export const selectedIdState = atom<number>({
  key: 'selectedIdState_UI',
  default: 3,
});

//感情分析の型
export const emotionTypeAtom = atom<emotionType>({
  key: 'emotionTypeAtom_UI',
  default: '通常',
});
