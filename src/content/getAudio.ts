// backendのgetAudioを呼び出す
export const getAudio = (subtitle: string, characterID: string) => {
  console.log(`creating audio... : ${subtitle}`);
  console.log(`キャラクターID... : ${characterID}`);
  // return new Promise(() => {});

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ name: 'getAudio', subtitle: subtitle, characterID: characterID });
    chrome.runtime.onMessage.addListener((request) => {
      console.log(request);
      if (request.name === 'returnAudio' && request.data.subtitle === subtitle) {
        console.log(`finish! : ${subtitle}`);
        resolve(request.data.audio);
      }
    });
  });
};
