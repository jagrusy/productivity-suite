import Foundation

struct GoogleTask: Identifiable, Codable {
    let id: String
    var title: String
    var notes: String?
    var status: TaskStatus
    var due: Date?
    var updated: Date
    var listId: String

    enum TaskStatus: String, Codable {
        case needsAction = "needsAction"
        case completed = "completed"
    }

    // For Google Tasks API compatibility
    enum CodingKeys: String, CodingKey {
        case id, title, notes, status, due, updated
        case listId = "list_id"
    }
}

struct TaskList: Identifiable, Codable {
    let id: String
    var title: String
    var updated: Date
}
