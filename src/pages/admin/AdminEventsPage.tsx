import { useMemo, useState } from "react";
import { useGet, usePost, usePut } from "@/hooks/useApi";
import { Plus, CalendarDays, MapPin, Clock3, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface EventRow {
  id: string;
  name: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  publishAt: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  status: string;
  configuredStatus: string;
  totalParticipants: number;
  totalBonsai: number;
}

const configuredStatusOptions = [
  "draft",
  "published",
  "registration_open",
  "registration_closed",
  "ongoing",
  "finished",
];

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-blue-100 text-blue-700",
  registration_open: "bg-emerald-100 text-emerald-700",
  registration_closed: "bg-amber-100 text-amber-800",
  ongoing: "bg-purple-100 text-purple-700",
  finished: "bg-muted text-muted-foreground",
};

const toDateTimeLocal = (value: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Belum diatur";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Belum diatur";
  }

  return format(date, "dd MMM yyyy HH:mm");
};

const getRuntimeStatusFromTimeline = (form: {
  publishAt: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  startDate: string;
  endDate: string;
}) => {
  if (!form.publishAt || !form.registrationOpenAt || !form.registrationCloseAt || !form.startDate || !form.endDate) {
    return null;
  }

  const now = new Date();
  const publishAt = new Date(form.publishAt);
  const registrationOpenAt = new Date(form.registrationOpenAt);
  const registrationCloseAt = new Date(form.registrationCloseAt);
  const startDate = new Date(form.startDate);
  const endDate = new Date(form.endDate);

  if (Number.isNaN(publishAt.getTime()) || Number.isNaN(registrationOpenAt.getTime()) || Number.isNaN(registrationCloseAt.getTime()) || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  if (now < publishAt) return "draft";
  if (now < registrationOpenAt) return "published";
  if (now <= registrationCloseAt) return "registration_open";
  if (now < startDate) return "registration_closed";
  if (now <= endDate) return "ongoing";
  return "finished";
};

export default function AdminEventsPage() {
  const { data: events, isLoading } = useGet<EventRow[]>(["events"], "/events");
  const createEventMutation = usePost<Record<string, string>, EventRow>("/events", [["events"], ["public-events"]]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const updateEventMutation = usePut<Record<string, string>, EventRow>(
    editingEventId ? `/events/${editingEventId}` : "/events",
    [["events"], ["public-events"]]
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    publishAt: "",
    registrationOpenAt: "",
    registrationCloseAt: "",
    status: "published",
  });

  const isEditing = useMemo(() => Boolean(editingEventId), [editingEventId]);
  const timelineStatus = useMemo(() => getRuntimeStatusFromTimeline(form), [form]);
  const hasInvalidTimeline = useMemo(() => {
    if (!form.publishAt || !form.registrationOpenAt || !form.registrationCloseAt || !form.startDate) {
      return false;
    }

    const publishAt = new Date(form.publishAt);
    const registrationOpenAt = new Date(form.registrationOpenAt);
    const registrationCloseAt = new Date(form.registrationCloseAt);
    const startDate = new Date(form.startDate);
    const endDate = form.endDate ? new Date(form.endDate) : null;

    if (Number.isNaN(publishAt.getTime()) || Number.isNaN(registrationOpenAt.getTime()) || Number.isNaN(registrationCloseAt.getTime()) || Number.isNaN(startDate.getTime())) {
      return true;
    }

    if (!(publishAt <= registrationOpenAt && registrationOpenAt <= registrationCloseAt && registrationCloseAt <= startDate)) {
      return true;
    }

    if (endDate && !Number.isNaN(endDate.getTime()) && endDate < startDate) {
      return true;
    }

    return false;
  }, [form]);

  const openCreateDialog = () => {
    setEditingEventId(null);
    setForm({
      name: "",
      location: "Depok",
      description: "",
      startDate: "",
      endDate: "",
      publishAt: "",
      registrationOpenAt: "",
      registrationCloseAt: "",
      status: "published",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: EventRow) => {
    setEditingEventId(event.id);
    setForm({
      name: event.name,
      location: event.location,
      description: event.description,
      startDate: toDateTimeLocal(event.startDate),
      endDate: toDateTimeLocal(event.endDate),
      publishAt: toDateTimeLocal(event.publishAt),
      registrationOpenAt: toDateTimeLocal(event.registrationOpenAt),
      registrationCloseAt: toDateTimeLocal(event.registrationCloseAt),
      status: event.configuredStatus || event.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (hasInvalidTimeline) {
      toast.error("Urutan waktu event tidak valid");
      return;
    }

    try {
      if (isEditing) {
        await updateEventMutation.mutateAsync(form);
        toast.success("Event updated");
      } else {
        await createEventMutation.mutateAsync(form);
        toast.success("Event created");
      }
      setIsDialogOpen(false);
    } catch {
      toast.error(isEditing ? "Failed to update event" : "Failed to create event");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola publish time, window registrasi, dan status event.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl border bg-muted/20" />)
        ) : events?.map((event) => (
          <div key={event.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-semibold">{event.name}</h3>
                  <Badge className={statusColors[event.status] || statusColors.draft}>{event.status}</Badge>
                  <Badge variant="outline">configured: {event.configuredStatus}</Badge>
                </div>
                <p className="max-w-3xl text-sm text-muted-foreground">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:min-w-[360px]">
                <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-muted/20 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="h-4 w-4" /> Publish At</span>
                    <span className="font-mono">{formatDateTime(event.publishAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Registration Open</span>
                    <span className="font-mono">{formatDateTime(event.registrationOpenAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Registration Close</span>
                    <span className="font-mono">{formatDateTime(event.registrationCloseAt)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-4 text-sm">
                  <span>{event.totalParticipants} peserta · {event.totalBonsai} bonsai</span>
                  <Button variant="outline" onClick={() => openEditDialog(event)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              Atur `publish_at`, `registration_open_at`, `registration_close_at`, dan `status event` dari sini.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            {hasInvalidTimeline && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive md:col-span-2">
                Timeline tidak valid. Gunakan urutan:
                {" "}
                <code>publish_at &lt;= registration_open_at &lt;= registration_close_at &lt;= start_date</code>
                {" "}
                dan pastikan
                {" "}
                <code>end_date &gt;= start_date</code>.
              </div>
            )}
            {!hasInvalidTimeline && timelineStatus && timelineStatus !== form.status && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 md:col-span-2">
                Warning: status manual saat ini `{form.status}` bertentangan dengan status runtime dari window waktu, yang saat ini akan terbaca sebagai `{timelineStatus}`.
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Event Name</label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Event</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                {configuredStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="datetime-local" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Publish At</label>
              <Input type="datetime-local" value={form.publishAt} onChange={(event) => setForm({ ...form, publishAt: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Open At</label>
              <Input type="datetime-local" value={form.registrationOpenAt} onChange={(event) => setForm({ ...form, registrationOpenAt: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Close At</label>
              <Input type="datetime-local" value={form.registrationCloseAt} onChange={(event) => setForm({ ...form, registrationCloseAt: event.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createEventMutation.isPending || updateEventMutation.isPending}>
              {isEditing ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
