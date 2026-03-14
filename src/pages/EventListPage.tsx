import { mockEvents } from "@/data/mockData";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-muted text-muted-foreground",
  draft: "bg-amber-100 text-amber-700",
};

export default function EventListPage() {
  return (
    <div className="py-12">
      <div className="container">
        <h1 className="font-display text-4xl font-semibold tracking-tighter">Events</h1>
        <p className="mt-2 text-muted-foreground">Browse bonsai exhibitions and competitions</p>

        <div className="mt-10 space-y-4">
          {mockEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card-archive p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold tracking-tight">{event.eventName}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {event.startDate} – {event.endDate}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {event.totalParticipants} participants</span>
                  </div>
                </div>
                <div className="flex gap-6 text-center shrink-0">
                  <div>
                    <p className="font-display text-2xl font-bold">{event.totalBonsai}</p>
                    <p className="text-xs text-muted-foreground">Bonsai</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold">{event.totalParticipants}</p>
                    <p className="text-xs text-muted-foreground">Participants</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
