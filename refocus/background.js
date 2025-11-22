// background.js

function matchesBlockedSite(hostname, blockedPattern) {
  if (!hostname) return false;

  const escapedPattern = blockedPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let regex;

  if (escapedPattern.startsWith('\\*\\.')) { // e.g., "*.google.com"
    const domainPart = escapedPattern.substring(4); // Remove "\*."
    regex = new RegExp(`(?:^|\\.)${domainPart}$`);
  } else { // e.g., "google.com" or "mail.google.com"
    regex = new RegExp(`(?:^|\\.)${escapedPattern}$`);
  }

  return regex.test(hostname);
}

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
        // Use the new wildcard matching function
        try {
          if (matchesBlockedSite(new URL(details.url).hostname, site)) {
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
        } catch (e) {
          console.error("Error parsing URL or matching blocked site:", e);
        }
      }
    });
  },
  { url: [{ urlMatches: 'https://*/*' }, { urlMatches: 'http://*/*' }] }
);
