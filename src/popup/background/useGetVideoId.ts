import React, { useEffect, useState } from 'react';
import { videoidtype } from '../../types';

//カスタムフックを使用
function useGetVideoId() {
  const [url, setUrl] = useState<string>();
  const [videoIdInfo, setVideoIdInfo] = useState<videoidtype>({ videoId: '' });

  useEffect(() => {
    const unsubscribe = setInterval(() => {
      // Query for the active tab in the current window
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        setUrl(url);
        const videoId = url?.split('v=')[1].split('&')[0];
        if (typeof videoId === 'string') {
          setVideoIdInfo({ videoId: videoId }); // Update the whole object
        }
      });
    }, 1000);
    return () => {
      //タイマーを消す
      clearInterval(unsubscribe);
    };
  }, []);

  //console.log(videoIdInfo);
  return videoIdInfo;
}

export default useGetVideoId;
