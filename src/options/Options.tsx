import React, { ReactElement } from 'react';
import CharacterSelector from './CharactersSelector';

const Options = (): ReactElement => {
  return (
    <div className="flex flex-col items-start bg-lime-100 h-full">
      <div className="m-10 bg-lime-100">
        <p className="text-4xl font-bold text-left mb-5 animate-tracking-in-expand">
          ZUNDAMON-X 設定
        </p>
        <CharacterSelector />
      </div>
    </div>
  );
};

export default Options;
