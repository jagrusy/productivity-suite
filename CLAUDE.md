# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a productivity suite with two main applications:

1. **ReFocus** - Chrome Extension (Manifest V3) that redirects from distracting websites to productive ones
2. **Google Tasks Pomodoro** - macOS menu bar app integrating Google Tasks with Pomodoro timer and statistics tracking

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

---

# Google Tasks Pomodoro (macOS App)

## Development Commands

### Building and Running
Open in Xcode and build/run (⌘R):
```bash
cd google-tasks-pomodoro
open GoogleTasksPomodoro.xcodeproj  # If project exists
```

**Note**: Project requires manual Xcode setup on first run - see google-tasks-pomodoro/README.md for full setup instructions.

## Architecture

### Core Components

**GoogleTasksPomodoroApp.swift** - Main app entry point using SwiftUI App lifecycle with NSApplicationDelegate for menu bar integration.

**AppDelegate** (Views/AppDelegate.swift)
- Creates and manages NSStatusItem in menu bar
- Updates menu bar icon/text based on timer state (shows countdown when running, 🍅 when idle)
- Manages popover presentation for main UI
- Observes `PomodoroStateChanged` notifications to update display

**Data Models**
- `GoogleTask`: Represents tasks from Google Tasks API (status: needsAction/completed)
- `PomodoroSession`: Core Data entity tracking work sessions, breaks, duration, completion status
- `AppSettings`: UserDefaults-backed settings (work/break durations, auto-start options)

**Services Layer**
- `GoogleTasksService`: OAuth 2.0 authentication with Google, fetches/updates tasks via REST API
- `PomodoroTimer`: Timer engine managing work/break sessions, publishes state changes via Combine
- `NotificationManager`: macOS UserNotifications for timer completion alerts

**StatisticsManager** (Managers/)
- Core Data persistence for PomodoroSession entities
- Programmatic Core Data model creation (no .xcdatamodeld file)
- Provides aggregated statistics: total time per task, pomodoros completed, daily/weekly counts

**UI Views (SwiftUI)**
- `MenuBarView`: Tab-based main interface (Tasks, Timer, Stats, Settings)
- `TaskListView`: Displays Google Tasks with "Start" buttons, handles OAuth flow
- `TimerView`: Shows active timer with progress ring, controls (pause/resume/stop/skip)
- `SettingsView`: Customizable durations and auto-start preferences
- `StatisticsView`: Summary cards and per-task breakdowns

### Key Technical Details

**Menu Bar Integration**: Uses NSStatusItem with NSPopover for dropdown UI. The app is "LSUIElement" (agent app) so it doesn't show in Dock.

**OAuth Flow**: Uses ASWebAuthenticationSession for Google OAuth. Requires client ID configuration in GoogleTasksService.swift and URL scheme registration in Xcode.

**Timer State Management**: PomodoroTimer is a singleton (@ObservedObject) shared across views. Publishes updates via Combine and NotificationCenter.

**Session Tracking**: Work sessions are saved to Core Data when completed or stopped. Breaks are tracked but primarily for statistics, not linked to specific tasks.

**Statistics Calculation**: Filters sessions by `sessionType == "work"` for task-specific stats. Supports grouping by day for trend analysis.
