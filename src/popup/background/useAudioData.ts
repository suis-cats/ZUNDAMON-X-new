import { useState } from 'react';
import { audioDataObject } from '../../types';

const useAudioData = () => {
  const [audioData, setAudioData] = useState<audioDataObject>({});

  const getAudio = (subtitle: string, start: number) => {
    fetch('http://127.0.0.1:8000/voice?message=' + subtitle)
      .then((res: Response) => {
        return res.arrayBuffer();
      })
      .then((buffer: ArrayBuffer) => {
        /* 音声データの変換処理 */
        const wavFile = new File([buffer], 'filename.wav', { type: 'audio/wav' }); // bufferからwavファイルを作成

        setAudioData((prevData) => ({
          ...prevData,
          [`${start}`]: wavFile, // data[startの時間] = wavファイル
        }));
      });
  };

  // console.log(audioData);

  return { audioData, getAudio };
};

export default useAudioData;
