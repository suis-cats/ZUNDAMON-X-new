import React, { ReactElement } from 'react';
import { RecoilRoot } from 'recoil';
import VoiceVoxSettings from './VoiceVoxSettings';

const Options = (): ReactElement => {
  return (
    <RecoilRoot>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">設定</h1>
          </div>
          <div className="bg-white shadow-lg rounded-lg px-6 py-8">
            <VoiceVoxSettings />
          </div>
        </div>
      </div>
    </RecoilRoot>
  );
};

export default Options;
