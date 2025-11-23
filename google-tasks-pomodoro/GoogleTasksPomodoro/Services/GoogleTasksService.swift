import Foundation
import AuthenticationServices

class GoogleTasksService: NSObject, ObservableObject {
    static let shared = GoogleTasksService()

    @Published var isAuthenticated = false
    @Published var tasks: [GoogleTask] = []
    @Published var taskLists: [TaskList] = []
    @Published var isLoading = false
    @Published var error: String?

    private var accessToken: String?
    private let clientId = "YOUR_CLIENT_ID" // Replace with your Google OAuth Client ID
    private let redirectURI = "com.googleusercontent.apps.YOUR_CLIENT_ID:/oauth2redirect"

    private override init() {
        super.init()
        loadStoredToken()
    }

    // MARK: - Authentication

    func authenticate() {
        // OAuth 2.0 flow for Google Tasks API
        let authURL = buildAuthURL()

        guard let url = URL(string: authURL) else { return }

        let session = ASWebAuthenticationSession(url: url, callbackURLScheme: "com.googleusercontent.apps") { [weak self] callbackURL, error in
            guard error == nil, let callbackURL = callbackURL else {
                self?.error = "Authentication failed: \(error?.localizedDescription ?? "Unknown error")"
                return
            }

            self?.handleAuthCallback(callbackURL)
        }

        session.presentationContextProvider = self
        session.start()
    }

    private func buildAuthURL() -> String {
        let scope = "https://www.googleapis.com/auth/tasks"
        let baseURL = "https://accounts.google.com/o/oauth2/v2/auth"

        var components = URLComponents(string: baseURL)!
        components.queryItems = [
            URLQueryItem(name: "client_id", value: clientId),
            URLQueryItem(name: "redirect_uri", value: redirectURI),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: scope),
            URLQueryItem(name: "access_type", value: "offline")
        ]

        return components.url?.absoluteString ?? ""
    }

    private func handleAuthCallback(_ url: URL) {
        guard let code = URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?
            .first(where: { $0.name == "code" })?
            .value else {
            self.error = "Failed to extract authorization code"
            return
        }

        exchangeCodeForToken(code)
    }

    private func exchangeCodeForToken(_ code: String) {
        // Exchange authorization code for access token
        let tokenURL = URL(string: "https://oauth2.googleapis.com/token")!

        var request = URLRequest(url: tokenURL)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let bodyParams = [
            "code": code,
            "client_id": clientId,
            "redirect_uri": redirectURI,
            "grant_type": "authorization_code"
        ]

        request.httpBody = bodyParams
            .map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")" }
            .joined(separator: "&")
            .data(using: .utf8)

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let data = data, error == nil else {
                DispatchQueue.main.async {
                    self?.error = "Token exchange failed: \(error?.localizedDescription ?? "Unknown error")"
                }
                return
            }

            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let accessToken = json["access_token"] as? String {
                DispatchQueue.main.async {
                    self?.accessToken = accessToken
                    self?.isAuthenticated = true
                    self?.saveToken(accessToken)
                    self?.fetchTaskLists()
                }
            }
        }.resume()
    }

    // MARK: - Token Storage

    private func saveToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: "googleAccessToken")
    }

    private func loadStoredToken() {
        if let token = UserDefaults.standard.string(forKey: "googleAccessToken") {
            self.accessToken = token
            self.isAuthenticated = true
            fetchTaskLists()
        }
    }

    func signOut() {
        accessToken = nil
        isAuthenticated = false
        tasks = []
        taskLists = []
        UserDefaults.standard.removeObject(forKey: "googleAccessToken")
    }

    // MARK: - API Calls

    func fetchTaskLists() {
        guard let token = accessToken else { return }

        isLoading = true
        let url = URL(string: "https://tasks.googleapis.com/tasks/v1/users/@me/lists")!

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
            }

            guard let data = data, error == nil else {
                DispatchQueue.main.async {
                    self?.error = "Failed to fetch task lists: \(error?.localizedDescription ?? "Unknown error")"
                }
                return
            }

            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let items = json["items"] as? [[String: Any]] {
                let lists = items.compactMap { item -> TaskList? in
                    guard let id = item["id"] as? String,
                          let title = item["title"] as? String,
                          let updatedString = item["updated"] as? String,
                          let updated = ISO8601DateFormatter().date(from: updatedString) else {
                        return nil
                    }
                    return TaskList(id: id, title: title, updated: updated)
                }

                DispatchQueue.main.async {
                    self?.taskLists = lists
                    if let firstList = lists.first {
                        self?.fetchTasks(from: firstList.id)
                    }
                }
            }
        }.resume()
    }

    func fetchTasks(from listId: String) {
        guard let token = accessToken else { return }

        isLoading = true
        let url = URL(string: "https://tasks.googleapis.com/tasks/v1/lists/\(listId)/tasks")!

        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
            }

            guard let data = data, error == nil else {
                DispatchQueue.main.async {
                    self?.error = "Failed to fetch tasks: \(error?.localizedDescription ?? "Unknown error")"
                }
                return
            }

            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let items = json["items"] as? [[String: Any]] {
                let tasks = items.compactMap { item -> GoogleTask? in
                    guard let id = item["id"] as? String,
                          let title = item["title"] as? String,
                          let statusString = item["status"] as? String,
                          let status = GoogleTask.TaskStatus(rawValue: statusString),
                          let updatedString = item["updated"] as? String,
                          let updated = ISO8601DateFormatter().date(from: updatedString) else {
                        return nil
                    }

                    let notes = item["notes"] as? String
                    let due = (item["due"] as? String).flatMap { ISO8601DateFormatter().date(from: $0) }

                    return GoogleTask(
                        id: id,
                        title: title,
                        notes: notes,
                        status: status,
                        due: due,
                        updated: updated,
                        listId: listId
                    )
                }

                DispatchQueue.main.async {
                    self?.tasks = tasks.filter { $0.status == .needsAction }
                }
            }
        }.resume()
    }

    func completeTask(_ task: GoogleTask) {
        guard let token = accessToken else { return }

        let url = URL(string: "https://tasks.googleapis.com/tasks/v1/lists/\(task.listId)/tasks/\(task.id)")!

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = ["status": "completed"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard error == nil else {
                DispatchQueue.main.async {
                    self?.error = "Failed to complete task: \(error?.localizedDescription ?? "Unknown error")"
                }
                return
            }

            DispatchQueue.main.async {
                self?.tasks.removeAll { $0.id == task.id }
            }
        }.resume()
    }
}

// MARK: - ASWebAuthenticationPresentationContextProviding

extension GoogleTasksService: ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return NSApplication.shared.windows.first ?? ASPresentationAnchor()
    }
}
