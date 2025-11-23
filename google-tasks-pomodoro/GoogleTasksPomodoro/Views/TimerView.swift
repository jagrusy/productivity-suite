import SwiftUI

struct TimerView: View {
    @ObservedObject var pomodoroTimer = PomodoroTimer.shared
    @ObservedObject var settings = AppSettings.shared

    var body: some View {
        VStack(spacing: 20) {
            if let task = pomodoroTimer.currentTask {
                // Current task
                VStack(spacing: 8) {
                    Text("Working on:")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(task.title)
                        .font(.headline)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 20)

                // Session type indicator
                HStack {
                    Circle()
                        .fill(sessionTypeColor())
                        .frame(width: 10, height: 10)

                    Text(sessionTypeText())
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                // Timer display
                Text(pomodoroTimer.formattedTime())
                    .font(.system(size: 72, weight: .light, design: .monospaced))
                    .padding()

                // Progress ring
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                        .frame(width: 200, height: 200)

                    Circle()
                        .trim(from: 0, to: progress())
                        .stroke(sessionTypeColor(), style: StrokeStyle(lineWidth: 8, lineCap: .round))
                        .frame(width: 200, height: 200)
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 1), value: progress())
                }

                // Controls
                HStack(spacing: 20) {
                    if pomodoroTimer.isRunning && !pomodoroTimer.isPaused {
                        Button(action: { pomodoroTimer.pause() }) {
                            Label("Pause", systemImage: "pause.circle.fill")
                                .font(.title2)
                        }
                        .buttonStyle(.plain)
                    } else if pomodoroTimer.isPaused {
                        Button(action: { pomodoroTimer.resume() }) {
                            Label("Resume", systemImage: "play.circle.fill")
                                .font(.title2)
                        }
                        .buttonStyle(.plain)
                    }

                    Button(action: { pomodoroTimer.stop() }) {
                        Label("Stop", systemImage: "stop.circle.fill")
                            .font(.title2)
                            .foregroundColor(.red)
                    }
                    .buttonStyle(.plain)

                    Button(action: { pomodoroTimer.skip() }) {
                        Label("Skip", systemImage: "forward.circle.fill")
                            .font(.title2)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.bottom, 20)

                // Pomodoro count
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Completed today: \(pomodoroTimer.completedPomodoros)")
                        .font(.caption)
                }

            } else {
                // No active timer
                VStack(spacing: 20) {
                    Image(systemName: "timer")
                        .font(.system(size: 60))
                        .foregroundColor(.gray)

                    Text("No Active Timer")
                        .font(.title2)

                    Text("Select a task from the Tasks tab and click play to start a Pomodoro.")
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                }
                .padding()
            }

            Spacer()
        }
    }

    private func progress() -> CGFloat {
        let totalSeconds: Int
        switch pomodoroTimer.currentSessionType {
        case .work:
            totalSeconds = settings.workDuration * 60
        case .shortBreak:
            totalSeconds = settings.shortBreakDuration * 60
        case .longBreak:
            totalSeconds = settings.longBreakDuration * 60
        }

        guard totalSeconds > 0 else { return 0 }
        return CGFloat(totalSeconds - pomodoroTimer.remainingSeconds) / CGFloat(totalSeconds)
    }

    private func sessionTypeColor() -> Color {
        switch pomodoroTimer.currentSessionType {
        case .work:
            return .red
        case .shortBreak:
            return .green
        case .longBreak:
            return .blue
        }
    }

    private func sessionTypeText() -> String {
        switch pomodoroTimer.currentSessionType {
        case .work:
            return "Focus Session"
        case .shortBreak:
            return "Short Break"
        case .longBreak:
            return "Long Break"
        }
    }
}
