# Setup Guide for Google Tasks Pomodoro

Follow these steps to get the app running:

## Step 1: Create Xcode Project

1. Open Xcode
2. Click "Create New Project" (or File > New > Project)
3. Select **macOS** tab, then choose **App**
4. Click **Next**
5. Configure the project:
   - **Product Name**: `GoogleTasksPomodoro`
   - **Team**: Select your Apple Developer account (or leave as "None" for local development)
   - **Organization Identifier**: `com.yourdomain` (or use `com.productivity`)
   - **Bundle Identifier**: Will auto-generate as `com.yourdomain.GoogleTasksPomodoro`
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - **Include Tests**: Unchecked (optional)
6. Click **Next**
7. **Save in**: Navigate to this directory: `/Users/grusy/Documents/repos/productivity-suite/google-tasks-pomodoro`
8. **IMPORTANT**: Uncheck "Create Git repository" (we already have one)
9. Click **Create**

## Step 2: Add Source Files to Xcode Project

1. In Xcode, in the Project Navigator (left sidebar), right-click on the `GoogleTasksPomodoro` folder (blue icon)
2. Select **Add Files to "GoogleTasksPomodoro"...**
3. Navigate to `GoogleTasksPomodoro/Models` folder
4. Select all `.swift` files in Models
5. **Make sure** "Copy items if needed" is **UNCHECKED**
6. **Make sure** "Create groups" is selected
7. Click **Add**
8. Repeat for:
   - `GoogleTasksPomodoro/Views` (all .swift files)
   - `GoogleTasksPomodoro/Services` (all .swift files)
   - `GoogleTasksPomodoro/Managers` (all .swift files)

9. Delete the auto-generated `ContentView.swift` file (we don't need it)

## Step 3: Replace Info.plist

1. In Xcode, select the existing `Info.plist` in the Project Navigator
2. Press Delete, choose "Move to Trash"
3. Right-click on `GoogleTasksPomodoro` folder > **Add Files to "GoogleTasksPomodoro"...**
4. Select the `Info.plist` from `GoogleTasksPomodoro/Resources/`
5. Uncheck "Copy items if needed"
6. Click **Add**

## Step 4: Configure Project Settings

1. Click on the project name (blue icon) in the Project Navigator
2. Select the **GoogleTasksPomodoro** target
3. Go to **Signing & Capabilities** tab
4. Select your development team (or leave as-is for local development)
5. Go to **Info** tab
6. Verify "Custom macOS Application Target Properties" shows:
   - Application is agent (UIElement): YES

## Step 5: Set Up Google OAuth Credentials

### 5.1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click on the project dropdown (top left)
3. Click **NEW PROJECT**
4. Name: `Google Tasks Pomodoro`
5. Click **CREATE**

### 5.2: Enable Google Tasks API

1. In the Google Cloud Console, make sure your new project is selected
2. Go to **APIs & Services** > **Library** (from left menu)
3. Search for "Google Tasks API"
4. Click on it
5. Click **ENABLE**

### 5.3: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted to configure consent screen:
   - Click **CONFIGURE CONSENT SCREEN**
   - Choose **External**
   - Click **CREATE**
   - Fill in:
     - App name: `Google Tasks Pomodoro`
     - User support email: Your email
     - Developer contact: Your email
   - Click **SAVE AND CONTINUE**
   - Skip "Scopes" (click **SAVE AND CONTINUE**)
   - Skip "Test users" (click **SAVE AND CONTINUE**)
   - Click **BACK TO DASHBOARD**

4. Back to **Credentials**, click **CREATE CREDENTIALS** > **OAuth client ID** again
5. Application type: **iOS**
6. Name: `Google Tasks Pomodoro macOS`
7. Bundle ID: `com.yourdomain.GoogleTasksPomodoro` (use the same bundle ID from your Xcode project)
8. Click **CREATE**
9. **IMPORTANT**: Copy your Client ID (looks like: `123456789-abc.apps.googleusercontent.com`)

## Step 6: Configure App with Client ID

1. In Xcode, open `Services/GoogleTasksService.swift`
2. Find line ~15:
   ```swift
   private let clientId = "YOUR_CLIENT_ID"
   ```
3. Replace `YOUR_CLIENT_ID` with your actual Client ID
4. On the next line, update the redirectURI:
   ```swift
   private let redirectURI = "com.googleusercontent.apps.YOUR_CLIENT_ID:/oauth2redirect"
   ```
   Replace `YOUR_CLIENT_ID` with just the first part of your client ID (before `.apps.googleusercontent.com`)

   Example: If your Client ID is `123456789-abc.apps.googleusercontent.com`, use:
   ```swift
   private let redirectURI = "com.googleusercontent.apps.123456789-abc:/oauth2redirect"
   ```

## Step 7: Add URL Scheme

1. In Xcode, select your project (blue icon)
2. Select the **GoogleTasksPomodoro** target
3. Go to **Info** tab
4. Expand **URL Types** section (at the bottom)
5. Click the **+** button
6. Set:
   - **Identifier**: `com.googleusercontent.apps`
   - **URL Schemes**: `com.googleusercontent.apps.YOUR_CLIENT_ID` (using the first part of your Client ID)
   - **Role**: Editor
7. Click outside to save

## Step 8: Build and Run

1. In Xcode, select **My Mac** as the run destination (top toolbar)
2. Press **⌘R** (or click the Play button)
3. The app should build and launch
4. Look for the 🍅 icon in your menu bar
5. Click it and sign in with Google!

## Troubleshooting

**Build errors about missing files:**
- Make sure all .swift files are added to the target (check the File Inspector on the right)

**"No such module" errors:**
- Clean build folder: Product > Clean Build Folder (⇧⌘K)
- Rebuild: ⌘B

**Authentication fails:**
- Double-check your Client ID in GoogleTasksService.swift
- Verify URL scheme matches your Client ID
- Make sure Google Tasks API is enabled in Cloud Console

**App crashes on launch:**
- Check Console.app for error messages
- Verify Info.plist is properly configured
