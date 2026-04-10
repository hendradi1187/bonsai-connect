import { useMemo, useState } from "react";
import { useGet, usePost } from "@/hooks/useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  QrCode,
  CheckCircle2,
  TreePine,
  Phone,
  MapPin,
  Ticket,
  Hash,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ParticipantRow {
  id: string;
  name: string;
  phone: string;
  city: string;
  eventId: string;
  eventName: string;
  registrationNumber: string | null;
  judgingNumber: string | null;
  judgingNumberStatus: "reserved" | "confirmed";
  treesCount: number;
  status: "registered" | "checked_in" | "waiting" | "judging" | "judged";
  bonsai: null | {
    treeName: string;
    species: string;
    sizeCategory: string;
    photoUrl?: string | null;
  };
}

const STATUS_OPTIONS = ["registered", "checked_in", "waiting", "judging", "judged"] as const;

const participantStatusVariant: Record<ParticipantRow["status"], string> = {
  registered: "bg-slate-100 text-slate-700",
  checked_in: "bg-blue-100 text-blue-700",
  waiting: "bg-amber-100 text-amber-800",
  judging: "bg-purple-100 text-purple-700",
  judged: "bg-emerald-100 text-emerald-700",
};

const judgingStatusVariant: Record<ParticipantRow["judgingNumberStatus"], string> = {
  reserved: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-700",
};

