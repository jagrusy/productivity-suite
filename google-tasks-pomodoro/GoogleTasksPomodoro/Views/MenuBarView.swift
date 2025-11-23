import SwiftUI

struct MenuBarView: View {
    @ObservedObject var tasksService = GoogleTasksService.shared
    @ObservedObject var pomodoroTimer = PomodoroTimer.shared
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("🍅 Google Tasks Pomodoro")
                    .font(.headline)
                Spacer()
                if tasksService.isAuthenticated {
                    Button(action: { tasksService.signOut() }) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))

            Divider()

            // Tab Picker
            Picker("", selection: $selectedTab) {
                Text("Tasks").tag(0)
                Text("Timer").tag(1)
                Text("Stats").tag(2)
                Text("Settings").tag(3)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.top, 8)

            // Content
            TabView(selection: $selectedTab) {
                TaskListView()
                    .tag(0)

                TimerView()
                    .tag(1)

                StatisticsView()
                    .tag(2)

                SettingsView()
                    .tag(3)
            }
            .tabViewStyle(.automatic)

            Divider()

            // Footer
            HStack {
                if let error = tasksService.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .lineLimit(1)
                }
                Spacer()
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color(NSColor.controlBackgroundColor))
        }
        .frame(width: 360, height: 500)
    }
}
