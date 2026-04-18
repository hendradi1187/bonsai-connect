import { useMemo, useState } from "react";
import { useGet, usePost, usePut } from "@/hooks/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { Plus, CalendarDays, MapPin, Clock3, Pencil, Lock, Unlock, Trash2, Layers, Phone, Award, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface EventRow {
  id: string;
  name: string;
  location: string;
  description: string;
  bannerUrl: string;
  rewards: string;
  categories: EventCategory[];
  contactPersons: ContactPerson[];
  startDate: string;
  endDate: string;
  publishAt: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  status: string;
  configuredStatus: string;
  isLocked: boolean;
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

const getRuntimeStatusFromTimeline = (form: any) => {
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
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useGet<EventRow[]>(["events"], "/events");

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const deleteTarget = events?.find(e => e.id === deleteTargetId);

  const lockMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.put(`/events/${eventId}/lock`, {});
      return res.data as { id: string; isLocked: boolean };
    },
    onSuccess: async (data) => {
      toast.success(data.isLocked ? "Event dikunci" : "Event dibuka");
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Gagal mengubah status kunci"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/events/${eventId}`);
    },
    onSuccess: async () => {
      toast.success("Event berhasil dihapus");
      setDeleteTargetId(null);
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => {
      toast.error("Gagal menghapus event");
      setDeleteTargetId(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.put(`/events/${eventId}/archive`, {});
    },
    onSuccess: async () => {
      toast.success("Event diarsipkan (status: finished)");
      setDeleteTargetId(null);
      await queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Gagal mengarsipkan event"),
  });
  
  const createEventMutation = usePost<any, EventRow>("/events", [["events"], ["public-events"]]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const updateEventMutation = usePut<any, EventRow>(
    editingEventId ? `/events/${editingEventId}` : "/events",
    [["events"], ["public-events"]]
  );
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "Depok",
    description: "",
    bannerUrl: "",
    rewards: "",
    categories: [] as EventCategory[],
    contactPersons: [] as ContactPerson[],
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
      bannerUrl: "",
      rewards: "",
      categories: [],
      contactPersons: [],
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
      description: event.description || "",
      bannerUrl: event.bannerUrl || "",
      rewards: event.rewards || "",
      categories: event.categories || [],
      contactPersons: event.contactPersons || [],
      startDate: toDateTimeLocal(event.startDate),
      endDate: toDateTimeLocal(event.endDate),
      publishAt: toDateTimeLocal(event.publishAt),
      registrationOpenAt: toDateTimeLocal(event.registrationOpenAt),
      registrationCloseAt: toDateTimeLocal(event.registrationCloseAt),
      status: event.configuredStatus || event.status,
    });
    setIsDialogOpen(true);
  };

  const addCategory = () => {
    setForm({
      ...form,
      categories: [...form.categories, { name: "", description: "", price: 0, minSize: "", maxSize: "" }]
    });
  };

  const removeCategory = (index: number) => {
    const next = [...form.categories];
    next.splice(index, 1);
    setForm({ ...form, categories: next });
  };

  const updateCategory = (index: number, updates: Partial<EventCategory>) => {
    const next = [...form.categories];
    next[index] = { ...next[index], ...updates };
    setForm({ ...form, categories: next });
  };

  const addContact = () => {
    setForm({
      ...form,
      contactPersons: [...form.contactPersons, { name: "", phone: "" }]
    });
  };

  const removeContact = (index: number) => {
    const next = [...form.contactPersons];
    next.splice(index, 1);
    setForm({ ...form, contactPersons: next });
  };

  const updateContact = (index: number, updates: Partial<ContactPerson>) => {
    const next = [...form.contactPersons];
    next[index] = { ...next[index], ...updates };
    setForm({ ...form, contactPersons: next });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola publish time, window registrasi, dan informasi publik.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" /> New Event
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl border bg-muted/20" />)
        ) : events?.map((event) => (
          <div key={event.id} className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-semibold">{event.name}</h3>
                  <Badge className={statusColors[event.status] || statusColors.draft}>{event.status}</Badge>
                  <Badge variant="outline">configured: {event.configuredStatus}</Badge>
                  {event.isLocked && (
                    <Badge className="bg-red-100 text-red-700">
                      <Lock className="mr-1 h-3 w-3" /> Locked
                    </Badge>
                  )}
                </div>
                <p className="max-w-3xl line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}</span>
                  {event.categories && <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {event.categories.length} Kategori</span>}
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:min-w-[360px]">
                <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-muted/20 p-4 text-sm font-mono">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Publish At</span>
                    <span>{formatDateTime(event.publishAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Reg Open</span>
                    <span>{formatDateTime(event.registrationOpenAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Reg Close</span>
                    <span>{formatDateTime(event.registrationCloseAt)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border p-4 text-sm gap-2 flex-wrap">
                  <span className="font-medium">{event.totalParticipants} peserta · {event.totalBonsai} bonsai</span>
                  <div className="flex items-center gap-2">
                    {isSuperadmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => lockMutation.mutate(event.id)}
                        disabled={lockMutation.isPending}
                        className={event.isLocked ? "text-red-600 hover:text-red-700 hover:bg-red-50" : ""}
                      >
                        {event.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTargetId(event.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Hapus event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete / Archive dialog */}
      <Dialog open={Boolean(deleteTargetId)} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
        <DialogContent className="max-w-md">
          {deleteTarget && deleteTarget.totalParticipants > 0 ? (
            <>
              <DialogHeader>
                <DialogTitle>Event Tidak Bisa Dihapus</DialogTitle>
                <DialogDescription className="pt-2 space-y-3">
                  <span className="block">
                    <strong>{deleteTarget.name}</strong> memiliki{" "}
                    <strong>{deleteTarget.totalParticipants} peserta</strong> terdaftar sehingga tidak dapat dihapus.
                  </span>
                  <span className="block rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                    Anda dapat <strong>mengarsipkan</strong> event ini. Status akan diubah ke{" "}
                    <code className="rounded bg-blue-100 px-1">finished</code> — event tidak akan tampil di
                    pendaftaran publik namun data peserta tetap tersimpan.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteTargetId(null)}>Batal</Button>
                <Button
                  onClick={() => deleteTargetId && archiveMutation.mutate(deleteTargetId)}
                  disabled={archiveMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {archiveMutation.isPending ? "Mengarsipkan..." : "Arsipkan Event"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">Hapus Event?</DialogTitle>
                <DialogDescription className="pt-2">
                  Event <strong>{deleteTarget?.name}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteTargetId(null)}>Batal</Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteTargetId && deleteMutation.mutate(deleteTargetId)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{isEditing ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>
              Atur informasi lengkap event, window waktu, dan detail publik.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh] px-6 py-4">
            <div className="grid gap-6">
              {/* Timeline Validation Warning */}
              {hasInvalidTimeline && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  Timeline tidak valid. Pastikan urutan: 
                  <code> publish &lt;= reg_open &lt;= reg_close &lt;= start_date</code>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Informasi Dasar</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Event Name</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status Event (Manual Override)</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {configuredStatusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Banner Image URL</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://..." 
                        value={form.bannerUrl || ""} 
                        onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} 
                      />
                      <Button variant="outline" size="icon" disabled><ImageIcon className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      rows={5} 
                      placeholder="Tuliskan deskripsi lengkap event..." 
                      value={form.description || ""} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Timeline & Window Registrasi</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-muted-foreground">Publish At</label>
                    <Input type="datetime-local" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-muted-foreground">Registration Open</label>
                    <Input type="datetime-local" value={form.registrationOpenAt} onChange={(e) => setForm({ ...form, registrationOpenAt: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-muted-foreground">Registration Close</label>
                    <Input type="datetime-local" value={form.registrationCloseAt} onChange={(e) => setForm({ ...form, registrationCloseAt: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-muted-foreground">Start Date</label>
                    <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-muted-foreground">End Date</label>
                    <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Categories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4" /> Kategori & Biaya
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addCategory} className="h-7 text-[10px] uppercase">
                    <Plus className="h-3 w-3 mr-1" /> Add Category
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {form.categories.map((cat, idx) => (
                    <div key={idx} className="group relative rounded-xl border p-4 bg-muted/20">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeCategory(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid gap-3 md:grid-cols-4">
                        <div className="md:col-span-2">
                          <Input 
                            placeholder="Nama Kategori (Contoh: Small)" 
                            value={cat.name || ""} 
                            onChange={(e) => updateCategory(idx, { name: e.target.value })} 
                          />
                        </div>
                        <div>
                          <Input 
                            placeholder="Biaya (Rp)" 
                            value={cat.price || ""} 
                            onChange={(e) => updateCategory(idx, { price: e.target.value })} 
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Min" 
                            className="text-center px-1"
                            value={cat.minSize || ""} 
                            onChange={(e) => updateCategory(idx, { minSize: e.target.value })} 
                          />
                          <Input 
                            placeholder="Max" 
                            className="text-center px-1"
                            value={cat.maxSize || ""} 
                            onChange={(e) => updateCategory(idx, { maxSize: e.target.value })} 
                          />
                        </div>
                        <div className="md:col-span-4">
                          <Input 
                            placeholder="Deskripsi singkat kategori..." 
                            className="text-xs"
                            value={cat.description || ""} 
                            onChange={(e) => updateCategory(idx, { description: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {form.categories.length === 0 && (
                    <p className="text-center py-6 text-xs text-muted-foreground border-2 border-dashed rounded-xl">
                      Belum ada kategori yang ditambahkan.
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Rewards */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" /> Hadiah & Penghargaan
                </h3>
                <Textarea 
                  placeholder="Contoh: Juara 1 akan mendapatkan Piala dan Uang Pembinaan sebesar Rp 1.000.000" 
                  value={form.rewards || ""} 
                  onChange={(e) => setForm({ ...form, rewards: e.target.value })} 
                />
              </div>

              <Separator />

              {/* Contact Persons */}
              <div className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Kontak Panitia
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addContact} className="h-7 text-[10px] uppercase">
                    <Plus className="h-3 w-3 mr-1" /> Add Contact
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {form.contactPersons.map((contact, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input 
                        placeholder="Nama" 
                        value={contact.name || ""} 
                        onChange={(e) => updateContact(idx, { name: e.target.value })} 
                      />
                      <Input 
                        placeholder="WA (0812...)" 
                        value={contact.phone || ""} 
                        onChange={(e) => updateContact(idx, { phone: e.target.value })} 
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeContact(idx)} className="shrink-0">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 bg-muted/10 border-t">
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
