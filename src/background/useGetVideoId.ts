import React, { useEffect, useState } from 'react';

//カスタムフックを使用
function useGetVideoId() {
  const [videoId, setVideoId] = useState('');

  useEffect(() => {
    const unsubscribe = setInterval(() => {
      // Query for the active tab in the current window
      // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      //   const url = tabs[0].url;
      //   console.log('url is', url);

      const url = window.location.href;
      const videoId = url?.split('v=')[1]?.split('&')[0];
      if (typeof videoId === 'string') {
        setVideoId(videoId); // Update the whole object
      }
      // });
    }, 1000);
    return () => {
      //タイマーを消す
      clearInterval(unsubscribe);
    };
  }, []);

  //console.log(videoIdInfo);
  return { videoId: videoId };
}

export default useGetVideoId;
