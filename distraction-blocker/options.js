// options.js

document.addEventListener('DOMContentLoaded', () => {
  const newBlockedSiteInput = document.getElementById('new-blocked-site');
  const addBlockedBtn = document.getElementById('add-blocked-btn');
  const blockedSitesList = document.getElementById('blocked-sites-list');

  const newRedirectSiteInput = document.getElementById('new-redirect-site');
  const addRedirectBtn = document.getElementById('add-redirect-btn');
  const redirectSitesList = document.getElementById('redirect-sites-list');
  const suggestionMessage = document.getElementById('suggestion-message');

  // --- Functions to Render Lists ---

  function renderList(list, container, storageKey) {
    container.innerHTML = '';
    list.forEach((site, index) => {
      const li = document.createElement('li');
      li.textContent = site;
      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.classList.add('remove-btn');
      removeBtn.addEventListener('click', () => {
        list.splice(index, 1);
        chrome.storage.local.set({ [storageKey]: list }, () => {
          renderList(list, container, storageKey);
        });
      });

      li.appendChild(removeBtn);
      container.appendChild(li);
    });
  }

  // --- Load and Display Lists ---

  chrome.storage.local.get(['blockedSites', 'redirectSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    const redirectSites = result.redirectSites || [];
    renderList(blockedSites, blockedSitesList, 'blockedSites');
    renderList(redirectSites, redirectSitesList, 'redirectSites');

    // Check for query param and show message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reason') === 'empty_list') {
      suggestionMessage.innerHTML = `
        <p class="suggestion-text">
          Your productive sites list is empty! Add some sites you'd like to be redirected to. 
          Here are some ideas to get you started:
        </p>
        <ul>
          <li><a href="https://dev.to" target="_blank">dev.to</a></li>
          <li><a href="https://news.ycombinator.com" target="_blank">Hacker News</a></li>
          <li><a href="https://stackoverflow.com" target="_blank">Stack Overflow</a></li>
        </ul>
      `;
    }
  });

  // --- Event Listeners for Adding Sites ---

  addBlockedBtn.addEventListener('click', () => {
    const newSite = newBlockedSiteInput.value.trim();
    if (newSite) {
      chrome.storage.local.get({ blockedSites: [] }, (result) => {
        const blockedSites = result.blockedSites;
        if (!blockedSites.includes(newSite)) {
          blockedSites.push(newSite);
          chrome.storage.local.set({ blockedSites }, () => {
            renderList(blockedSites, blockedSitesList, 'blockedSites');
            newBlockedSiteInput.value = '';
          });
        }
      });
    }
  });

  addRedirectBtn.addEventListener('click', () => {
    const newSite = newRedirectSiteInput.value.trim();
    if (newSite) {
      chrome.storage.local.get({ redirectSites: [] }, (result) => {
        const redirectSites = result.redirectSites;
        if (!redirectSites.includes(newSite)) {
          redirectSites.push(newSite);
          chrome.storage.local.set({ redirectSites }, () => {
            renderList(redirectSites, redirectSitesList, 'redirectSites');
            newRedirectSiteInput.value = '';
          });
        }
      });
    }
  });
});
