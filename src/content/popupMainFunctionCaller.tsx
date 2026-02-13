import React, { FC, useEffect, useState } from 'react';
// import { Card, Metric } from '@tremor/react';
// import { useRecoilValue } from 'recoil';

// import { audioDataState } from '../atom';
// import { getPlaybackStatus, getVideoCurrentTime } from '../background/getVideoCurrentTime';
// import useGetVideoId from '../background/useGetVideoId';
// import AudioAnalyzer from '../popup/AudioAnalyzer';
// import './main.css';
// import '../tailwind.css';
// import { getTranscriptResponseType, videoidtype } from '../types';

// //use in tailwind css
// let additionalClasses = 'focus:ring-2 focus:ring-purple-600';
// const openOptionsPage = () => {
//   chrome.runtime.openOptionsPage(); //Chrome拡張のオプションページに遷移
// };

// const MainFunctionCaller = () => {
//   const [currentTime, setCurrentTime] = useState<number>(0);
//   const [playbackStatus, setPlaybackStatus] = useState<boolean>(false);
//   const [transcript, setTranscript] = useState<getTranscriptResponseType[]>([]);
//   const [currentTranscript, setCurrentTranscript] = useState<getTranscriptResponseType>({
//     text: '',
//     start: 0,
//     duration: 0,
//   });
//   const [currentAudioFile, setCurrentAudioFile] = useState<File | null>(null);
//   const [getrangeTS, setGetrangeTS] = useState<getTranscriptResponseType[]>([]);
//   const [TSdisplay, setTSdisplay] = useState<getTranscriptResponseType[]>([]);
//   // const { audioData, getAudio } = useAudioData();

//   const [createdAudioIndex, setCreatedAudioIndex] = useState<number[]>([]);
//   const [wishList, setWishList] = useState<number[]>([]);
//   const getAudioTime = 1000; //音声データの取得間隔
//   const audioData = useRecoilValue(audioDataState);

//   //use in tailwind css
//   const [isChecked, setIsChecked] = useState(true); //toggle1
//   const [isChecked2, setIsChecked2] = useState(true); //toggle2
//   const [isOpen, setIsOpen] = useState(false); //ログの表示

//   //VideoIDを取得
//   //videoIdのオブジェクト生成
//   const video: videoidtype = useGetVideoId();

//   //videoIdが変更する度に実行
//   useEffect(() => {
//     //contentにアクセスする度に最初に実行
//     if (video.videoId !== '') {
//       //字幕データを取得
//       console.log('メッセージを送信します！');
//       chrome.runtime.sendMessage({ name: 'getTranscript', videoId: `${video.videoId}` });
//       // getTranscript(video).then((result) => {
//       //   setTranscript(result);
//       // });
//       chrome.runtime.onMessage.addListener((request) => {
//         if (request.name === 'returnTranscript') {
//           console.log('メッセージを受け取りました！', request);

//           setTranscript(request.data.transcript);
//         }
//       });
//       const unsubscribe = setInterval(() => {
//         //contentアクセス後、毎秒実行
//         //現在の再生時刻を取得
//         const currentTimeResult = getVideoCurrentTime();
//         // .then((result) => {
//         if (typeof currentTimeResult === 'number') {
//           setCurrentTime(currentTimeResult);
//         } else {
//           console.log('再生時刻取得error');
//         }
//         //現在の再生状態を取得
//         const playBackResult = getPlaybackStatus();
//         // .then((result) => {
//         if (typeof playBackResult === 'boolean') {
//           setPlaybackStatus(playBackResult);
//         } else {
//           console.log('再生状態取得error');
//         }
//         // });
//         // });
//       }, getAudioTime);
//       return () => {
//         //タイマーを消す
//         clearInterval(unsubscribe);
//       };
//     }
//   }, [video.videoId]);

//   //currentTimeが変更する度に実行
//   useEffect(() => {
//     //currentTimeとtranscriptが取得できた場合のみ実行
//     if (currentTime && transcript) {
//       //現在の再生時刻と連動した字幕の表示処理---------------------------------------
//       const nowtranscript = transcript.find((item) => Math.abs(currentTime - item.start) <= 0.5);
//       if (nowtranscript) {
//         setCurrentTranscript(nowtranscript); //現在の字幕をセット
//       } else {
//         //console.log('近くに字幕がない！');
//       }

//       //--音声の事前生成処理------------------------------------------------------

//       //ほしい物リストの範囲
//       const upperLimitTime = currentTime + 20;
//       const lowerLimitTime = currentTime - 15;
//       //ほしい物リストの検索
//       const tmpWishlist = transcript
//         .map((item, index) =>
//           item.start >= lowerLimitTime && item.start <= upperLimitTime ? index : -1
//         )
//         .filter((index) => index !== -1);

//       setWishList(tmpWishlist); //ほしい物リストの更新
//     }

//     // 現在時間から-5分の音声データを削除する
//     /*
//     const fiveMinutesAgo = currentTime - 300;
//     const updatedAudioData = { ...audioData };
//     Object.keys(updatedAudioData).forEach((start) => {
//       if (Number(start) <= fiveMinutesAgo) {
//         delete updatedAudioData[start];
//       }
//     });
//     */
//   }, [currentTime]);

//   //音声データの新規生成と削除------------------------------------------
//   useEffect(() => {
//     console.log('ほしい物リスト', wishList);

//     let tmpCreatedList = [...createdAudioIndex];
//     const tmpTSdisplay: getTranscriptResponseType[] = [];

