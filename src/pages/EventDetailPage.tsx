import { useParams, Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { useGet } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const statusLabels: Record<string, string> = {
  published: "Coming Soon",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  ongoing: "Ongoing",
  finished: "Finished",
  draft: "Draft",
};

const getRegistrationMessage = (event: PublicEvent) => {
  if (event.registrationAvailable) {
    return `Pendaftaran dibuka sampai ${format(new Date(event.registrationCloseAt), "dd MMM yyyy, HH:mm")}`;
  }

  if (event.status === "published") {
    return `Pendaftaran dibuka ${formatDistanceToNowStrict(new Date(event.registrationOpenAt), { addSuffix: true })}`;
  }

  if (event.status === "registration_closed") {
    return "Pendaftaran sudah ditutup untuk event ini.";
  }

  if (event.status === "ongoing") {
    return "Event sedang berjalan.";
  }

  return "Event belum tersedia untuk pendaftaran.";
};

export default function EventDetailPage() {
  const { eventId = "" } = useParams();
  const { data: event, isLoading } = useGet<PublicEvent>(["public-event-detail", eventId], `/events/public/${eventId}`);

  if (isLoading) {
    return <div className="container py-12"><div className="h-96 animate-pulse rounded-3xl border bg-muted/20" /></div>;
  }

  if (!event) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Event tidak ditemukan atau belum dipublikasikan.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Link to="/events" className="text-sm text-primary hover:underline">Kembali ke daftar event</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="font-display text-3xl">{event.name}</CardTitle>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {statusLabels[event.status] || event.status}
              </span>
            </div>
            <CardDescription className="pt-2 text-sm">{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Location
                </div>
                <div className="mt-2 text-sm font-medium">{event.location}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Event Schedule
                </div>
                <div className="mt-2 text-sm font-medium">
                  {format(new Date(event.startDate), "dd MMM yyyy")} - {format(new Date(event.endDate), "dd MMM yyyy")}
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <Clock3 className="h-4 w-4" /> Registration Window
                </div>
                <div className="mt-2 text-sm font-medium">
                  {format(new Date(event.registrationOpenAt), "dd MMM yyyy, HH:mm")} - {format(new Date(event.registrationCloseAt), "dd MMM yyyy, HH:mm")}
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <Users className="h-4 w-4" /> Current Entries
                </div>
                <div className="mt-2 text-sm font-medium">
                  {event.totalParticipants} peserta · {event.totalBonsai} bonsai
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed p-5">
              <div className="text-sm font-semibold">Informasi pendaftaran</div>
              <p className="mt-2 text-sm text-muted-foreground">{getRegistrationMessage(event)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Event</CardTitle>
            <CardDescription>
              Form pendaftaran akan langsung membuat nomor registrasi dan relasi ke nomor penjurian.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              Setelah submit, peserta akan menerima `registration number` dan `judging number` berstatus `reserved`.
              Nomor penjurian akan dikonfirmasi saat proses check-in oleh admin.
            </div>

            {event.registrationAvailable ? (
              <Button asChild className="w-full">
                <Link to={`/events/${event.id}/register`}>Buka Form Pendaftaran</Link>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                {event.status === "published" ? "Menunggu H-7" : "Pendaftaran Tidak Aktif"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
