const REQUEST_NAME = 'getAudio';

export const getAudio = () => {
  // chrome.runtime.onMessage.addListener((request) => {
  //   if (request.name === REQUEST_NAME) {
  //     const url = `http://127.0.0.1:8000/voice?message=${request.subtitle}&character=${request.characterID}`;
  //     fetch(url).then((res) => {
  //       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //         const id = tabs[0].id as number;
  //         chrome.tabs.sendMessage(id, {
  //           name: 'returnAudio',
  //           data: {
  //             audio: res,
  //             subtitle: request.subtitle,
  //           },
  //         });
  //       });
  //     });
  //   }
  // });
};
