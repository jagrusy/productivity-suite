import Foundation
import Combine

class PomodoroTimer: ObservableObject {
    static let shared = PomodoroTimer()

    @Published var isRunning = false
    @Published var isPaused = false
    @Published var remainingSeconds = 0
    @Published var currentTask: GoogleTask?
    @Published var currentSessionType: SessionType = .work
    @Published var completedPomodoros = 0

    private var timer: Timer?
    private var startTime: Date?
    private let settings = AppSettings.shared
    private let statisticsManager = StatisticsManager.shared

    private init() {}

    // MARK: - Timer Control

    func startPomodoro(for task: GoogleTask) {
        currentTask = task
        currentSessionType = .work
        remainingSeconds = settings.workDuration * 60
        startTimer()
    }

    func startBreak() {
        let isLongBreak = (completedPomodoros % settings.pomodorosUntilLongBreak) == 0 && completedPomodoros > 0
        currentSessionType = isLongBreak ? .longBreak : .shortBreak

        remainingSeconds = isLongBreak
            ? settings.longBreakDuration * 60
            : settings.shortBreakDuration * 60

        startTimer()
    }

    private func startTimer() {
        isRunning = true
        isPaused = false
        startTime = Date()

        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.tick()
        }

        NotificationCenter.default.post(name: NSNotification.Name("PomodoroStateChanged"), object: nil)
    }

    func pause() {
        isPaused = true
        timer?.invalidate()
        timer = nil
        NotificationCenter.default.post(name: NSNotification.Name("PomodoroStateChanged"), object: nil)
    }

    func resume() {
        if isPaused {
            isPaused = false
            startTimer()
        }
    }

    func stop() {
        isRunning = false
        isPaused = false
        timer?.invalidate()
        timer = nil
        remainingSeconds = 0

        // Save incomplete session if it was a work session
        if currentSessionType == .work, let task = currentTask, let start = startTime {
            let duration = Int32(Date().timeIntervalSince(start))
            statisticsManager.saveSession(
                taskId: task.id,
                taskTitle: task.title,
                startTime: start,
                duration: duration,
                completed: false,
                sessionType: currentSessionType
            )
        }

        currentTask = nil
        startTime = nil
        NotificationCenter.default.post(name: NSNotification.Name("PomodoroStateChanged"), object: nil)
    }

    func skip() {
        completeCurrentSession()
    }

    // MARK: - Timer Logic

    private func tick() {
        if remainingSeconds > 0 {
            remainingSeconds -= 1
        } else {
            completeCurrentSession()
        }

        // Update menu bar icon
        NotificationCenter.default.post(name: NSNotification.Name("PomodoroStateChanged"), object: nil)
    }

    private func completeCurrentSession() {
        timer?.invalidate()
        timer = nil

        // Save completed session
        if let task = currentTask, let start = startTime {
            let duration = currentSessionType == .work
                ? Int32(settings.workDuration * 60)
                : (currentSessionType == .shortBreak
                    ? Int32(settings.shortBreakDuration * 60)
                    : Int32(settings.longBreakDuration * 60))

            statisticsManager.saveSession(
                taskId: task.id,
                taskTitle: task.title,
                startTime: start,
                duration: duration,
                completed: true,
                sessionType: currentSessionType
            )
        }

        // Send notification
        let notificationMessage: String
        switch currentSessionType {
        case .work:
            completedPomodoros += 1
            notificationMessage = "Pomodoro completed! Time for a break."
        case .shortBreak:
            notificationMessage = "Break finished! Ready to focus?"
        case .longBreak:
            notificationMessage = "Long break finished! Ready for another session?"
        }

        NotificationManager.shared.sendNotification(
            title: "Pomodoro Timer",
            body: notificationMessage
        )

        // Handle auto-start
        if currentSessionType == .work && settings.autoStartBreaks {
            startBreak()
        } else if currentSessionType != .work && settings.autoStartPomodoros {
            if let task = currentTask {
                startPomodoro(for: task)
            }
        } else {
            isRunning = false
            isPaused = false
            remainingSeconds = 0
            NotificationCenter.default.post(name: NSNotification.Name("PomodoroStateChanged"), object: nil)
        }
    }

    // MARK: - Helpers

    func formattedTime() -> String {
        let minutes = remainingSeconds / 60
        let seconds = remainingSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    func resetCompletedPomodoros() {
        completedPomodoros = 0
    }
}
