import SwiftUI

struct StatisticsView: View {
    @ObservedObject var statisticsManager = StatisticsManager.shared
    @ObservedObject var tasksService = GoogleTasksService.shared

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Summary Cards
                HStack(spacing: 12) {
                    StatCard(
                        title: "Today",
                        value: "\(statisticsManager.completedPomodorosToday())",
                        icon: "checkmark.circle.fill",
                        color: .green
                    )

                    StatCard(
                        title: "This Week",
                        value: "\(statisticsManager.completedPomodorosThisWeek())",
                        icon: "calendar",
                        color: .blue
                    )
                }
                .padding(.horizontal)

                Divider()

                // Task Breakdown
                VStack(alignment: .leading, spacing: 12) {
                    Text("Time by Task")
                        .font(.headline)
                        .padding(.horizontal)

                    if statisticsManager.sessions.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "chart.bar")
                                .font(.system(size: 40))
                                .foregroundColor(.gray)

                            Text("No data yet")
                                .foregroundColor(.secondary)

                            Text("Complete pomodoros to see statistics here.")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                    } else {
                        ForEach(uniqueTaskIds(), id: \.self) { taskId in
                            TaskStatRow(taskId: taskId)
                        }
                    }
                }

                Divider()

                // Recent Sessions
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recent Sessions")
                        .font(.headline)
                        .padding(.horizontal)

                    ForEach(statisticsManager.sessions.prefix(10)) { session in
                        SessionRow(session: session)
                    }
                }

                Spacer()
            }
            .padding(.vertical)
        }
    }

    private func uniqueTaskIds() -> [String] {
        let taskIds = statisticsManager.sessions
            .filter { $0.sessionType == "work" }
            .map { $0.taskId }

        return Array(Set(taskIds)).sorted()
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text(value)
                .font(.title)
                .bold()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(8)
    }
}

struct TaskStatRow: View {
    let taskId: String
    @ObservedObject var statisticsManager = StatisticsManager.shared

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                if let session = statisticsManager.sessions.first(where: { $0.taskId == taskId }) {
                    Text(session.taskTitle)
                        .font(.subheadline)
                }

                HStack(spacing: 16) {
                    Label("\(statisticsManager.completedPomodorosForTask(taskId))", systemImage: "checkmark.circle")
                        .font(.caption)
                        .foregroundColor(.green)

                    Label(formatDuration(statisticsManager.totalTimeForTask(taskId)), systemImage: "clock")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(8)
        .padding(.horizontal)
    }

    private func formatDuration(_ duration: TimeInterval) -> String {
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

struct SessionRow: View {
    let session: PomodoroSession

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(session.taskTitle)
                    .font(.caption)
                    .bold()

                HStack(spacing: 8) {
                    Text(formatDate(session.startTime))
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if session.completed {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.green)
                    }

                    Text(session.sessionType.capitalized)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            Text("\(session.duration / 60)m")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}
