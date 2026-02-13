export const getTranscript = () =>
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.name === 'getTranscript') {
      await fetch(`http://127.0.0.1:8000/transcript?videoId=` + request.videoId, {
        method: 'GET',
        headers: { 'Access-Control-Allow-Origin': '*' },
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
            chrome.tabs.sendMessage(id, {
              // content_script はタブごとに存在するため ID 指定する必要がある
              name: 'returnTranscript',
              data: {
                transcript,
              },
            });
          });
        });
    }
  });
