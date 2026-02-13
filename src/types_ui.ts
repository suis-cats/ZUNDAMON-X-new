export type videoidtype = {
  videoId: string;
};

export type currentTimeType = {
  currentTime: number;
};

// JSONでは、小数点を含む数値はすべてNumber型
export type getTranscriptResponseType = {
  text: string;
  start: number;
  duration: number;
};

// getTranscriptResponseType[]型かどうかを判定する関数
export const isGetTranscriptResponseTypeArray = (arg: any): arg is getTranscriptResponseType[] => {
  return Array.isArray(arg);
};
export type audioDataObject = {
  [startTime: number]: File;
};

export type VoiceStyles = {
  [character: string]: {
    [style: string]: number;
  };
};

export type emotionType =
  | '通常'
  | '少しネガティブ'
  | 'とてもネガティブ'
  | '少しポジティブ'
  | 'とてもポジティブ';
