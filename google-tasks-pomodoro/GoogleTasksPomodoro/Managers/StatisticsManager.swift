import Foundation
import CoreData

class StatisticsManager: ObservableObject {
    static let shared = StatisticsManager()

    private let persistentContainer: NSPersistentContainer

    @Published var sessions: [PomodoroSession] = []

    private init() {
        persistentContainer = NSPersistentContainer(name: "PomodoroModel")

        // Create the Core Data model programmatically
        let model = NSManagedObjectModel()
        let entity = NSEntityDescription()
        entity.name = "PomodoroSession"
        entity.managedObjectClassName = NSStringFromClass(PomodoroSession.self)

        let idAttribute = NSAttributeDescription()
        idAttribute.name = "id"
        idAttribute.type = .uuid

        let taskIdAttribute = NSAttributeDescription()
        taskIdAttribute.name = "taskId"
        taskIdAttribute.type = .string

        let taskTitleAttribute = NSAttributeDescription()
        taskTitleAttribute.name = "taskTitle"
        taskTitleAttribute.type = .string

        let startTimeAttribute = NSAttributeDescription()
        startTimeAttribute.name = "startTime"
        startTimeAttribute.type = .date

        let endTimeAttribute = NSAttributeDescription()
        endTimeAttribute.name = "endTime"
        endTimeAttribute.type = .date
        endTimeAttribute.isOptional = true

        let durationAttribute = NSAttributeDescription()
        durationAttribute.name = "duration"
        durationAttribute.type = .integer32

        let completedAttribute = NSAttributeDescription()
        completedAttribute.name = "completed"
        completedAttribute.type = .boolean

        let sessionTypeAttribute = NSAttributeDescription()
        sessionTypeAttribute.name = "sessionType"
        sessionTypeAttribute.type = .string

        entity.properties = [
            idAttribute,
            taskIdAttribute,
            taskTitleAttribute,
            startTimeAttribute,
            endTimeAttribute,
            durationAttribute,
            completedAttribute,
            sessionTypeAttribute
        ]

        model.entities = [entity]
        persistentContainer.managedObjectModel = model

        persistentContainer.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Core Data failed to load: \(error.localizedDescription)")
            }
        }

        fetchSessions()
    }

    var context: NSManagedObjectContext {
        persistentContainer.viewContext
    }

    // MARK: - CRUD Operations

    func saveSession(
        taskId: String,
        taskTitle: String,
        startTime: Date,
        duration: Int32,
        completed: Bool,
        sessionType: SessionType
    ) {
        let session = PomodoroSession(context: context)
        session.id = UUID()
        session.taskId = taskId
        session.taskTitle = taskTitle
        session.startTime = startTime
        session.endTime = Date()
        session.duration = duration
        session.completed = completed
        session.sessionType = sessionType.rawValue

        do {
            try context.save()
            fetchSessions()
        } catch {
            print("Failed to save session: \(error.localizedDescription)")
        }
    }

    func fetchSessions() {
        let request: NSFetchRequest<PomodoroSession> = PomodoroSession.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \PomodoroSession.startTime, ascending: false)]

        do {
            sessions = try context.fetch(request)
        } catch {
            print("Failed to fetch sessions: \(error.localizedDescription)")
        }
    }

    func deleteSession(_ session: PomodoroSession) {
        context.delete(session)

        do {
            try context.save()
            fetchSessions()
        } catch {
            print("Failed to delete session: \(error.localizedDescription)")
        }
    }

    // MARK: - Statistics

    func totalTimeForTask(_ taskId: String) -> TimeInterval {
        let taskSessions = sessions.filter { $0.taskId == taskId && $0.sessionType == "work" }
        return taskSessions.reduce(0) { $0 + TimeInterval($1.duration) }
    }

    func completedPomodorosForTask(_ taskId: String) -> Int {
        sessions.filter { $0.taskId == taskId && $0.completed && $0.sessionType == "work" }.count
    }

    func completedPomodorosToday() -> Int {
        let today = Calendar.current.startOfDay(for: Date())
        return sessions.filter {
            $0.completed &&
            $0.sessionType == "work" &&
            Calendar.current.isDate($0.startTime, inSameDayAs: today)
        }.count
    }

    func completedPomodorosThisWeek() -> Int {
        let weekAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        return sessions.filter {
            $0.completed &&
            $0.sessionType == "work" &&
            $0.startTime >= weekAgo
        }.count
    }

    func sessionsGroupedByDay() -> [(Date, Int)] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: sessions.filter { $0.completed && $0.sessionType == "work" }) {
            calendar.startOfDay(for: $0.startTime)
        }

        return grouped.map { ($0.key, $0.value.count) }
            .sorted { $0.0 > $1.0 }
    }
}
