import { useParams, Link } from "react-router-dom";
import { format, formatDistanceToNowStrict } from "date-fns";
import { CalendarDays, Clock3, MapPin, Users, Phone, Award, Layers, Info } from "lucide-react";
import { useGet } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EventCategory {
  name: string;
  description: string;
  price: number | string;
  minSize?: string;
  maxSize?: string;
}

interface ContactPerson {
  name: string;
  phone: string;
}

interface PublicEvent {
  id: string;
  name: string;
  location: string;
  description: string;
  bannerUrl?: string;
  rewards?: string;
  categories: EventCategory[];
  contactPersons: ContactPerson[];
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

      <div className="mt-4 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          {/* Main Info Card */}
          <Card className="overflow-hidden border-none shadow-md ring-1 ring-border">
            {event.bannerUrl && (
              <div className="aspect-[21/9] w-full overflow-hidden">
                <img 
                  src={event.bannerUrl} 
                  alt={event.name} 
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
            <CardHeader className={event.bannerUrl ? "pt-6" : "bg-muted/20"}>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="font-display text-3xl font-bold tracking-tight md:text-4xl">{event.name}</CardTitle>
                <Badge variant={event.status === "registration_open" ? "default" : "secondary"}>
                  {statusLabels[event.status] || event.status}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {event.location}</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" /> {format(new Date(event.startDate), "dd MMM yyyy")} - {format(new Date(event.endDate), "dd MMM yyyy")}</span>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none p-6 pt-0 dark:prose-invert">
              <Separator className="mb-6" />
              <div className="whitespace-pre-line text-base leading-relaxed text-foreground/80">
                {event.description}
              </div>
            </CardContent>
          </Card>

          {/* Categories & Pricing */}
          {event.categories && event.categories.length > 0 && (
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <Layers className="h-5 w-5 text-primary" /> Kategori & Kontes
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {event.categories.map((cat, idx) => (
                  <Card key={idx} className="overflow-hidden border-primary/10 bg-primary/5 transition-colors hover:bg-primary/10">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">{cat.name}</CardTitle>
                      <CardDescription className="text-xs">{cat.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="mt-2 text-2xl font-bold text-primary">
                        {typeof cat.price === 'number' ? `Rp ${cat.price.toLocaleString('id-ID')}` : cat.price}
                      </div>
                      {(cat.minSize || cat.maxSize) && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Ukuran: {cat.minSize || '0'} - {cat.maxSize || '∞'} cm
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Rewards */}
          {event.rewards && (
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <Award className="h-5 w-5 text-amber-500" /> Hadiah & Penghargaan
              </h3>
              <Card className="border-amber-100 bg-amber-50/30">
                <CardContent className="p-6">
                  <div className="whitespace-pre-line text-muted-foreground">
                    {event.rewards}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {/* Registration Status */}
          <Card className="sticky top-24 border-primary/20 bg-primary/5 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Pendaftaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/20 p-2 text-primary">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Batas Pendaftaran</div>
                    <div className="text-sm font-medium">
                      {format(new Date(event.registrationCloseAt), "dd MMM yyyy, HH:mm")}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/20 p-2 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Peserta Terdaftar</div>
                    <div className="text-sm font-medium">
                      {event.totalParticipants} peserta · {event.totalBonsai} bonsai
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-background/50 p-4 ring-1 ring-border">
                <p className="text-xs leading-relaxed text-muted-foreground italic">
                  {getRegistrationMessage(event)}
                </p>
              </div>

              {event.registrationAvailable ? (
                <Button asChild className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20" size="lg">
                  <Link to={`/events/${event.id}/register`}>Daftar Sekarang</Link>
                </Button>
              ) : (
                <Button className="w-full" disabled variant="outline">
                  {event.status === "published" ? "Segera Dibuka" : "Pendaftaran Ditutup"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Persons */}
          {event.contactPersons && event.contactPersons.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="h-4 w-4 text-primary" /> Hubungi Panitia
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {event.contactPersons.map((contact, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50">
                    <div className="font-medium">{contact.name}</div>
                    <a 
                      href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono"
                    >
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Guidelines / Additional Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-4 w-4 text-blue-500" /> Panduan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Pendaftaran online menghemat waktu saat check-in.</p>
              <p>• Siapkan foto bonsai terbaik Anda untuk paspor digital.</p>
              <p>• Pastikan kategori ukuran sesuai dengan ketentuan.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
