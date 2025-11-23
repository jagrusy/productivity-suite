import SwiftUI

struct SettingsView: View {
    @ObservedObject var settings = AppSettings.shared

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Timer Durations
                VStack(alignment: .leading, spacing: 12) {
                    Text("Timer Durations")
                        .font(.headline)

                    HStack {
                        Text("Work:")
                            .frame(width: 100, alignment: .leading)
                        Stepper("\(settings.workDuration) min", value: $settings.workDuration, in: 1...60)
                    }

                    HStack {
                        Text("Short Break:")
                            .frame(width: 100, alignment: .leading)
                        Stepper("\(settings.shortBreakDuration) min", value: $settings.shortBreakDuration, in: 1...30)
                    }

                    HStack {
                        Text("Long Break:")
                            .frame(width: 100, alignment: .leading)
                        Stepper("\(settings.longBreakDuration) min", value: $settings.longBreakDuration, in: 1...60)
                    }

                    HStack {
                        Text("Long break after:")
                            .frame(width: 150, alignment: .leading)
                        Stepper("\(settings.pomodorosUntilLongBreak) pomodoros", value: $settings.pomodorosUntilLongBreak, in: 2...10)
                    }
                }

                Divider()

                // Auto-start Options
                VStack(alignment: .leading, spacing: 12) {
                    Text("Auto-start")
                        .font(.headline)

                    Toggle("Auto-start breaks", isOn: $settings.autoStartBreaks)
                    Toggle("Auto-start pomodoros", isOn: $settings.autoStartPomodoros)
                }

                Divider()

                // Notifications
                VStack(alignment: .leading, spacing: 12) {
                    Text("Notifications")
                        .font(.headline)

                    Toggle("Play sound", isOn: $settings.playSound)
                }

                Divider()

                // Reset to Defaults
                Button(action: resetToDefaults) {
                    Text("Reset to Defaults (25/5/15)")
                        .foregroundColor(.blue)
                }
                .buttonStyle(.plain)

                Spacer()
            }
            .padding()
        }
    }

    private func resetToDefaults() {
        settings.workDuration = 25
        settings.shortBreakDuration = 5
        settings.longBreakDuration = 15
        settings.pomodorosUntilLongBreak = 4
        settings.autoStartBreaks = false
        settings.autoStartPomodoros = false
        settings.playSound = true
    }
}