//     wishList.forEach((item) => {
//       const findText = transcript[item];

//       if (findText) {
//         if (!createdAudioIndex.find((_) => _ == findText.start)) {
//           console.log('作る', findText.text);
//           // let _createdAudioIndex = [...createdAudioIndex];
//           // _createdAudioIndex.push(findText.start);
//           setCreatedAudioIndex((createdAudioIndex) => {
//             const _createdAudioIndex = [...createdAudioIndex];

//             _createdAudioIndex.push(findText.start);
//             return _createdAudioIndex;
//           });
//         } else {
//           tmpCreatedList = tmpCreatedList.filter((_) => _ !== findText.start);
//         }
//         tmpTSdisplay.push(findText);
//       }
//       return;
//     });
//     console.log('消す', tmpCreatedList);
//     //消す(tmpCreatedList])
//     setCreatedAudioIndex((_) => {
//       let _createdAudioIndex = [..._];
//       _createdAudioIndex = _createdAudioIndex.filter((_) => !tmpCreatedList.includes(_));
//       return _createdAudioIndex;
//     }); //作成済みの音声データの更新
//     setTSdisplay(tmpTSdisplay); //読み込み予定の字幕を更新
//   }, [wishList[0]]);

//   //音声の再生------------------------------------------
//   // const currentAudio = useAudioData();
//   //今の時間に対応したstartがセットされた時に実行

//   /* 今の保持しているstartに対応した音声データをstateから取得 */

//   useEffect(() => {
//     const currentAudioData = audioData[`${currentTranscript.start}`]; //startに対応したwavファイルを取得
//     setCurrentAudioFile(currentAudioData); //wavファイルをセット

//     //console.log('startTimeが変更されました:', currentTranscript.start);
//   }, [currentTranscript.start]);

//   // テスト用
//   const handleFileChange = (e: any) => {
//     setCurrentAudioFile(e.target.files[0]);
//   };

//   return (
//     <div className="text-black dark:text-white">
//       <Card className="bg-gradient-to-l md:bg-gradient-to-r">
//         <div className="grid gap-6 ">
//           <div className="flex">
//             <button
//               className={`items-center rounded-full bg-my-green dark:bg-gray-500 hover:bg-my-green dark:hover:bg-gray-600 active:bg-my-green dark:active:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 ml-auto mr-3 ${additionalClasses}`}
//               onClick={openOptionsPage}
//             >
//               <p className="p-4">OPTION PAGE</p>
//             </button>
//           </div>

//           <div>
//             <label className=" relative inline-flex items-center mr-5 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value=""
//                 className="sr-only peer"
//                 checked={isChecked}
//                 onChange={() => setIsChecked(!isChecked)}
//               />
//               <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
//               <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
//                 読み上げ機能
//               </span>
//             </label>
//           </div>

//           <div>
//             <label className="relative inline-flex items-center mr-5 cursor-pointer">
//               <input
//                 type="checkbox"
//                 value=""
//                 className="sr-only peer"
//                 checked={isChecked2}
//                 onChange={() => setIsChecked2(!isChecked2)}
//               />
//               <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
//               <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 ">
//                 ずんだもんビジュ
//               </span>
//             </label>
//           </div>

//           <div>
//             <label
//               htmlFor="countries"
//               className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
//             >
//               ずんだもん表示位置
//             </label>
//             <select
//               id="countries"
//               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-300 dark:focus:ring-blue-500 dark:focus:border-blue-500"
//             >
//               <option selected>右下</option>
//               <option value="l-b">左下</option>
//               <option value="r-t">右上</option>
//               <option value="l-t">左上</option>
//             </select>
//           </div>

//           <div>
//             <p className="text-sm font-medium text-gray-900 dark:text-gray-300 ">現在の字幕</p>
//           </div>

//           <div className="flex flex-col items-start">
//             <div className="overflow-auto h-52 w-64">
//               <Metric>{currentTranscript.text ? currentTranscript.text : '読み込み中...'}</Metric>
//             </div>
//             <div className="flex-shrink-0 mt-4">
//               <p>-----------------------------------------</p>
//             </div>
//           </div>

//           <div className="log">
//             <p className="pb-2">統計情報</p>
//             <p>VideoID：{video.videoId ? video.videoId : ''}</p>
//             <p>現在時刻-20：{(currentTime - 20).toFixed(3)}</p>
//             <p>現在時刻：{currentTime.toFixed(3)}</p>
//             <p>現在時刻+20：{(currentTime + 20).toFixed(3)}</p>
//             <p>再生状況：{playbackStatus ? '停止中' : '再生中'}</p>
//           </div>

//           <div>
//             <p className="pb-2">音声生成範囲</p>
//             <div className="text-base">
//               <p>
//                 {getrangeTS.map((item, index) => (
//                   <p key={index}>
//                     <span className="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 min-width-12">
//                       {item.start}
//                     </span>
//                     <p key={index}>{item.text}</p>
//                   </p>
//                 ))}
//               </p>
//               <p>-----------------------------------</p>
//             </div>
//           </div>

//           <div>
//             <p>全字幕</p>
//             <p>
//               {transcript
//                 ? transcript.map((item, index) => <p key={index}>{item.text}</p>)
//                 : '動画を取得できませんでした。'}
//             </p>
//           </div>
//           <div>
//             <input type="file" onChange={handleFileChange} />
//             <div>
//               {audioData ? <AudioAnalyzer element={audioData[1]} /> : <p>No audio file selected</p>}
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default MainFunctionCaller;
