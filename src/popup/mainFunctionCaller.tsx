import React, { useEffect, useState } from 'react';
import { set } from 'lodash';
import { getTranscriptResponseType, isGetTranscriptResponseTypeArray, videoidtype } from '../types';
import { Card, Metric } from '@tremor/react';
import AudioAnalyzer from '../popup/AudioAnalyzer';

import useGetVideoId from './background/useGetVideoId';
import { getPlaybackStatus, getVideoCurrentTime } from './background/getVideoCurrentTime';
import getTranscript from './background/getTranscript';
import useAudioData from './background/useAudioData';
//used in tailwind css
let additionalClasses = 'focus:ring-2 focus:ring-purple-600';
let customBorderLineClasses = 'border-b border-black dark:border-white';
const openOptionsPage = () => {
  chrome.runtime.openOptionsPage(); //Chrome拡張のオプションページに遷移
};

//Youtube再生画面を開いたら実行されます

const MainFunctionCaller = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackStatus, setPlaybackStatus] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<getTranscriptResponseType[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<getTranscriptResponseType>({
    text: '読み込み中...',
    start: 0,
    duration: 0,
  });
  const [currentAudioFile, setCurrentAudioFile] = useState<File | null>(null);
  const [getrangeTS, setGetrangeTS] = useState<getTranscriptResponseType[]>([]);
  const { audioData, getAudio } = useAudioData();
  const [createdAudioIndex, setCreatedAudioIndex] = useState<number[]>([]);
  //used in tailwind css
  const [isChecked, setIsChecked] = useState(true); //toggle1
  const [isChecked2, setIsChecked2] = useState(true); //toggle2

  const [volume, setVolume] = useState(50);
  // 初期化
  useEffect(() => {
    chrome.storage.sync.get('volume', (data) => {
      setVolume((data.volume || 0.5) * 100);
    });
  }, []);

  // ボリューム変更処理（デバウンス）
  let timer: NodeJS.Timeout | null = null;
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      chrome.storage.sync.set({ volume: newVolume / 100 }, () => {
        console.log(`Volume set to ${newVolume / 100}`);
      });
    }, 5000);
  };

  const getAudioTime = 1000; //音声データの取得間隔

  //VideoIDを取得
  //videoIdのオブジェクト生成
  const video: videoidtype = useGetVideoId();

  //videoIdが変更する度に実行
  useEffect(() => {
    //contentにアクセスする度に最初に実行
    if (video.videoId !== '') {
      //字幕データを取得
      getTranscript(video).then((result) => {
        setTranscript(result);
      });

      const unsubscribe = setInterval(() => {
        //contentアクセス後、毎秒実行
        //現在の再生時刻を取得
        getVideoCurrentTime().then((result) => {
          if (typeof result === 'number') {
            setCurrentTime(result);
          } else {
            console.log('再生時刻取得error');
          }
          //現在の再生状態を取得
          getPlaybackStatus().then((result) => {
            if (typeof result === 'boolean') {
              setPlaybackStatus(result);
            } else {
              console.log('再生状態取得error');
            }
          });
        });
      }, getAudioTime);
      return () => {
        //タイマーを消す
        clearInterval(unsubscribe);
      };
    }
  }, [video.videoId]);

  //currentTimeが変更する度に実行
  useEffect(() => {
    //currentTimeとtranscriptが取得できた場合のみ実行
    if (currentTime && isGetTranscriptResponseTypeArray(transcript)) {
      //現在の再生時刻と連動した字幕の表示処理---------------------------------------
      const nowtranscript = transcript.find((item) => Math.abs(currentTime - item.start) <= 0.5);
      if (nowtranscript) {
        setCurrentTranscript(nowtranscript); //現在の字幕をセット
      } else {
        //console.log('近くに字幕がない！');
      }

      //--音声の事前生成処理------------------------------------------------------
      //音声生成範囲の閾値

      const upperLimitTime = currentTime + 30;
      const lowerLimitTime = currentTime - 10;
      const timeRangeIndices = transcript
        .map((item, index) =>
          item.start >= lowerLimitTime && item.start <= upperLimitTime ? index : -1
        )
        .filter((index) => index !== -1);
      const rangeData: getTranscriptResponseType[] = timeRangeIndices.map((item) => {
        //重複生成を防ぐ分岐１
        // if (transcript[item].start in audioData) {
        //   // console.log("getAudio処理完了済");
        //   console.log(audioData)
        // } else {
        //重複生成を防ぐ分岐２
        if (!createdAudioIndex.includes(transcript[item].start)) {
          //音声データ1回目の生成
          setCreatedAudioIndex((prevCreatedAudioIndex) => [
            ...prevCreatedAudioIndex,
            transcript[item].start,
          ]); //生成済みstartを記録
          console.log(transcript[item].text); //console.log('音声データ生成');

          //getAudio(transcript[item].text, transcript[item].start);
        } else {
          //console.log('スルー');
        }
        //}
        return {
          text: transcript[item].text,
          start: transcript[item].start,
          duration: transcript[item].duration,
        };
      });
      setGetrangeTS(rangeData); //range内のTranscriptをセット
    } else {
      console.log('字幕情報が取得できません');
    }
  }, [currentTime]);

  //音声の再生------------------------------------------
  const currentAudio = useAudioData();
  //今の時間に対応したstartがセットされた時に実行
  useEffect(() => {
    //startと一致するwavファイルをオブジェクトから取得
    const audioData = currentAudio.audioData[`${currentTranscript.start}`];
    setCurrentAudioFile(audioData); //wavファイルをセット

    //console.log('startTimeが変更されました:', currentTranscript.start);
  }, [currentTranscript.start]);

  const handleFileChange = (e: any) => {
    setCurrentAudioFile(e.target.files[0]);
  };

  return (
    <div className="text-black dark:text-white bg-gradient-to-l md:bg-gradient-to-r">
      <div className="flex"></div>

      <Card className="bg-gradient-to-l md:bg-gradient-to-r">
        <div className="grid gap-4">
          <div className="flex">
            <button
              className={`items-center rounded-full bg-my-green hover:bg-my-green active:bg-my-green focus:outline-none focus:ring focus:ring-gray-300 ml-auto ${additionalClasses}`}
              onClick={openOptionsPage}
            >
              <p className="p-4 text-black">OPTION PAGE</p>
            </button>
          </div>

          <div>
            <div className="mb-10">
              <label
                htmlFor="large-range"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                音量
              </label>
              <input
                id="large-range"
                type="range"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
              />
            </div>
            <label className=" relative inline-flex items-center mr-5 cursor-pointer">
              <input
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-my-green"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                読み上げ機能
              </span>
            </label>
          </div>

          <div>
            <label className="relative inline-flex items-center mr-5 cursor-pointer">
              <input
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={isChecked2}
                onChange={() => setIsChecked2(!isChecked2)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-my-green"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 ">
                ずんだもん表示／非表示
              </span>
            </label>
          </div>

          <div>
            <label
              htmlFor="countries"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              ずんだもん表示位置
            </label>
            <select
              id="countries"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-300 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option selected>右下</option>
              <option value="l-b">左下</option>
              <option value="r-t">右上</option>
              <option value="l-t">左上</option>
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-300 ">現在の字幕</p>
          </div>

          <div className="flex flex-col items-start">
            <div className="overflow-auto h-52">
              <Metric>{currentTranscript.text ? currentTranscript.text : '読み込み中...'}</Metric>
            </div>
            <div className="flex-shrink-0 mt-4"></div>
          </div>

          <div className={customBorderLineClasses}></div>

          <div>
            <p className="pb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              音声生成中...
            </p>
            <div className="text-base">
              <p>
                {getrangeTS.map((item, index) => (
                  <p key={index}>
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 min-width-12">
                      {item.start}
                    </span>
                    <p key={index}>{item.text}</p>
                  </p>
                ))}
              </p>
            </div>
          </div>
          <div className={customBorderLineClasses}></div>

          <div className="log">
            <p className="pb-2 text-sm font-medium text-gray-900 dark:text-gray-300">統計情報</p>
            <p>VideoID：{video.videoId ? video.videoId : ''}</p>
            <p>現在時刻-20：{(currentTime - 20).toFixed(3)}</p>
            <p>現在時刻：{currentTime.toFixed(3)}</p>
            <p>現在時刻+20：{(currentTime + 20).toFixed(3)}</p>
            <p>再生状況：{playbackStatus ? '停止中' : '再生中'}</p>
          </div>
          <div className={customBorderLineClasses}></div>
          <div>
            <p className="pb-3 text-sm font-medium text-gray-900 dark:text-gray-300">全字幕</p>
            <p>
              {transcript
                ? transcript.map((item, index) => <p key={index}>{item.text}</p>)
                : '動画を取得できませんでした。'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MainFunctionCaller;
