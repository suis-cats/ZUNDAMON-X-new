import React, { ReactElement } from 'react';

import AudioAnalyzer from './AudioAnalyzer';
import MainFunctionCaller from './mainFunctionCaller';

const Popup = (): ReactElement => {
  document.body.style.width = '18rem';
  document.body.style.height = '15rem';

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage(); //Chrome拡張のオプションページに遷移
  };

  return (
    <div className="h-screen items-center justify-center">
      <MainFunctionCaller />
    </div>
  );
};

export default Popup;
