// grace_period.js

document.addEventListener('DOMContentLoaded', () => {
  const countdownElement = document.getElementById('countdown');
  const bypassButton = document.getElementById('bypass-button');
  const blockedUrlElement = document.getElementById('blocked-url');
  const redirectUrlLink = document.getElementById('redirect-url-link');

  const urlParams = new URLSearchParams(window.location.search);
  const blockedUrl = urlParams.get('blockedUrl');
  const redirectUrl = urlParams.get('redirectUrl');
  let duration = parseInt(urlParams.get('duration') || '5', 10);
  const tabId = parseInt(urlParams.get('tabId'), 10);

  blockedUrlElement.textContent = blockedUrl;
  redirectUrlLink.textContent = redirectUrl;
  redirectUrlLink.href = redirectUrl;

  let countdownInterval;

  function updateCountdown() {
    countdownElement.textContent = duration;
    if (duration <= 0) {
      clearInterval(countdownInterval);
      chrome.tabs.update(tabId, { url: redirectUrl });
    }
    duration--;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);

  bypassButton.addEventListener('click', () => {
    clearInterval(countdownInterval);
    // Send a message to the background script to bypass blocking for this tab/URL
    chrome.runtime.sendMessage({
      action: 'bypassBlocking',
      tabId: tabId,
      originalBlockedUrl: blockedUrl
    });
    // Redirect to the original blocked URL
    chrome.tabs.update(tabId, { url: blockedUrl });
  });
});
