import { chrome } from 'jest-chrome';
import '../background.js';

let onInstalledListener;
let onBeforeNavigateListener;

describe('background.js', () => {
    beforeAll(() => {
        console.log('addListener type:', typeof chrome.runtime.onInstalled.addListener);
        console.log('addListener keys:', Object.keys(chrome.runtime.onInstalled.addListener));
        // Capture the listeners registered by the background script
        // We assume background.js registers one listener for each event
        if (chrome.runtime.onInstalled.addListener.mock) {
            if (chrome.runtime.onInstalled.addListener.mock.calls.length > 0) {
                onInstalledListener = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
            }
        }
        if (chrome.webNavigation.onBeforeNavigate.addListener.mock) {
            if (chrome.webNavigation.onBeforeNavigate.addListener.mock.calls.length > 0) {
                onBeforeNavigateListener = chrome.webNavigation.onBeforeNavigate.addListener.mock.calls[0][0];
            }
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('registers listeners', () => {
        // Since we import at top level, we can't check 'toHaveBeenCalled' here if we clear mocks in beforeEach
        // But we captured them in beforeAll, so we can assert they were captured
        expect(onInstalledListener).toBeDefined();
        expect(onBeforeNavigateListener).toBeDefined();
    });

    describe('onInstalled', () => {
        test('initializes storage with default values if empty', () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({});
            });

            onInstalledListener();

            expect(chrome.storage.local.get).toHaveBeenCalledWith(
                ['blockedSites', 'redirectSites', 'popFromList'],
                expect.any(Function)
            );

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                blockedSites: ['example.com'],
                redirectSites: [],
                popFromList: true,
            });
        });

        test('does not overwrite existing storage', () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({
                    blockedSites: ['twitter.com'],
                    redirectSites: ['dev.to'],
                    popFromList: false,
                });
            });

            onInstalledListener();

            expect(chrome.storage.local.set).not.toHaveBeenCalled();
        });
    });

    describe('onBeforeNavigate', () => {
        test('redirects if site is blocked', () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({
                    blockedSites: ['twitter.com'],
                    redirectSites: ['https://dev.to'],
                    popFromList: false,
                });
            });

            onBeforeNavigateListener({ url: 'https://twitter.com/home', tabId: 1 });

            expect(chrome.tabs.update).toHaveBeenCalledWith(1, { url: 'https://dev.to' });
        });

        test('does not redirect if site is not blocked', () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({
                    blockedSites: ['twitter.com'],
                    redirectSites: ['https://dev.to'],
                    popFromList: false,
                });
            });

            onBeforeNavigateListener({ url: 'https://google.com', tabId: 1 });

            expect(chrome.tabs.update).not.toHaveBeenCalled();
        });

        test('pops from list if enabled', () => {
            const redirectSites = ['https://dev.to', 'https://github.com'];
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({
                    blockedSites: ['twitter.com'],
                    redirectSites: [...redirectSites], // copy
                    popFromList: true,
                });
            });

            jest.spyOn(Math, 'random').mockReturnValue(0);

            onBeforeNavigateListener({ url: 'https://twitter.com', tabId: 1 });

            expect(chrome.tabs.update).toHaveBeenCalledWith(1, { url: 'https://dev.to' });

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                redirectSites: ['https://github.com']
            });
        });

        test('redirects to default if list is empty', () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({
                    blockedSites: ['twitter.com'],
                    redirectSites: [],
                    popFromList: true,
                });
            });

            onBeforeNavigateListener({ url: 'https://twitter.com', tabId: 1 });

            expect(chrome.tabs.update).toHaveBeenCalledWith(1, { url: 'https://tasks.google.com' });
        });
    });
});
