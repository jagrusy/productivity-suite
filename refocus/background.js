// background.js

function matchesBlockedSite(hostname, blockedPattern) {
  if (!hostname) return false;

  // Remove leading "*. " if present, as "domain.com" implies blocking subdomains too.
  const cleanPattern = blockedPattern.startsWith('*.') ? blockedPattern.substring(2) : blockedPattern;
  const escapedPattern = cleanPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // This regex matches the exact domain or any of its subdomains.
  // E.g., for "google.com", it matches "google.com", "www.google.com", "mail.google.com".
  // For "mail.google.com", it matches only "mail.google.com".
  const regex = new RegExp(`(?:^|\\.)${escapedPattern}$`);

  return regex.test(hostname);
}

function isSchedulingActive(enableScheduling, startTime, endTime, scheduledDays) {
  if (!enableScheduling) {
    return false; // Scheduling is not enabled
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // e.g., "mon"
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const totalStartTime = startHour * 60 + startMinute;
  const totalEndTime = endHour * 60 + endMinute;

  if (scheduledDays.includes(currentDay)) {
    if (totalStartTime <= totalEndTime) {
      // Blocking within a single day
      return currentTime >= totalStartTime && currentTime <= totalEndTime;
    } else {
      // Blocking overnight (e.g., 22:00 - 06:00)
      return currentTime >= totalStartTime || currentTime <= totalEndTime;
    }
  }
  return false; // Not a scheduled day
}

let bypassedTabs = new Map(); // Map<tabId, Set<url>> to store temporarily bypassed URLs

// Only register Chrome event listeners in browser environment
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList', 'defaultRedirectSite', 'enableScheduling', 'startTime', 'endTime', 'scheduledDays'], (result) => {
      const newStorage = {};
      
      // Migrate blockedSites to new format if necessary
      if (Array.isArray(result.blockedSites) && result.blockedSites.every(item => typeof item === 'string')) {
        newStorage.blockedSites = result.blockedSites.map(domain => ({ domain: domain, whitelistedPaths: [] }));
      } else if (!result.blockedSites) {
        newStorage.blockedSites = []; // Initialize as empty array of objects
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
      // Scheduling defaults
      if (typeof result.enableScheduling === 'undefined') {
        newStorage.enableScheduling = false;
      }
      if (typeof result.startTime === 'undefined') {
        newStorage.startTime = '09:00';
      }
      if (typeof result.endTime === 'undefined') {
        newStorage.endTime = '17:00';
      }
      if (typeof result.scheduledDays === 'undefined') {
        newStorage.scheduledDays = ["mon", "tue", "wed", "thu", "fri"];
      }
      // Grace period defaults
      if (typeof result.enableGracePeriod === 'undefined') {
        newStorage.enableGracePeriod = false;
      }
      if (typeof result.gracePeriodDuration === 'undefined') {
        newStorage.gracePeriodDuration = 5;
      }
      // Statistics defaults
      if (typeof result.blockedAttempts === 'undefined') {
        newStorage.blockedAttempts = 0;
      }
      if (typeof result.successfulRedirects === 'undefined') {
        newStorage.successfulRedirects = 0;
      }
      if (Object.keys(newStorage).length > 0) {
        chrome.storage.local.set(newStorage);
      }
    });
  });

  chrome.webNavigation.onBeforeNavigate.addListener(
    (details) => {
      // Check for bypass
      if (bypassedTabs.has(details.tabId) && bypassedTabs.get(details.tabId).has(details.url)) {
        bypassedTabs.get(details.tabId).delete(details.url); // Allow one bypass
        return;
      }

      chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList', 'defaultRedirectSite', 'enableScheduling', 'startTime', 'endTime', 'scheduledDays', 'enableGracePeriod', 'gracePeriodDuration'], (result) => {
        let { blockedSites, redirectSites, popFromList, defaultRedirectSite, enableScheduling, startTime, endTime, scheduledDays, enableGracePeriod, gracePeriodDuration } = result;

        // Ensure blockedSites is in the new format
        if (!Array.isArray(blockedSites) || blockedSites.every(item => typeof item === 'string')) {
          blockedSites = (blockedSites || []).map(domain => ({ domain: domain, whitelistedPaths: [] }));
          // Optionally, save this migrated list back to storage here to persist the new format
          chrome.storage.local.set({ blockedSites: blockedSites });
        }


        // Bypass blocking if scheduling is enabled but not active
        if (enableScheduling && !isSchedulingActive(enableScheduling, startTime, endTime, scheduledDays)) {
          return;
        }

        if (!blockedSites || blockedSites.length === 0) return;

        const currentUrl = new URL(details.url);
        const currentHostname = currentUrl.hostname;
        const currentHref = currentUrl.href;

        for (const blockedSite of blockedSites) {
          try {
            // First, check if the current URL is whitelisted for this blocked domain
            if (blockedSite.whitelistedPaths && blockedSite.whitelistedPaths.length > 0) {
              for (const whitelistedPath of blockedSite.whitelistedPaths) {
                try {
                  const whitelistedUrl = new URL(whitelistedPath);
                  if (currentHostname === whitelistedUrl.hostname) {
                    // Check for exact match or prefix match for whitelisted paths
                    if (whitelistedPath.endsWith('/')) {
                      if (currentHref.startsWith(whitelistedPath)) {
                        console.log(`Whitelisted path match: ${details.url} for ${whitelistedPath}`);
                        return; // Do not block
                      }
                    } else {
                      if (currentHref === whitelistedPath) {
                        console.log(`Whitelisted path match: ${details.url} for ${whitelistedPath}`);
                        return; // Do not block
                      }
                    }
                  }
                } catch (e) {
                  console.warn(`Invalid whitelisted path URL: ${whitelistedPath}`, e);
                  // Treat invalid whitelisted paths as non-matching
                }
              }
            }

            // If not whitelisted, proceed with blocking check
            if (matchesBlockedSite(currentHostname, blockedSite.domain)) {
              let targetRedirectUrl = defaultRedirectSite;
              if (redirectSites && redirectSites.length > 0) {
                const randomIndex = Math.floor(Math.random() * redirectSites.length);
                targetRedirectUrl = redirectSites[randomIndex];

                if (popFromList) {
                  redirectSites.splice(randomIndex, 1);
                  chrome.storage.local.set({ redirectSites: redirectSites });
                }
              }

              if (enableGracePeriod) {
                const gracePeriodPageUrl = chrome.runtime.getURL(`grace_period.html?blockedUrl=${encodeURIComponent(details.url)}&redirectUrl=${encodeURIComponent(targetRedirectUrl)}&duration=${gracePeriodDuration}&tabId=${details.tabId}`);
                chrome.tabs.update(details.tabId, { url: gracePeriodPageUrl });
              } else {
                chrome.tabs.update(details.tabId, { url: targetRedirectUrl });
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
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'bypassBlocking') {
      const { tabId, originalBlockedUrl } = request;
      if (!bypassedTabs.has(tabId)) {
        bypassedTabs.set(tabId, new Set());
      }
      bypassedTabs.get(tabId).add(originalBlockedUrl);
      console.log(`Bypass requested for tab ${tabId} and URL ${originalBlockedUrl}`);
    }
  });
}

// Export for testing (only in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { matchesBlockedSite, isSchedulingActive };
}
