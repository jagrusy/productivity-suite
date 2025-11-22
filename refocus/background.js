// background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList', 'defaultRedirectSite'], (result) => {
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
    if (typeof result.defaultRedirectSite === 'undefined') {
      newStorage.defaultRedirectSite = 'https://tasks.google.com';
    }
    if (Object.keys(newStorage).length > 0) {
      chrome.storage.local.set(newStorage);
    }
  });
});

chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList', 'defaultRedirectSite'], (result) => {
      const { blockedSites, redirectSites, popFromList, defaultRedirectSite } = result;

      if (!blockedSites) return;

      for (const site of blockedSites) {
        if (new URL(details.url).hostname.includes(site)) {
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
            chrome.tabs.update(details.tabId, { url: defaultRedirectSite });
          }
          break; // Stop checking once a match is found
        }
      }
    });
  },
  { url: [{ urlMatches: 'https://*/*' }, { urlMatches: 'http://*/*' }] }
);
