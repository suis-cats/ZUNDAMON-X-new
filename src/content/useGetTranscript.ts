import { useEffect, useState } from 'react';
import { getTranscriptResponseType } from '../types';

export const useGetTranscript = (id: string) => {
  const [transcript, setTranscript] = useState<getTranscriptResponseType[]>([]);

  useEffect(() => {
    chrome.runtime.sendMessage({ name: 'getTranscript', videoId: `${id}` });
    chrome.runtime.onMessage.addListener((request) => {
      if (request.name === 'returnTranscript') {
        setTranscript(request.data.transcript);
      }
    });
  }, [id]);

  return transcript;
};
