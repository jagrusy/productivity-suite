// options.js

document.addEventListener('DOMContentLoaded', () => {
  const newBlockedSiteInput = document.getElementById('new-blocked-site');
  const addBlockedBtn = document.getElementById('add-blocked-btn');
  const blockedSitesList = document.getElementById('blocked-sites-list');

  const newRedirectSiteInput = document.getElementById('new-redirect-site');
  const addRedirectBtn = document.getElementById('add-redirect-btn');
  const redirectSitesList = document.getElementById('redirect-sites-list');


  const popFromListCheckbox = document.getElementById('pop-from-list');
  const defaultRedirectSiteInput = document.getElementById('default-redirect-site');

  // New scheduling elements
  const enableSchedulingCheckbox = document.getElementById('enable-scheduling');
  const schedulingDetailsDiv = document.getElementById('scheduling-details');
  const startTimeInput = document.getElementById('start-time');
  const endTimeInput = document.getElementById('end-time');
  const dayCheckboxes = document.querySelectorAll('.day-checkbox');

  // New statistics elements
  const blockedAttemptsCountSpan = document.getElementById('blocked-attempts-count');
  const successfulRedirectsCountSpan = document.getElementById('successful-redirects-count');
  const resetStatsButton = document.getElementById('reset-stats-button');


  // --- Functions to Render Lists ---

  function renderList(list, container, storageKey, isBlockList = false) {
    container.innerHTML = '';
    list.forEach((item, index) => { // 'item' can be a string (redirectSite) or object (blockedSite)
      const li = document.createElement('li');
      
      const mainText = document.createElement('span');
      mainText.classList.add('list-item-main-text');

      if (isBlockList) {
        mainText.textContent = item.domain;
        li.appendChild(mainText);

        if (item.whitelistedPaths && item.whitelistedPaths.length > 0) {
          const whitelistText = document.createElement('span');
          whitelistText.classList.add('whitelisted-paths-text');
          whitelistText.textContent = ` (Whitelist: ${item.whitelistedPaths.join(', ')})`;
          li.appendChild(whitelistText);
        }
      } else {
        mainText.textContent = item; // redirectSite is a string
        li.appendChild(mainText);
      }

      const buttonsContainer = document.createElement('div');
      buttonsContainer.classList.add('buttons-container');

      if (isBlockList) {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => {
          enterEditMode(li, list, index, container, storageKey, isBlockList);
        });
        buttonsContainer.appendChild(editBtn);
      }

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.classList.add('remove-btn');
      removeBtn.addEventListener('click', () => {
        list.splice(index, 1);
        chrome.storage.local.set({ [storageKey]: list }, () => {
          renderList(list, container, storageKey, isBlockList);
        });
      });
      buttonsContainer.appendChild(removeBtn);

      li.appendChild(buttonsContainer);
      container.appendChild(li);
    });
  }

  function enterEditMode(li, list, index, container, storageKey, isBlockList) {
    const originalItem = { ...list[index] }; // Copy to avoid direct modification
    li.innerHTML = ''; // Clear the list item

    const domainInput = document.createElement('input');
    domainInput.type = 'text';
    domainInput.value = isBlockList ? originalItem.domain : originalItem;
    domainInput.placeholder = isBlockList ? 'e.g., twitter.com' : 'e.g., https://dev.to';

    const whitelistInput = document.createElement('input');
    if (isBlockList) {
      whitelistInput.type = 'text';
      whitelistInput.value = originalItem.whitelistedPaths ? originalItem.whitelistedPaths.join(', ') : '';
      whitelistInput.placeholder = 'Whitelist paths (comma-separated, e.g., /feed, /profile)';
      whitelistInput.style.marginTop = '5px';
    }
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.classList.add('save-btn');
    saveBtn.addEventListener('click', () => {
      const newDomainValue = domainInput.value.trim();
      const newWhitelistValue = whitelistInput.value.trim();

      if (newDomainValue) {
        if (isBlockList) {
          list[index] = {
            domain: newDomainValue,
            whitelistedPaths: newWhitelistValue.split(',').map(p => p.trim()).filter(p => p !== '')
          };
        } else {
          list[index] = newDomainValue;
        }
        chrome.storage.local.set({ [storageKey]: list }, () => {
          renderList(list, container, storageKey, isBlockList);
        });
      }
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.classList.add('cancel-btn');
    cancelBtn.addEventListener('click', () => {
      renderList(list, container, storageKey, isBlockList);
    });
    
    li.appendChild(domainInput);
    if (isBlockList) {
      li.appendChild(whitelistInput);
    }
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);
  }

  // --- Load and Display Lists & Settings ---

  chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList', 'defaultRedirectSite', 'enableScheduling', 'startTime', 'endTime', 'scheduledDays', 'blockedAttempts', 'successfulRedirects'], (result) => {
    // Ensure blockedSites is in the new format for options page rendering
    let blockedSites = result.blockedSites || [];
    if (Array.isArray(blockedSites) && blockedSites.every(item => typeof item === 'string')) {
      blockedSites = blockedSites.map(domain => ({ domain: domain, whitelistedPaths: [] }));
    } else if (!Array.isArray(blockedSites)) {
        blockedSites = [];
    }
    
    const redirectSites = result.redirectSites || [];
    const popFromList = typeof result.popFromList === 'undefined' ? true : result.popFromList;
    const defaultRedirectSite = result.defaultRedirectSite || 'https://tasks.google.com';

    // Scheduling defaults
    const enableScheduling = typeof result.enableScheduling === 'undefined' ? false : result.enableScheduling;
    const startTime = result.startTime || '09:00';
    const endTime = result.endTime || '17:00';
    const scheduledDays = result.scheduledDays || ["mon", "tue", "wed", "thu", "fri"];

    // Statistics defaults
    const blockedAttempts = result.blockedAttempts || 0;
    const successfulRedirects = result.successfulRedirects || 0;

    popFromListCheckbox.checked = popFromList;
    defaultRedirectSiteInput.value = defaultRedirectSite;

    // Set scheduling UI state
    enableSchedulingCheckbox.checked = enableScheduling;
    schedulingDetailsDiv.style.display = enableScheduling ? 'block' : 'none';
    startTimeInput.value = startTime;
    endTimeInput.value = endTime;
    dayCheckboxes.forEach(checkbox => {
      checkbox.checked = scheduledDays.includes(checkbox.value);
    });

    // Set statistics UI state
    blockedAttemptsCountSpan.textContent = blockedAttempts;
    successfulRedirectsCountSpan.textContent = successfulRedirects;


    renderList(blockedSites, blockedSitesList, 'blockedSites', true);
    renderList(redirectSites, redirectSitesList, 'redirectSites', false);


  });

  // --- Event Listeners for Adding Sites ---

  addBlockedBtn.addEventListener('click', () => {
    const newSite = newBlockedSiteInput.value.trim();
    if (newSite) {
      chrome.storage.local.get({ blockedSites: [] }, (result) => {
        let blockedSites = result.blockedSites;
        // Ensure new blocked site is added in the object format
        if (!Array.isArray(blockedSites) || blockedSites.every(item => typeof item === 'string')) {
            blockedSites = blockedSites.map(domain => ({ domain: domain, whitelistedPaths: [] }));
        }

        const domainExists = blockedSites.some(item => item.domain === newSite);
        if (!domainExists) {
          blockedSites.push({ domain: newSite, whitelistedPaths: [] });
          chrome.storage.local.set({ blockedSites }, () => {
            renderList(blockedSites, blockedSitesList, 'blockedSites', true);
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
            renderList(redirectSites, redirectSitesList, 'redirectSites', false);
            newRedirectSiteInput.value = '';
          });
        }
      });
    }
  });

  // --- Event Listeners for General Settings ---

  popFromListCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ popFromList: popFromListCheckbox.checked });
  });

  defaultRedirectSiteInput.addEventListener('change', () => {
    chrome.storage.local.set({ defaultRedirectSite: defaultRedirectSiteInput.value.trim() });
  });

  // --- Event Listeners for Scheduling Settings ---

  enableSchedulingCheckbox.addEventListener('change', () => {
    const isEnabled = enableSchedulingCheckbox.checked;
    schedulingDetailsDiv.style.display = isEnabled ? 'block' : 'none';
    chrome.storage.local.set({ enableScheduling: isEnabled });
  });

  startTimeInput.addEventListener('change', () => {
    chrome.storage.local.set({ startTime: startTimeInput.value });
  });

  endTimeInput.addEventListener('change', () => {
    chrome.storage.local.set({ endTime: endTimeInput.value });
  });

  dayCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      chrome.storage.local.get({ scheduledDays: ["mon", "tue", "wed", "thu", "fri"] }, (result) => {
        let scheduledDays = result.scheduledDays;
        if (checkbox.checked) {
          if (!scheduledDays.includes(checkbox.value)) {
            scheduledDays.push(checkbox.value);
          }
        } else {
          scheduledDays = scheduledDays.filter(day => day !== checkbox.value);
        }
        chrome.storage.local.set({ scheduledDays: scheduledDays });
      });
    });
  });

  // --- Event Listener for Statistics ---

  resetStatsButton.addEventListener('click', () => {
    chrome.storage.local.set({ blockedAttempts: 0, successfulRedirects: 0 }, () => {
      blockedAttemptsCountSpan.textContent = 0;
      successfulRedirectsCountSpan.textContent = 0;
    });
  });
});
