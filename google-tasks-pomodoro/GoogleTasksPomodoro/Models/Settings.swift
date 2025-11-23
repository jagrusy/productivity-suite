import Foundation

class AppSettings: ObservableObject {
    static let shared = AppSettings()

    @Published var workDuration: Int {
        didSet {
            UserDefaults.standard.set(workDuration, forKey: "workDuration")
        }
    }

    @Published var shortBreakDuration: Int {
        didSet {
            UserDefaults.standard.set(shortBreakDuration, forKey: "shortBreakDuration")
        }
    }

    @Published var longBreakDuration: Int {
        didSet {
            UserDefaults.standard.set(longBreakDuration, forKey: "longBreakDuration")
        }
    }

    @Published var pomodorosUntilLongBreak: Int {
        didSet {
            UserDefaults.standard.set(pomodorosUntilLongBreak, forKey: "pomodorosUntilLongBreak")
        }
    }

    @Published var autoStartBreaks: Bool {
        didSet {
            UserDefaults.standard.set(autoStartBreaks, forKey: "autoStartBreaks")
        }
    }

    @Published var autoStartPomodoros: Bool {
        didSet {
            UserDefaults.standard.set(autoStartPomodoros, forKey: "autoStartPomodoros")
        }
    }

    @Published var playSound: Bool {
        didSet {
            UserDefaults.standard.set(playSound, forKey: "playSound")
        }
    }

    private init() {
        // Load saved settings or use defaults (25/5/15)
        self.workDuration = UserDefaults.standard.object(forKey: "workDuration") as? Int ?? 25
        self.shortBreakDuration = UserDefaults.standard.object(forKey: "shortBreakDuration") as? Int ?? 5
        self.longBreakDuration = UserDefaults.standard.object(forKey: "longBreakDuration") as? Int ?? 15
        self.pomodorosUntilLongBreak = UserDefaults.standard.object(forKey: "pomodorosUntilLongBreak") as? Int ?? 4
        self.autoStartBreaks = UserDefaults.standard.object(forKey: "autoStartBreaks") as? Bool ?? false
        self.autoStartPomodoros = UserDefaults.standard.object(forKey: "autoStartPomodoros") as? Bool ?? false
        self.playSound = UserDefaults.standard.object(forKey: "playSound") as? Bool ?? true
    }
}
