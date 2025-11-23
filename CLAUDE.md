# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReFocus is a Chrome Extension (Manifest V3) that helps users stay focused by redirecting from distracting websites to a curated list of productive sites.

## Development Commands

### Testing
```bash
cd refocus && npm test
```

### Building for Distribution
```bash
cd refocus && npm run build
```
Creates `extension.zip` excluding dev dependencies, tests, and git files.

### Loading in Chrome for Development
1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `refocus` directory
5. After code changes, click the reload icon for the extension

## Architecture

### Core Components

**background.js** (Service Worker)
- Listens for navigation events via `chrome.webNavigation.onBeforeNavigate`
- Implements wildcard pattern matching for blocked sites (supports `*.domain.com` patterns)
- Handles redirect logic: randomly selects from productive sites list, or falls back to default redirect site
- Optional "pop from list" behavior removes sites after use
- Storage: `blockedSites`, `redirectSites`, `popFromList`, `defaultRedirectSite`

**popup.js** (Extension Popup UI)
- Allows quick blocking of current site (stores hostname only)
- Allows adding current site URL to productive list (stores full URL)
- Displays current hostname and button states

**options.js** (Settings Page)
- Manages blocked sites list with edit/remove functionality (block list items are editable)
- Manages productive sites list with remove functionality
- Controls "pop from list" setting (removes sites from productive list after redirecting)
- Configures default redirect site (used when productive list is empty)
- URL query parameter `?reason=empty_list` triggers suggestion message

### Key Technical Details

**Wildcard Matching**: The `matchesBlockedSite()` function in background.js supports both exact hostname matches and wildcard patterns (e.g., `*.google.com` matches `mail.google.com`, `drive.google.com`, etc.).

**Hostname vs URL Storage**: Blocked sites store hostnames only (e.g., `example.com`), while productive sites store full URLs for precise redirection.

**Manifest V3**: Uses service worker instead of background page. Background script specified as `"type": "module"` in manifest.json.

## Test Configuration

Jest is configured with:
- jsdom environment for DOM testing
- Babel transform for ES6+ syntax
- Test files expected in `tests/**/*.test.js` (note: no test files currently exist)
- Chrome API mocking via jest-chrome (configured in jest.setup.js)
