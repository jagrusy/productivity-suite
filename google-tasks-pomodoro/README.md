# Google Tasks Pomodoro

A macOS menu bar app that integrates Google Tasks with the Pomodoro technique to help you stay focused and track your productivity.

## Features

- **Menu bar integration** - Always accessible from your macOS menu bar
- **Google Tasks sync** - View and manage your Google Tasks directly from the app
- **Pomodoro timer** - Built-in timer with customizable work/break intervals
- **Statistics tracking** - Track time spent and pomodoros completed per task
- **Focus sessions** - Start a Pomodoro for any task with one click
- **Notifications** - Get notified when your timer completes
- **Customizable settings** - Adjust timer durations to fit your workflow

## Requirements

- macOS 12.0 (Monterey) or later
- Xcode 14.0 or later
- Google account with Google Tasks enabled

## Setup Instructions

### 1. Create Google OAuth Credentials

To connect the app to Google Tasks, you need to create OAuth credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Tasks API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Tasks API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "iOS" as the application type
   - Enter a name (e.g., "Google Tasks Pomodoro")
   - Add bundle identifier: `com.yourdomain.GoogleTasksPomodoro`
   - Click "Create"
5. Copy your **Client ID** (it should look like: `123456789-abc.apps.googleusercontent.com`)

### 2. Configure the App

1. Open the project in Xcode:
   ```bash
   cd google-tasks-pomodoro
   open GoogleTasksPomodoro.xcodeproj
   ```

   **Note**: If the `.xcodeproj` file doesn't exist, create a new Xcode project:
   - Open Xcode
   - File > New > Project
   - Choose "macOS" > "App"
   - Product Name: `GoogleTasksPomodoro`
   - Interface: SwiftUI
   - Language: Swift
   - Save in the `google-tasks-pomodoro` directory
   - Add all the `.swift` files from the `GoogleTasksPomodoro/` directory to the project

2. Update the Client ID in `Services/GoogleTasksService.swift`:
   ```swift
   private let clientId = "YOUR_CLIENT_ID" // Replace with your actual Client ID
   private let redirectURI = "com.googleusercontent.apps.YOUR_CLIENT_ID:/oauth2redirect"
   ```

3. Add URL scheme to your Xcode project:
   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Click "+ Capability" and add "Associated Domains" (optional)
   - Go to the "Info" tab
   - Add a URL Type with scheme: `com.googleusercontent.apps.YOUR_CLIENT_ID`

### 3. Build and Run

1. Select your development team in "Signing & Capabilities"
2. Build and run the project (⌘R)
3. The app icon (🍅) should appear in your menu bar
4. Click the icon and sign in with Google

## Usage

### Starting a Pomodoro

1. Click the 🍅 icon in your menu bar
2. Go to the "Tasks" tab
3. Click the play button next to any task
4. The timer will start and appear in the menu bar

### Timer Controls

- **Pause/Resume** - Pause and resume the current session
- **Stop** - Stop the current session completely
- **Skip** - Skip to the next session (break or work)

### Customizing Settings

1. Go to the "Settings" tab
2. Adjust work duration, break duration, and other preferences
3. Settings are saved automatically

### Viewing Statistics

1. Go to the "Stats" tab to see:
   - Pomodoros completed today and this week
   - Time spent per task
   - Recent session history

## Development

### Project Structure

```
GoogleTasksPomodoro/
├── GoogleTasksPomodoroApp.swift   # Main app entry point
├── Models/
│   ├── Task.swift                 # Google Task models
│   ├── PomodoroSession.swift      # Core Data session model
│   └── Settings.swift             # App settings
├── Views/
│   ├── AppDelegate.swift          # Menu bar setup
│   ├── MenuBarView.swift          # Main dropdown panel
│   ├── TaskListView.swift         # Task list display
│   ├── TimerView.swift            # Timer interface
│   ├── SettingsView.swift         # Settings panel
│   └── StatisticsView.swift       # Statistics dashboard
├── Services/
│   ├── GoogleTasksService.swift   # Google Tasks API
│   ├── PomodoroTimer.swift        # Timer engine
│   └── NotificationManager.swift  # Notifications
├── Managers/
│   └── StatisticsManager.swift    # Core Data manager
└── Resources/
    └── Info.plist                 # App configuration
```

### Key Components

- **GoogleTasksService**: Handles OAuth authentication and API calls to Google Tasks
- **PomodoroTimer**: Manages timer state, sessions, and notifications
- **StatisticsManager**: Tracks and persists session data using Core Data
- **AppDelegate**: Sets up the menu bar item and manages the popover

## Troubleshooting

### "Authentication failed" error

- Verify your Client ID is correct in `GoogleTasksService.swift`
- Make sure the URL scheme matches your Client ID
- Check that Google Tasks API is enabled in Google Cloud Console

### Tasks not loading

- Check your internet connection
- Try signing out and signing back in
- Verify you have tasks in your Google Tasks account

### Timer not updating in menu bar

- Make sure the app is running in the foreground
- Check that notifications are enabled in System Settings

## Future Enhancements

Potential features for future versions:

- Google Calendar integration (time blocking)
- Export statistics to CSV
- Keyboard shortcuts for timer control
- Multiple Google account support
- Task estimation before starting
- Daily/weekly goals and streaks
- Sound theme customization
- Floating timer window option

## License

This project is part of the productivity-suite repository.
