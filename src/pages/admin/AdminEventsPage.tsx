import { mockEvents } from "@/data/mockData";
import { Plus, CalendarDays, MapPin } from "lucide-react";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-muted text-muted-foreground",
  draft: "bg-amber-100 text-amber-700",
};

export default function AdminEventsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage exhibitions and competitions</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      {/* Desktop Table */}
      <div className="mt-6 card-archive hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left data-label">Event Name</th>
              <th className="px-4 py-3 text-left data-label">Location</th>
              <th className="px-4 py-3 text-left data-label">Date</th>
              <th className="px-4 py-3 text-left data-label">Status</th>
              <th className="px-4 py-3 text-right data-label">Bonsai</th>
            </tr>
          </thead>
          <tbody>
            {mockEvents.map((event) => (
              <tr key={event.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{event.eventName}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{event.location}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{event.startDate}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm">{event.totalBonsai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {mockEvents.map((event) => (
          <div key={event.id} className="card-archive p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium">{event.eventName}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
              <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {event.startDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
