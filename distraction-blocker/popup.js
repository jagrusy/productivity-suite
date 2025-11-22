// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const blockedBtn = document.getElementById('add-to-blocked');
  const redirectBtn = document.getElementById('add-to-redirect');
  const currentSiteP = document.getElementById('current-site');
  let currentHost = '';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      currentHost = url.hostname;
      currentSiteP.textContent = `Current site: ${currentHost}`;
    } else {
        blockedBtn.disabled = true;
        redirectBtn.disabled = true;
    }
  });

  blockedBtn.addEventListener('click', () => {
    if (currentHost) {
      chrome.storage.local.get({ blockedSites: [] }, (result) => {
        const blockedSites = result.blockedSites;
        if (!blockedSites.includes(currentHost)) {
          blockedSites.push(currentHost);
          chrome.storage.local.set({ blockedSites }, () => {
            blockedBtn.textContent = 'Site Blocked!';
            blockedBtn.disabled = true;
          });
        } else {
            blockedBtn.textContent = 'Already Blocked';
            blockedBtn.disabled = true;
        }
      });
    }
  });

  redirectBtn.addEventListener('click', () => {
    if (currentHost) {
        chrome.storage.local.get({ redirectSites: [] }, (result) => {
            const redirectSites = result.redirectSites;
            if (!redirectSites.includes(currentHost)) {
                redirectSites.push(currentHost);
                chrome.storage.local.set({ redirectSites }, () => {
                    redirectBtn.textContent = 'Site Added!';
                    redirectBtn.disabled = true;
                });
            } else {
                redirectBtn.textContent = 'Already Added';
                redirectBtn.disabled = true;
            }
        });
    }
  });
});
