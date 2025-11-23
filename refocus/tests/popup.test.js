
describe('popup.js', () => {
    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = `
      <p id="current-site"></p>
      <button id="add-to-blocked">Add to Blocklist</button>
      <button id="add-to-redirect">Add to Focus List</button>
    `;
        jest.clearAllMocks();
    });

    test('initializes with current site info', () => {
        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ url: 'https://example.com/page' }]);
        });

        require('../popup.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const currentSiteP = document.getElementById('current-site');
        expect(currentSiteP.textContent).toBe('Current site: example.com');
    });

    test('disables buttons if no active tab', () => {
        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([]);
        });

        require('../popup.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const blockedBtn = document.getElementById('add-to-blocked');
        const redirectBtn = document.getElementById('add-to-redirect');

        expect(blockedBtn.disabled).toBe(true);
        expect(redirectBtn.disabled).toBe(true);
    });

    test('adds site to blocklist', () => {
        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ url: 'https://bad-site.com' }]);
        });

        require('../popup.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const blockedBtn = document.getElementById('add-to-blocked');

        // Mock storage get/set
        chrome.storage.local.get.mockImplementation((defaults, callback) => {
            callback({ blockedSites: [] });
        });

        blockedBtn.click();

        expect(chrome.storage.local.set).toHaveBeenCalledWith(
            { blockedSites: ['bad-site.com'] },
            expect.any(Function)
        );
    });

    test('adds site to focus list', () => {
        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ url: 'https://good-site.com' }]);
        });

        require('../popup.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const redirectBtn = document.getElementById('add-to-redirect');

        chrome.storage.local.get.mockImplementation((defaults, callback) => {
            callback({ redirectSites: [] });
        });

        redirectBtn.click();

        expect(chrome.storage.local.set).toHaveBeenCalledWith(
            { redirectSites: ['https://good-site.com'] },
            expect.any(Function)
        );
    });
});
