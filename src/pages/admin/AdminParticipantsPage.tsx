import { Users, Plus } from "lucide-react";

const mockParticipants = [
  { id: "p-001", name: "Ahmad Wijaya", phone: "081234567890", city: "Depok", treesCount: 2 },
  { id: "p-002", name: "Siti Rahmawati", phone: "081234567891", city: "Depok", treesCount: 1 },
  { id: "p-003", name: "Bambang Sutrisno", phone: "081234567892", city: "Bogor", treesCount: 1 },
  { id: "p-004", name: "Dewi Lestari", phone: "081234567893", city: "Depok", treesCount: 1 },
  { id: "p-005", name: "Rudi Hermawan", phone: "081234567894", city: "Depok", treesCount: 1 },
  { id: "p-006", name: "Hendra Prasetyo", phone: "081234567895", city: "Jakarta", treesCount: 1 },
];

export default function AdminParticipantsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Participants</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockParticipants.length} registered</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Add Participant
        </button>
      </div>

      <div className="mt-6 card-archive hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left data-label">Name</th>
              <th className="px-4 py-3 text-left data-label">Phone</th>
              <th className="px-4 py-3 text-left data-label">City</th>
              <th className="px-4 py-3 text-right data-label">Trees</th>
            </tr>
          </thead>
          <tbody>
            {mockParticipants.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.city}</td>
                <td className="px-4 py-3 text-right font-mono text-sm">{p.treesCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {mockParticipants.map((p) => (
          <div key={p.id} className="card-archive p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.city} · {p.phone}</p>
              </div>
              <span className="font-mono text-sm font-medium">{p.treesCount} trees</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
