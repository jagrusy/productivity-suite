#!/bin/bash

echo "=========================================="
echo "Google Tasks Pomodoro - Setup Helper"
echo "=========================================="
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the App Store."
    exit 1
fi

echo "✅ Xcode is installed"
echo ""

# Check if project already exists
if [ -d "GoogleTasksPomodoro.xcodeproj" ]; then
    echo "✅ Xcode project already exists"
    echo ""
    echo "Opening project in Xcode..."
    open GoogleTasksPomodoro.xcodeproj
    echo ""
    echo "📝 Next steps:"
    echo "   1. Configure your Google Client ID in Services/GoogleTasksService.swift"
    echo "   2. Add URL scheme in project settings"
    echo "   3. Build and run (⌘R)"
    echo ""
    echo "See SETUP.md for detailed instructions"
else
    echo "📋 Xcode project not found. You need to create it manually."
    echo ""
    echo "Follow these steps:"
    echo ""
    echo "1. Open Xcode"
    echo "2. Create New Project > macOS > App"
    echo "3. Settings:"
    echo "   - Product Name: GoogleTasksPomodoro"
    echo "   - Interface: SwiftUI"
    echo "   - Language: Swift"
    echo "   - Save Location: $(pwd)"
    echo "   - ⚠️  UNCHECK 'Create Git repository'"
    echo ""
    echo "4. Then run this script again"
    echo ""
    read -p "Press Enter to open Xcode..."
    open -a Xcode
    echo ""
    echo "📖 For complete setup instructions, see SETUP.md"
fi

echo ""
echo "=========================================="
echo "Need Google OAuth credentials?"
echo "=========================================="
echo ""
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create new project or select existing"
echo "3. Enable 'Google Tasks API'"
echo "4. Create OAuth client ID (iOS type)"
echo "5. Copy the Client ID"
echo ""
echo "📖 Detailed instructions in SETUP.md"
echo ""
