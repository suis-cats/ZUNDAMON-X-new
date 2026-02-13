// getTranscript.ts
import axios from 'axios';
import { videoidtype } from '../../types';

async function getTranscript({ videoId }: videoidtype) {
  //字幕APIアクセスURL
  //http://127.0.0.1:8000/transcript/?id=wdvclbIHfHk

  /*
  //GCPアクセス字幕API
  const response = await axios.get(`http://35.189.143.254/transcript`, {
    params: {
      videoId: videoId,
    },

  //GCPアクセス字幕API.ver2
  const response = await axios.get(`https://asia-northeast1-zundamon-x.cloudfunctions.net/transcript-proxy`, {
    params: {
      videoId: videoId,
    },
  
  //通常アクセス字幕API
  //https://asia-northeast1-zundamon-x.cloudfunctions.net/transcript-proxy/transcript?videoId=ZRtdQ81jPUQ

  //ローカルアクセス字幕API
  const response = await axios.get(`http://127.0.0.1:8000/transcript/`, {
      params: {
        id: videoId,
      },
  */

  try {
    const response = await axios.get(`http://127.0.0.1:8000/transcript?videoId=` + videoId, {
      headers: { 'Access-Control-Allow-Origin': '*' },
      withCredentials: true,
    });

    // The data property of the response will contain the transcript
    const transcript = response.data;
    return transcript;
  } catch (error) {
    console.error(error);
  }
}

export default getTranscript;
