// Mock chrome API for browser preview
if (typeof chrome === 'undefined' || !chrome.runtime) {
  const store: Record<string, any> = {
    selectedId: 1,
    volume: 0.5,
    selectedCharacter: 'zundamon',
  };

  (window as any).chrome = {
    runtime: {
      openOptionsPage: () => console.log('Mock: openOptionsPage'),
      sendMessage: () => Promise.resolve({ transcript: [] }),
      onMessage: {
        addListener: () => {},
        removeListener: () => {},
      },
    },
    storage: {
      sync: {
        get: (keys: string | string[], callback: (items: any) => void) => {
          console.log('Mock: storage.get', keys);
          if (typeof keys === 'string') {
            callback({ [keys]: store[keys] });
          } else if (Array.isArray(keys)) {
            const result: Record<string, any> = {};
            keys.forEach((k) => (result[k] = store[k]));
            callback(result);
          } else {
             callback(store);
          }
        },
        set: (items: any, callback?: () => void) => {
          console.log('Mock: storage.set', items);
          Object.assign(store, items);
          if (callback) callback();
        },
      },
    },
  };
}
