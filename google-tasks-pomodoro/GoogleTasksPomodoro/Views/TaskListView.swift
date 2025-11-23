import SwiftUI

struct TaskListView: View {
    @ObservedObject var tasksService = GoogleTasksService.shared
    @ObservedObject var pomodoroTimer = PomodoroTimer.shared

    var body: some View {
        VStack {
            if !tasksService.isAuthenticated {
                // Not authenticated
                VStack(spacing: 20) {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)

                    Text("Connect Google Tasks")
                        .font(.title2)

                    Text("Sign in to access your tasks and start tracking time with Pomodoro.")
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)
                        .padding(.horizontal)

                    Button("Sign In with Google") {
                        tasksService.authenticate()
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
            } else if tasksService.isLoading {
                // Loading
                VStack {
                    ProgressView()
                    Text("Loading tasks...")
                        .foregroundColor(.secondary)
                }
            } else if tasksService.tasks.isEmpty {
                // No tasks
                VStack(spacing: 16) {
                    Image(systemName: "checklist")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)

                    Text("No tasks found")
                        .font(.title3)

                    Text("Create tasks in Google Tasks to see them here.")
                        .multilineTextAlignment(.center)
                        .foregroundColor(.secondary)

                    Button("Refresh") {
                        if let firstList = tasksService.taskLists.first {
                            tasksService.fetchTasks(from: firstList.id)
                        } else {
                            tasksService.fetchTaskLists()
                        }
                    }
                }
                .padding()
            } else {
                // Task list
                ScrollView {
                    VStack(spacing: 8) {
                        // Task list selector
                        if tasksService.taskLists.count > 1 {
                            Picker("List", selection: Binding(
                                get: { tasksService.taskLists.first?.id ?? "" },
                                set: { newValue in
                                    tasksService.fetchTasks(from: newValue)
                                }
                            )) {
                                ForEach(tasksService.taskLists) { list in
                                    Text(list.title).tag(list.id)
                                }
                            }
                            .pickerStyle(.menu)
                            .padding(.horizontal)
                        }

                        ForEach(tasksService.tasks) { task in
                            TaskRowView(task: task)
                        }
                    }
                    .padding(.vertical)
                }

                // Refresh button
                HStack {
                    Button(action: {
                        if let firstList = tasksService.taskLists.first {
                            tasksService.fetchTasks(from: firstList.id)
                        }
                    }) {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                    .buttonStyle(.plain)
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.bottom, 8)
            }
        }
    }
}

struct TaskRowView: View {
    let task: GoogleTask
    @ObservedObject var pomodoroTimer = PomodoroTimer.shared
    @ObservedObject var statisticsManager = StatisticsManager.shared
    @ObservedObject var tasksService = GoogleTasksService.shared

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(task.title)
                        .font(.headline)

                    HStack(spacing: 12) {
                        if let due = task.due {
                            Label(formatDate(due), systemImage: "calendar")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        let completedPomodoros = statisticsManager.completedPomodorosForTask(task.id)
                        if completedPomodoros > 0 {
                            Label("\(completedPomodoros) 🍅", systemImage: "checkmark.circle")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                    }
                }

                Spacer()

                if pomodoroTimer.isRunning && pomodoroTimer.currentTask?.id == task.id {
                    // Currently running on this task
                    VStack {
                        Text(pomodoroTimer.formattedTime())
                            .font(.system(.body, design: .monospaced))
                            .foregroundColor(.blue)
                    }
                } else {
                    // Start button
                    Button(action: {
                        pomodoroTimer.startPomodoro(for: task)
                    }) {
                        Image(systemName: "play.circle.fill")
                            .font(.title2)
                    }
                    .buttonStyle(.plain)
                    .disabled(pomodoroTimer.isRunning)
                }
            }

            // Complete button
            Button(action: {
                tasksService.completeTask(task)
            }) {
                Text("Mark Complete")
                    .font(.caption)
                    .foregroundColor(.blue)
            }
            .buttonStyle(.plain)
        }
        .padding()
        .background(Color(NSColor.controlBackgroundColor))
        .cornerRadius(8)
        .padding(.horizontal)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: date)
    }
}
