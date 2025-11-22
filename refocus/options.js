// options.js

document.addEventListener('DOMContentLoaded', () => {
  const newBlockedSiteInput = document.getElementById('new-blocked-site');
  const addBlockedBtn = document.getElementById('add-blocked-btn');
  const blockedSitesList = document.getElementById('blocked-sites-list');

  const newRedirectSiteInput = document.getElementById('new-redirect-site');
  const addRedirectBtn = document.getElementById('add-redirect-btn');
  const redirectSitesList = document.getElementById('redirect-sites-list');
  const suggestionMessage = document.getElementById('suggestion-message');

  const popFromListCheckbox = document.getElementById('pop-from-list');

  // --- Functions to Render Lists ---

  function renderList(list, container, storageKey, isBlockList = false) {
    container.innerHTML = '';
    list.forEach((site, index) => {
      const li = document.createElement('li');
      
      const siteText = document.createElement('span');
      siteText.textContent = site;
      li.appendChild(siteText);

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
    const originalText = list[index];
    li.innerHTML = ''; // Clear the list item

    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.classList.add('save-btn');
    saveBtn.addEventListener('click', () => {
      const newValue = input.value.trim();
      if (newValue) {
        list[index] = newValue;
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
    
    li.appendChild(input);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);
  }

  // --- Load and Display Lists & Settings ---

  chrome.storage.local.get(['blockedSites', 'redirectSites', 'popFromList'], (result) => {
    const blockedSites = result.blockedSites || [];
    const redirectSites = result.redirectSites || [];
    const popFromList = typeof result.popFromList === 'undefined' ? true : result.popFromList;

    popFromListCheckbox.checked = popFromList;

    renderList(blockedSites, blockedSitesList, 'blockedSites', true);
    renderList(redirectSites, redirectSitesList, 'redirectSites', false);

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

  // --- Event Listener for Settings ---

  popFromListCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ popFromList: popFromListCheckbox.checked });
  });
});
