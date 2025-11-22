// background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedSites', 'redirectSites'], (result) => {
    if (!result.blockedSites) {
      chrome.storage.local.set({ blockedSites: ['example.com'] });
    }
    // Let the user start with an empty redirect list
    if (!result.redirectSites) {
      chrome.storage.local.set({ redirectSites: [] });
    }
  });
});

chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    chrome.storage.local.get(['blockedSites', 'redirectSites'], (result) => {
      const { blockedSites, redirectSites } = result;

      if (!blockedSites) return;

      for (const site of blockedSites) {
        if (details.url.includes(site)) {
          if (redirectSites && redirectSites.length > 0) {
            const randomRedirect = redirectSites[Math.floor(Math.random() * redirectSites.length)];
            chrome.tabs.update(details.tabId, { url: randomRedirect });
          } else {
            // If the redirect list is empty, open the options page
            chrome.tabs.update(details.tabId, { url: 'options.html?reason=empty_list' });
          }
          break; // Stop checking once a match is found
        }
      }
    });
  },
  { url: [{ urlMatches: 'https://*/*' }, { urlMatches: 'http://*/*' }] }
);
