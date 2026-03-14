import { FileBarChart, Download } from "lucide-react";

export default function AdminReportsPage() {
  const reports = [
    { title: "Depok Bonsai Festival 2026 — Full Report", type: "Event Report", date: "2026-04-17" },
    { title: "West Java Bonsai Championship 2025 — Results", type: "Competition Results", date: "2025-09-22" },
    { title: "Annual Registry Summary 2025", type: "Registry Report", date: "2025-12-31" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">Generate and download event reports</p>

      <div className="mt-6 space-y-3">
        {reports.map((r, i) => (
          <div key={i} className="card-archive flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileBarChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.type} · {r.date}</p>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
              <Download className="h-4 w-4" /> PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
