// background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList'], (result) => {
    const newStorage = {};
    if (!result.blockedSites) {
      newStorage.blockedSites = ['example.com'];
    }
    if (!result.redirectSites) {
      newStorage.redirectSites = [];
    }
    if (typeof result.popFromList === 'undefined') {
      newStorage.popFromList = true;
    }
    if (Object.keys(newStorage).length > 0) {
      chrome.storage.local.set(newStorage);
    }
  });
});

chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList'], (result) => {
      const { blockedSites, redirectSites, popFromList } = result;

      if (!blockedSites) return;

      for (const site of blockedSites) {
        if (details.url.includes(site)) {
          if (redirectSites && redirectSites.length > 0) {
            const randomIndex = Math.floor(Math.random() * redirectSites.length);
            const randomRedirect = redirectSites[randomIndex];
            
            if (popFromList) {
              redirectSites.splice(randomIndex, 1);
              chrome.storage.local.set({ redirectSites: redirectSites });
            }

            chrome.tabs.update(details.tabId, { url: randomRedirect });
          } else {
            // If the redirect list is empty, redirect to the default site
            chrome.tabs.update(details.tabId, { url: 'https://tasks.google.com' });
          }
          break; // Stop checking once a match is found
        }
      }
    });
  },
  { url: [{ urlMatches: 'https://*/*' }, { urlMatches: 'http://*/*' }] }
);
