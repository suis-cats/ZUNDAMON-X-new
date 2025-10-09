/*
 * 字幕を取得する処理
 */

// import axios from 'axios';
// import { videoidtype } from '../types';

export const getTranscript = () =>
  chrome.runtime.onMessage.addListener(async (request) => {
    console.log('メッセージを受け取ります', request);
    if (request.name === 'getTranscript') {
      await fetch(`http://127.0.0.1:8000/transcript/?id=` + request.videoId, {
        method: 'GET',
        headers: { 'Access-Control-Allow-Origin': '*' },
        // withCredentials: true,
      })
        .then((json) => {
          return json.json();
        })
        .then((res) => {
          const transcript = res;
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log({ tabs });
            const id = tabs[0].id as number;

            // content_script へデータを送る
            chrome.tabs
              .sendMessage(id, {
                // content_script はタブごとに存在するため ID 指定する必要がある
                name: 'returnTranscript',
                data: {
                  transcript,
                },
              })
              .then((res) => {
                console.log('メッセージを送りまああ', res);
              })
              .catch((err) => {
                console.log('Error:', err);
              });
          });
        });
    }
  });
