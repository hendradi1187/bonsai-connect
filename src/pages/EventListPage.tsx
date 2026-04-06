import { useGet } from "@/hooks/useApi";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Button } from "@/components/ui/button";

interface PublicEvent {
  id: string;
  name: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  status: string;
  totalParticipants: number;
  totalBonsai: number;
  registrationAvailable: boolean;
}

const statusColors: Record<string, string> = {
  published: "bg-blue-100 text-blue-700",
  registration_open: "bg-emerald-100 text-emerald-700",
  registration_closed: "bg-amber-100 text-amber-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  finished: "bg-muted text-muted-foreground",
  draft: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<string, string> = {
  published: "Coming Soon",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  ongoing: "Ongoing",
  finished: "Finished",
  draft: "Draft",
};

const formatDateLabel = (value?: string | null, pattern = "dd MMM yyyy") => {
  if (!value) {
    return "Belum diatur";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Belum diatur";
  }

  return format(date, pattern);
};

const getRegistrationHint = (event: PublicEvent) => {
  if (event.registrationAvailable) {
    return `Open until ${formatDateLabel(event.registrationCloseAt, "dd MMM yyyy, HH:mm")}`;
  }

  if (event.status === "published" && event.registrationOpenAt) {
    return `Opens in ${formatDistanceToNowStrict(new Date(event.registrationOpenAt), { addSuffix: true })}`;
  }

  if (event.status === "registration_closed") {
    return "Registration window has closed";
  }

  if (event.status === "ongoing") {
    return "Event is in progress";
  }

  return "Registration not available";
};

export default function EventListPage() {
  const { data: events, isLoading } = useGet<PublicEvent[]>(["public-events"], "/events/public");

  return (
    <div className="py-12">
      <div className="container">
        <h1 className="font-display text-4xl font-semibold tracking-tighter">Events</h1>
        <p className="mt-2 text-muted-foreground">Lihat event PPBI yang akan datang dan status pembukaan registrasinya.</p>

        <div className="mt-10 space-y-4">
          {isLoading ? (
            [1, 2, 3].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-3xl border bg-muted/20" />
            ))
          ) : events && events.length > 0 ? (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="card-archive p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl font-semibold tracking-tight">{event.name}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[event.status] || statusColors.draft}`}>
                        {statusLabels[event.status] || event.status}
                      </span>
                    </div>

                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{event.description}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateLabel(event.startDate)} - {formatDateLabel(event.endDate)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {event.totalParticipants} participants</span>
                      <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {getRegistrationHint(event)}</span>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-64">
                    <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-background/80 p-4 text-center">
                      <div>
                        <p className="font-display text-2xl font-bold">{event.totalBonsai}</p>
                        <p className="text-xs text-muted-foreground">Bonsai</p>
                      </div>
                      <div>
                        <p className="font-display text-2xl font-bold">{event.totalParticipants}</p>
                        <p className="text-xs text-muted-foreground">Participants</p>
                      </div>
                    </div>

                    <Button asChild variant="outline">
                      <Link to={`/events/${event.id}`}>Lihat Detail Event</Link>
                    </Button>
                    {event.registrationAvailable ? (
                      <Button asChild>
                        <Link to={`/events/${event.id}/register`}>Daftar Sekarang</Link>
                      </Button>
                    ) : (
                      <Button type="button" disabled>
                        {event.status === "published" ? "Registrasi Segera Dibuka" : "Registrasi Tidak Tersedia"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed p-12 text-center text-muted-foreground">
              Belum ada event publik yang dipublikasikan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
