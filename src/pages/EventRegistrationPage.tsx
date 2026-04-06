import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import { useGet, usePost } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  registrationAvailable: boolean;
}

interface RegisterResponse {
  participant: {
    registrationNumber: string;
    judgingNumber: string;
    judgingNumberStatus: string;
    status: string;
  };
}

export default function EventRegistrationPage() {
  const { eventId = "" } = useParams();
  const { data: event, isLoading } = useGet<PublicEvent>(["public-event", eventId], `/events/public/${eventId}`);
  const registerMutation = usePost<Record<string, string>, RegisterResponse>("/public/register");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    bonsaiName: "",
    species: "",
    sizeCategory: "Large",
    photoUrl: "",
  });
  const [result, setResult] = useState<RegisterResponse | null>(null);

  const isDisabled = useMemo(() => !event?.registrationAvailable, [event]);

  const handleSubmit = async () => {
    if (!eventId) {
      return;
    }

    try {
      const response = await registerMutation.mutateAsync({
        eventId,
        ...form,
      });
      setResult(response);
      toast.success("Registrasi berhasil dikirim");
    } catch (error) {
      toast.error("Registrasi gagal");
    }
  };

  if (isLoading) {
    return <div className="container py-12"><div className="h-80 animate-pulse rounded-3xl border bg-muted/20" /></div>;
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
      <div className="mb-8">
        <Link to="/events" className="text-sm text-primary hover:underline">Kembali ke daftar event</Link>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">{event.name}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{event.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {format(new Date(event.startDate), "dd MMM yyyy")} - {format(new Date(event.endDate), "dd MMM yyyy")}</span>
          <span className="flex items-center gap-1"><Clock3 className="h-4 w-4" /> Pendaftaran sampai {format(new Date(event.registrationCloseAt), "dd MMM yyyy, HH:mm")}</span>
        </div>
      </div>

      {result ? (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardHeader>
            <CardTitle>Registrasi Berhasil</CardTitle>
            <CardDescription>Nomor registrasi dan relasi nomor penjurian sudah dibuat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs uppercase text-muted-foreground">Registration Number</div>
                <div className="mt-1 font-mono text-lg font-bold">{result.participant.registrationNumber}</div>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs uppercase text-muted-foreground">Judging Number</div>
                <div className="mt-1 font-mono text-lg font-bold">{result.participant.judgingNumber}</div>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs uppercase text-muted-foreground">Judging Status</div>
                <div className="mt-1 font-semibold capitalize">{result.participant.judgingNumberStatus}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Simpan nomor registrasi ini. Nomor penjurian sudah direservasi dan akan dikonfirmasi saat proses check-in.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Form Pendaftaran Peserta</CardTitle>
            <CardDescription>
              Form ini langsung membuat nomor registrasi dan relasi ke nomor penjurian untuk event yang dipilih.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!event.registrationAvailable && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Pendaftaran belum dibuka atau sudah ditutup untuk event ini.
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nomor Telepon</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kota</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Bonsai</label>
                <Input value={form.bonsaiName} onChange={(e) => setForm({ ...form, bonsaiName: e.target.value })} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Spesies</label>
                <Input value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} disabled={isDisabled} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori Ukuran</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.sizeCategory}
                  onChange={(e) => setForm({ ...form, sizeCategory: e.target.value })}
                  disabled={isDisabled}
                >
                  <option value="Mame">Mame</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="XL">XL</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">URL Foto Bonsai</label>
                <Input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} disabled={isDisabled} placeholder="https://..." />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={isDisabled || registerMutation.isPending}>
                {registerMutation.isPending ? "Mengirim..." : "Kirim Pendaftaran"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
