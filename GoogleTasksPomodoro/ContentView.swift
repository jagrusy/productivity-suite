import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Text("Pomodoro Timer")
                .font(.largeTitle)
                .padding()
            
            Text("Your toolbar content goes here")
                .foregroundStyle(.secondary)
        }
        .frame(minWidth: 400, minHeight: 300)
        .toolbar {
            // Add your toolbar items here
            ToolbarItem(placement: .automatic) {
                Button("Start") {
                    // Handle start action
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
