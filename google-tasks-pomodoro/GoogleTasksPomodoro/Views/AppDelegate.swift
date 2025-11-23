import SwiftUI
import AppKit

class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem?
    private var popover: NSPopover?

    @ObservedObject var pomodoroTimer = PomodoroTimer.shared
    @ObservedObject var tasksService = GoogleTasksService.shared

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create the status item in the menu bar
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        if let button = statusItem?.button {
            updateStatusBarIcon()
            button.action = #selector(togglePopover)
            button.target = self
        }

        // Create the popover
        let popover = NSPopover()
        popover.contentSize = NSSize(width: 360, height: 500)
        popover.behavior = .transient
        popover.contentViewController = NSHostingController(rootView: MenuBarView())
        self.popover = popover

        // Observe timer state changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(updateStatusBarIcon),
            name: NSNotification.Name("PomodoroStateChanged"),
            object: nil
        )

        // Request notification permissions
        NotificationManager.shared.requestAuthorization()
    }

    @objc func togglePopover() {
        if let popover = popover {
            if popover.isShown {
                popover.performClose(nil)
            } else {
                if let button = statusItem?.button {
                    popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
                }
            }
        }
    }

    @objc func updateStatusBarIcon() {
        guard let button = statusItem?.button else { return }

        let timer = PomodoroTimer.shared

        if timer.isRunning {
            let minutes = timer.remainingSeconds / 60
            let seconds = timer.remainingSeconds % 60
            button.title = String(format: "%02d:%02d", minutes, seconds)
        } else {
            button.title = "🍅"
        }
    }
}
