import { CalendarDays, TreePine, Users, Trophy } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { mockEvents, mockBonsai, mockCertificates } from "@/data/mockData";

export default function AdminDashboard() {
  const upcomingEvents = mockEvents.filter(e => e.status === "upcoming");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your bonsai platform</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={mockEvents.length} icon={CalendarDays} description={`${upcomingEvents.length} upcoming`} />
        <StatCard title="Total Bonsai" value={mockBonsai.length} icon={TreePine} description="Registered trees" />
        <StatCard title="Participants" value={42} icon={Users} description="Active owners" />
        <StatCard title="Certificates" value={mockCertificates.length} icon={Trophy} description="Issued" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-archive p-6">
          <h2 className="font-display text-lg font-semibold">Recent Events</h2>
          <div className="mt-4 space-y-3">
            {mockEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{event.eventName}</p>
                  <p className="text-xs text-muted-foreground">{event.location} · {event.startDate}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  event.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                  event.status === "completed" ? "bg-muted text-muted-foreground" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-archive p-6">
          <h2 className="font-display text-lg font-semibold">Top Bonsai</h2>
          <div className="mt-4 space-y-3">
            {mockBonsai.filter(b => b.scores && b.scores.length > 0).slice(0, 4).map((b) => {
              const avg = Math.round(b.scores!.reduce((s, sc) => s + sc.total, 0) / b.scores!.length);
              return (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="passport-id">{b.passportId}</p>
                    <p className="text-sm font-medium">{b.treeName}</p>
                    <p className="text-xs text-muted-foreground">{b.ownerName}</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-primary">{avg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
