import Foundation
import CoreData

@objc(PomodoroSession)
public class PomodoroSession: NSManagedObject {
    @NSManaged public var id: UUID
    @NSManaged public var taskId: String
    @NSManaged public var taskTitle: String
    @NSManaged public var startTime: Date
    @NSManaged public var endTime: Date?
    @NSManaged public var duration: Int32 // in seconds
    @NSManaged public var completed: Bool
    @NSManaged public var sessionType: String // "work", "shortBreak", "longBreak"
}

extension PomodoroSession: Identifiable {
    public static func fetchRequest() -> NSFetchRequest<PomodoroSession> {
        return NSFetchRequest<PomodoroSession>(entityName: "PomodoroSession")
    }
}

enum SessionType: String {
    case work
    case shortBreak
    case longBreak
}
