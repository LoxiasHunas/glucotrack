import SwiftUI
#if canImport(PlaygroundSupport)
import PlaygroundSupport
#endif

// MARK: - Model
struct GlucoseReading: Identifiable, Codable, Equatable {
    let id: UUID
    let value: Int
    let date: Date
}

enum GlucoseStatus: String {
    case low = "Bajo"
    case normal = "Normal"
    case high = "Alto"

    var color: Color {
        switch self {
        case .low:
            return .cyan
        case .normal:
            return .green
        case .high:
            return .orange
        }
    }
}

// MARK: - ViewModel
final class GlucoTrackerViewModel: ObservableObject {
    @Published private(set) var readings: [GlucoseReading] = []

    private let storageKey = "glucoTrack.readings"
    private let calendar = Calendar.current

    init() {
        loadReadings()
    }

    func addReading(value: Int, date: Date) {
        let newReading = GlucoseReading(id: UUID(), value: value, date: date)
        readings.insert(newReading, at: 0)
        saveReadings()
    }

    func deleteReadings(at offsets: IndexSet) {
        readings.remove(atOffsets: offsets)
        saveReadings()
    }

    func status(for value: Int) -> GlucoseStatus {
        if value < 70 {
            return .low
        }
        if value <= 140 {
            return .normal
        }
        return .high
    }

    func readings(forMonth month: Int, year: Int) -> [GlucoseReading] {
        readings.filter {
            let components = calendar.dateComponents([.month, .year], from: $0.date)
            return components.month == month && components.year == year
        }
    }

    func exportReport(month: Int?, year: Int?) -> URL? {
        let exportReadings: [GlucoseReading]
        if let month, let year {
            exportReadings = readings(forMonth: month, year: year)
        } else {
            exportReadings = readings
        }

        guard !exportReadings.isEmpty else { return nil }

        let formatter = DateFormatter()
        formatter.dateFormat = "dd/MM/yyyy HH:mm"

        let reportLines = exportReadings.map { reading in
            let dateString = formatter.string(from: reading.date)
            let statusText = status(for: reading.value).rawValue
            return "Fecha: \(dateString) - Valor: \(reading.value) mg/dL - Estado: \(statusText)"
        }

        let reportText = reportLines.joined(separator: "\n")
        let fileName = "Reporte_GlucoTrack.txt"
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)

        do {
            try reportText.write(to: tempURL, atomically: true, encoding: .utf8)
            return tempURL
        } catch {
            return nil
        }
    }

    private func saveReadings() {
        guard let data = try? JSONEncoder().encode(readings) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private func loadReadings() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let saved = try? JSONDecoder().decode([GlucoseReading].self, from: data) else {
            return
        }
        readings = saved.sorted { $0.date > $1.date }
    }
}

// MARK: - View
struct MainView: View {
    @StateObject private var viewModel = GlucoTrackerViewModel()
    @State private var glucoseInput = ""
    @State private var selectedDate = Date()
    @State private var showSaveAlert = false
    @State private var showExportSheet = false
    @State private var exportAll = true
    @State private var exportDate = Date()
    @State private var exportURL: URL?

    private var glucoseValue: Int? {
        Int(glucoseInput)
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                headerSection
                historySection
            }
            .padding()
            .navigationTitle("GlucoTrack")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Exportar Reporte") {
                        exportURL = nil
                        showExportSheet = true
                    }
                }
            }
            .alert("Registro guardado", isPresented: $showSaveAlert) {
                Button("OK", role: .cancel) {}
            }
            .sheet(isPresented: $showExportSheet) {
                exportSheet
            }
        }
    }

    private var headerSection: some View {
        VStack(spacing: 16) {
            TextField("Nivel de glucosa (mg/dL)", text: $glucoseInput)
                .keyboardType(.numberPad)
                .font(.largeTitle)
                .multilineTextAlignment(.center)
                .padding()
                .background(Color(.secondarySystemBackground))
                .cornerRadius(12)

            DatePicker("Fecha y hora", selection: $selectedDate, displayedComponents: [.date, .hourAndMinute])
                .datePickerStyle(.compact)

            Button(action: saveReading) {
                Text("Guardar Registro")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .font(.title2.weight(.semibold))
                    .foregroundColor(.white)
                    .background(glucoseValue == nil ? Color.gray : Color.blue)
                    .cornerRadius(12)
            }
            .disabled(glucoseValue == nil)
        }
    }

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Historial")
                .font(.title2.weight(.bold))

            if viewModel.readings.isEmpty {
                Text("Aún no hay registros.")
                    .foregroundColor(.secondary)
            } else {
                List {
                    ForEach(viewModel.readings.sorted { $0.date > $1.date }) { reading in
                        ReadingRow(reading: reading, status: viewModel.status(for: reading.value))
                    }
                    .onDelete(perform: viewModel.deleteReadings)
                }
                .listStyle(.plain)
                .frame(maxHeight: 360)
            }
        }
    }

    private var exportSheet: some View {
        NavigationView {
            Form {
                Toggle("Exportar todo", isOn: $exportAll)

                if !exportAll {
                    DatePicker("Mes y año", selection: $exportDate, displayedComponents: [.date])
                        .datePickerStyle(.compact)
                }

                Button("Generar archivo") {
                    if exportAll {
                        exportURL = viewModel.exportReport(month: nil, year: nil)
                    } else {
                        let components = Calendar.current.dateComponents([.month, .year], from: exportDate)
                        exportURL = viewModel.exportReport(month: components.month, year: components.year)
                    }
                }

                if let exportURL {
                    ShareLink(item: exportURL) {
                        Label("Compartir reporte", systemImage: "square.and.arrow.up")
                    }
                } else {
                    Text("Genera el archivo para habilitar la opción de compartir.")
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("Exportar")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cerrar") {
                        showExportSheet = false
                    }
                }
            }
        }
    }

    private func saveReading() {
        guard let value = glucoseValue else { return }
        viewModel.addReading(value: value, date: selectedDate)
        glucoseInput = ""
        selectedDate = Date()
        showSaveAlert = true
    }
}

struct ReadingRow: View {
    let reading: GlucoseReading
    let status: GlucoseStatus

    private static let formatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(status.color)
                .frame(width: 14, height: 14)

            VStack(alignment: .leading, spacing: 4) {
                Text("\(reading.value) mg/dL")
                    .font(.title3.weight(.semibold))
                Text(Self.formatter.string(from: reading.date))
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Text(status.rawValue)
                .font(.subheadline.weight(.semibold))
                .foregroundColor(status.color)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - App Entry
#if canImport(PlaygroundSupport)
PlaygroundPage.current.setLiveView(MainView())
#else
@main
struct GlucoTrackApp: App {
    var body: some Scene {
        WindowGroup {
            MainView()
        }
    }
}
#endif
