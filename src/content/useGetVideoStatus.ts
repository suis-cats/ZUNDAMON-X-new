import { useState, useEffect } from 'react';

// 動画の再生情報取得の間隔(ms)
const UPDATE_INTERVAL = 1000;

/* 現在の再生時刻を取得 */
// 例: 1分30秒の場合、90を返す
const getVideoCurrentTime = () => {
  const videoCurrentTime = () => {
    const video = document.getElementsByTagName('video')[0];
    return video?.currentTime;
  };
  return videoCurrentTime();
  // return scripting(videoCurrentTime);
};

/* 現在の再生状態を取得 */
const getIsPlaying = () => {
  const video = document.getElementsByTagName('video')[0];
  return !video?.paused;
};

export const useGetVideoStatus = () => {
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = setInterval(() => {
      const currentTimeResult = getVideoCurrentTime();
      if (typeof currentTimeResult === 'number') {
        setCurrentTime(currentTimeResult);
      } else {
        console.log('再生時刻取得error');
      }

      //現在の再生状態を取得
      const playBackResult = getIsPlaying();
      if (typeof playBackResult === 'boolean') {
        setIsPlaying(playBackResult);
      } else {
        console.log('再生状態取得error');
      }
    }, UPDATE_INTERVAL);
    return () => {
      //タイマーを消す
      clearInterval(unsubscribe);
    };
  }, []);

  return { currentTime, isPlaying };
};
