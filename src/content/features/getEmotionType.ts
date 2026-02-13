import { emotionType } from '../../types';

export const getEmotionType = (text: string): Promise<emotionType> => {
  const body = {
    document: {
      type: 'PLAIN_TEXT',
      language: 'JA',
      content: text,
    },
    encodingType: 'UTF8',
  };
  return fetch(
    'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' +
      'AIzaSyDZ3cQhpe9doVNEAFhQET1pQ9aWuZ2aMIE',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      console.log('感情分析APIを叩きました。', res.documentSentiment);
      if (res.error) {
        return '通常';
      }
      const score = res.documentSentiment.score;
      if (score > 0.7) {
        return 'とてもポジティブ';
      } else if (score > 0.4 && score <= 0.7) {
        return '少しポジティブ';
      } else if (score <= 0.4 && score >= -0.4) {
        return '通常';
      } else if (score < -0.4 && score >= -0.7) {
        return '少しネガティブ';
      } else {
        return 'とてもネガティブ';
      }
    })
    .catch((err) => {
      console.log(err);
      return '通常';
    });
};