export default function AdminParticipantsPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === "superadmin";
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRow | null>(null);

  const [newParticipant, setNewParticipant] = useState({ name: "", phone: "", city: "" });
  const [newTree, setNewTree] = useState({ treeName: "", species: "", sizeCategory: "Large", photoUrl: "" });
  const [overrideForm, setOverrideForm] = useState({ judgingNumber: "", judgingNumberStatus: "confirmed" as "reserved" | "confirmed" });

  const { data: participants, isLoading } = useGet<ParticipantRow[]>(["participants"], "/participants");
  const addMutation = usePost("/participants", [["participants"]]);
  const checkInMutation = usePost("/participants/check-in", [["participants"], ["judging-queue"]]);

  const overrideMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/participants/${selectedParticipant!.id}/judging-number`, overrideForm);
      return res.data;
    },
    onSuccess: async () => {
      toast.success("Judging number overridden");
      setIsOverrideOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Override failed");
    },
  });

  // Unique event list for filter dropdown
  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    participants?.forEach((p) => map.set(p.eventId, p.eventName));
    return Array.from(map.entries());
  }, [participants]);

  const filtered = useMemo(() => {
    if (!participants) return [];
    return participants.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.eventName.toLowerCase().includes(q) ||
        (p.registrationNumber || "").toLowerCase().includes(q) ||
        (p.judgingNumber || "").toLowerCase().includes(q) ||
        (p.phone || "").includes(q);

      const matchEvent = filterEvent === "all" || p.eventId === filterEvent;
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchEvent && matchStatus;
    });
  }, [participants, search, filterEvent, filterStatus]);

  const activeFilters = (filterEvent !== "all" ? 1 : 0) + (filterStatus !== "all" ? 1 : 0);

  const openCheckIn = (p: ParticipantRow) => {
    setSelectedParticipant(p);
    setNewTree({
      treeName: p.bonsai?.treeName || "",
      species: p.bonsai?.species || "",
      sizeCategory: p.bonsai?.sizeCategory || "Large",
      photoUrl: p.bonsai?.photoUrl || "",
    });
    setIsCheckInOpen(true);
  };

  const openOverride = (p: ParticipantRow) => {
    setSelectedParticipant(p);
    setOverrideForm({
      judgingNumber: p.judgingNumber || "",
      judgingNumberStatus: p.judgingNumberStatus || "confirmed",
    });
    setIsOverrideOpen(true);
  };

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync(newParticipant);
      toast.success("Participant registered");
      setIsAddOpen(false);
      setNewParticipant({ name: "", phone: "", city: "" });
    } catch { toast.error("Registration failed"); }
  };

  const handleCheckIn = async () => {
    if (!selectedParticipant) return;
    try {
      await checkInMutation.mutateAsync({ participantId: selectedParticipant.id, ...newTree });
      toast.success("Check-in confirmed");
      setIsCheckInOpen(false);
    } catch { toast.error("Check-in failed"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Participant Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} dari {participants?.length || 0} peserta
            {activeFilters > 0 && <span className="ml-1 text-primary">· {activeFilters} filter aktif</span>}
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Register Participant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, nomor, atau HP..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Semua Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Event</SelectItem>
            {eventOptions.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterEvent("all"); setFilterStatus("all"); }}>
            <X className="mr-1 h-3.5 w-3.5" /> Reset filter
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peserta</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Nomor</TableHead>
              <TableHead>Bonsai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              : filtered.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      Tidak ada data yang cocok dengan filter.
                    </TableCell>
                  </TableRow>
                )
              : filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {p.city}
                        </p>
                        <p className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{p.eventName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{p.treesCount} bonsai</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2 text-xs">
                        <div className="rounded-lg border bg-muted/20 p-2">
                          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                            <Ticket className="h-3 w-3" /> Registration
                          </p>
                          <p className="mt-1 font-mono font-bold">{p.registrationNumber || "—"}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-2">
                          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                            <Hash className="h-3 w-3" /> Judging
                          </p>
                          <p className="mt-1 font-mono font-bold">{p.judgingNumber || "—"}</p>
                          <Badge className={`mt-2 ${judgingStatusVariant[p.judgingNumberStatus] || judgingStatusVariant.reserved}`}>
                            {p.judgingNumberStatus}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.bonsai ? (
                        <div className="space-y-1 text-sm">
                          <p className="font-medium">{p.bonsai.treeName}</p>
                          <p className="text-xs italic text-muted-foreground">{p.bonsai.species}</p>
                          <Badge variant="outline">{p.bonsai.sizeCategory}</Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TreePine className="h-4 w-4" /> Belum ada bonsai
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={participantStatusVariant[p.status] || participantStatusVariant.registered}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => openCheckIn(p)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            {p.status === "registered" ? "Verify & Check-in" : "Edit Check-in"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {isSuperadmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openOverride(p)}
                                className="text-amber-700 focus:text-amber-800"
                              >
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Override Judging Number
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Participant Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Participant</DialogTitle>
            <DialogDescription>Sistem akan membuat registration_number dan judging_number reserved otomatis.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { label: "Full Name", key: "name", placeholder: "Ahmad Wijaya" },
              { label: "Phone", key: "phone", placeholder: "0812..." },
              { label: "City", key: "city", placeholder: "Depok" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium">{label}</label>
                <Input
                  placeholder={placeholder}
                  value={(newParticipant as any)[key]}
                  onChange={(e) => setNewParticipant({ ...newParticipant, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Entry & Check-in</DialogTitle>
            <DialogDescription>
              Verifikasi data bonsai untuk <strong>{selectedParticipant?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Registration</div>
                <div className="mt-1 font-mono font-bold">{selectedParticipant?.registrationNumber || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Judging Number</div>
                <div className="mt-1 font-mono font-bold">{selectedParticipant?.judgingNumber || "—"}</div>
              </div>
            </div>
            {[
              { label: "Tree Name", key: "treeName", placeholder: "Sang Penjaga" },
              { label: "Species", key: "species", placeholder: "Pemphis acidula" },
              { label: "Photo URL", key: "photoUrl", placeholder: "https://..." },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium">{label}</label>
                <Input
                  placeholder={placeholder}
                  value={(newTree as any)[key]}
                  onChange={(e) => setNewTree({ ...newTree, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm font-medium">Size Category</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newTree.sizeCategory}
                onChange={(e) => setNewTree({ ...newTree, sizeCategory: e.target.value })}
              >
                {["Mame", "Small", "Medium", "Large", "XL"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckIn} className="bg-emerald-600 hover:bg-emerald-700" disabled={checkInMutation.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Judging Number Dialog — superadmin only */}
      {isSuperadmin && (
        <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                Override Judging Number
              </DialogTitle>
              <DialogDescription>
                Tindakan superadmin. Mengubah nomor penjurian <strong>{selectedParticipant?.name}</strong> akan direkam di audit log.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Nomor saat ini: <span className="font-mono font-bold">{selectedParticipant?.judgingNumber || "—"}</span>
                {" · "}Status: <span className="font-bold">{selectedParticipant?.judgingNumberStatus}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Judging Number Baru</label>
                <Input
                  placeholder="Contoh: J-009"
                  value={overrideForm.judgingNumber}
                  onChange={(e) => setOverrideForm({ ...overrideForm, judgingNumber: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={overrideForm.judgingNumberStatus}
                  onValueChange={(v) => setOverrideForm({ ...overrideForm, judgingNumberStatus: v as "reserved" | "confirmed" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserved">reserved</SelectItem>
                    <SelectItem value="confirmed">confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOverrideOpen(false)}>Cancel</Button>
              <Button
                onClick={() => overrideMutation.mutate()}
                disabled={overrideMutation.isPending || !overrideForm.judgingNumber}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {overrideMutation.isPending ? "Saving..." : "Override"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
