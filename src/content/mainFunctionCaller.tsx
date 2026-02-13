import { useEffect, useState } from 'react';
import { useGetVideoStatus } from './useGetVideoStatus';
import useGetVideoId from '../background/useGetVideoId';
import { useGetTranscript } from './useGetTranscript';
import { getTranscriptResponseType, isGetTranscriptResponseTypeArray } from '../types';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { audioDataState, emotionTypeAtom, selectedIdState } from '../atom';
import { getEmotionType } from './features/getEmotionType';

// 何秒前から音声データを取得するか
const PRELOAD_SEC = 10;

const MainFunctionCaller = () => {
  const [wishList, setWishList] = useState<number[]>([]);
  const { currentTime } = useGetVideoStatus();
  const videoId = useGetVideoId();
  const transcript = useGetTranscript(videoId.videoId);
  const [createdAudioIndexArray, setCreatedAudioIndexArray] = useState<number[]>([]);
  const [audioData, setAudioData] = useRecoilState(audioDataState);
  const setEmotionType = useSetRecoilState(emotionTypeAtom);
  // const selectedId = useRecoilValue(selectedIdState);
  const [selectedCharacter, setSelectedCharacter] = useState<number>(3);
  chrome.storage.sync.get(['selectedId'], function (result) {
    console.log('Value currently is ' + result.selectedId);
    if (result.selectedId != undefined) {
      setSelectedCharacter(result.selectedId);
    }
  });

  const [currentTranscript, setCurrentTranscript] = useState<getTranscriptResponseType>();
  useEffect(() => {
    if (typeof transcript === 'object' && transcript.length > 0 && currentTime) {
      const val = transcript.findIndex(
        (item) =>
          currentTime && item.start <= currentTime && item.start + item.duration >= currentTime
      );

      if (val != -1) setCurrentTranscript(transcript[val]);
    }
  }, [currentTime]);

  console.log(currentTranscript);

  const [audios, setAudios] = useState<{ [key in string]: HTMLAudioElement }>({});

  let currentVolume = 0.5; // デフォルト値

  //currentTimeが変更する度に実行
  useEffect(() => {
    console.log(transcript, 'type is', typeof transcript);
    if (
      !isGetTranscriptResponseTypeArray(transcript) ||
      !transcript ||
      !currentTime ||
      !videoId.videoId
    )
      return;

    //ほしい物リストの範囲
    const upperLimitTime = currentTime + PRELOAD_SEC;
    const lowerLimitTime = currentTime - 15;
    //ほしい物リストの検索
    const tmpWishlist = transcript
      .map((item, index) =>
        item.start >= lowerLimitTime && item.start <= upperLimitTime ? index : -1
      )
      .filter((index) => index !== -1);

    setWishList(tmpWishlist); //ほしい物リストの更新
  }, [currentTime]);

  // 指定された音声を事前に生成
  useEffect(() => {
    let isCancelled = false; // キャンセルフラグ

    const generate = async () => {
      for (let index of wishList.filter((index) => !createdAudioIndexArray.includes(index))) {
        if (isCancelled) return; // キャンセルされた場合は処理を中断
        const targetTranscript = transcript[index];
        if (!targetTranscript) return;
        if (audios[targetTranscript.text]) return;

        console.log('create audio', targetTranscript.text, 'character', selectedCharacter);
        const audio = new Audio();
        audio.src =
          'http://127.0.0.1:8000/voice?message=' +
          targetTranscript.text +
          '&character=' +
          selectedCharacter;
        console.log(' Access URL ->  ', audio.src);
        audio.onload = () => {
          console.log('audio loaded', targetTranscript.text);
        };
        audio.onerror = () => {
          console.log('audio error', targetTranscript.text);
          setCreatedAudioIndexArray((createdAudioIndexArray) =>
            createdAudioIndexArray.filter((item) => item !== index)
          );
        };
        setAudios((audios) => ({ ...audios, [targetTranscript.text]: audio }));
        setCreatedAudioIndexArray((createdAudioIndexArray) => [...createdAudioIndexArray, index]);
        getEmotionType(targetTranscript.text).then((emotionType) => {
          setEmotionType(emotionType);
        });

        // サーバーにリクエストを送る順番を保証するために少し待ちを入れる
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    };

    generate();
    return () => {
      isCancelled = true; // コンポーネントのアンマウントまたは依存配列の変更時にキャンセルフラグを立てる
    };
  }, [wishList]);

  useEffect(() => {
    if (!currentTranscript) return;

    const audio = audios[currentTranscript.text];
    console.log(audio);
    if (!audio) return;

    const { duration } = audio;
    const rate = duration / currentTranscript.duration;
    console.log({ voice: duration, video: currentTranscript.duration });
    console.log('rate: ', rate);
    console.log('state : ', audio.readyState);
    audio.playbackRate = rate >= 1 ? rate : 1;
    audio.play();

    const copyAudio = new Audio();
    copyAudio.src = audio.src;
    var ctx = new AudioContext();
    var analyser = ctx.createAnalyser();
    var audioSrc = ctx.createMediaElementSource(copyAudio);
    audioSrc.connect(analyser);
    analyser.connect(ctx.destination);
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    console.log('frequencyData', frequencyData);
    setAudioData({ src: audio.src, frequencyData, subtitle: currentTranscript.text });
  }, [currentTranscript?.start]);

  return <></>;
};

export default MainFunctionCaller;
