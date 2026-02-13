import React, { ReactElement, useEffect, useState } from 'react';

import AudioAnalyzer from '../popup/AudioAnalyzer';

import { Counter } from './features/counter';
// import getAudioData from './getAudioData';
import { audioDataState } from '../atom';
import { useRecoilValue } from 'recoil';
import MainFunctionCaller from './mainFunctionCaller';

const Content = (): ReactElement => {
  // const { audioData, getAudio } = useAudioData();
  const audioData = useRecoilValue(audioDataState);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 999,
        bottom: 0,
        right: 0,
        // backgroundColor: 'rgb(255 255 255 / 30%)',
        backgroundColor: 'black',
        pointerEvents: 'none',
      }}
    >
      <MainFunctionCaller />
      <div style={{ display: 'flex', justifyContent: 'center' }}>Content Example</div>
      <Counter />
      <AudioAnalyzer />
    </div>
  );
};

export default Content;
