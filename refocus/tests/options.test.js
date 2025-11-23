
describe('options.js', () => {
    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = `
      <input type="text" id="new-blocked-site">
      <button id="add-blocked-btn">Add</button>
      <ul id="blocked-sites-list"></ul>

      <input type="text" id="new-redirect-site">
      <button id="add-redirect-btn">Add</button>
      <ul id="redirect-sites-list"></ul>
      <div id="suggestion-message"></div>

      <input type="checkbox" id="pop-from-list">
      <input type="url" id="default-redirect-site">
    `;
        jest.clearAllMocks();
    });

    test('loads and displays lists', () => {
        chrome.storage.local.get.mockImplementation((keys, callback) => {
            callback({
                blockedSites: ['blocked.com'],
                redirectSites: ['good.com'],
                popFromList: true,
                defaultRedirectSite: 'https://tasks.google.com'
            });
        });

        require('../options.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const blockedList = document.getElementById('blocked-sites-list');
        const redirectList = document.getElementById('redirect-sites-list');
        const checkbox = document.getElementById('pop-from-list');

        expect(blockedList.children.length).toBe(1);
        expect(blockedList.textContent).toContain('blocked.com');
        expect(redirectList.children.length).toBe(1);
        expect(redirectList.textContent).toContain('good.com');
        expect(checkbox.checked).toBe(true);
    });

    test('adds a new blocked site', () => {
        chrome.storage.local.get.mockImplementation((keys, callback) => {
            // First call is initial load, second is inside the click handler
            if (keys.blockedSites) {
                // This is the call inside the click handler
                callback({ blockedSites: ['existing.com'] });
            } else {
                // Initial load
                callback({
                    blockedSites: ['existing.com'],
                    redirectSites: [],
                    popFromList: true,
                    defaultRedirectSite: ''
                });
            }
        });

        require('../options.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const input = document.getElementById('new-blocked-site');
        const btn = document.getElementById('add-blocked-btn');

        input.value = 'new-blocked.com';
        btn.click();

        expect(chrome.storage.local.set).toHaveBeenCalledWith(
            { blockedSites: ['existing.com', 'new-blocked.com'] },
            expect.any(Function)
        );
    });

    test('removes a site', () => {
        // Setup initial state with one item
        chrome.storage.local.get.mockImplementation((keys, callback) => {
            callback({
                blockedSites: ['to-be-removed.com'],
                redirectSites: [],
                popFromList: true,
                defaultRedirectSite: ''
            });
        });

        require('../options.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const blockedList = document.getElementById('blocked-sites-list');
        const removeBtn = blockedList.querySelector('.remove-btn');

        expect(removeBtn).not.toBeNull();

        removeBtn.click();

        expect(chrome.storage.local.set).toHaveBeenCalledWith(
            { blockedSites: [] },
            expect.any(Function)
        );
    });
});
