import browser from 'webextension-polyfill';

import { isDev } from '../shared/utils';
import { getTranscript } from './getTranscript';
import { getAudio } from './getAudio';

// show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    //show the welcome page
    const url = browser.runtime.getURL(isDev ? 'src/welcome/welcome.html' : 'welcome.html'); // TODO: better approach
    await browser.tabs.create({ url });
  }
});

// add eventlistener
getTranscript();
getAudio();

export {};
