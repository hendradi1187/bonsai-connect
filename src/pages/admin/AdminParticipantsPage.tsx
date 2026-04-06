import { useState } from "react";
import { useGet, usePost } from "@/hooks/useApi";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ParticipantRow {
  id: string;
  name: string;
  phone: string;
  city: string;
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
  const [search, setSearch] = useState("");
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRow | null>(null);

  const [newParticipant, setNewParticipant] = useState({
    name: "",
    phone: "",
    city: "",
  });

  const [newTree, setNewTree] = useState({
    treeName: "",
    species: "",
    sizeCategory: "Large",
    photoUrl: "",
  });

  const { data: participants, isLoading } = useGet<ParticipantRow[]>(["participants"], "/participants");
  const addParticipantMutation = usePost("/participants", [["participants"]]);
  const checkInMutation = usePost("/participants/check-in", [["participants"], ["judging-queue"]]);

  const filteredParticipants = participants?.filter((participant) => {
    const query = search.toLowerCase();
    return (
      participant.name.toLowerCase().includes(query) ||
      participant.city.toLowerCase().includes(query) ||
      participant.eventName.toLowerCase().includes(query) ||
      (participant.registrationNumber || "").toLowerCase().includes(query) ||
      (participant.judgingNumber || "").toLowerCase().includes(query)
    );
  });

  const openCheckIn = (participant: ParticipantRow) => {
    setSelectedParticipant(participant);
    setNewTree({
      treeName: participant.bonsai?.treeName || "",
      species: participant.bonsai?.species || "",
      sizeCategory: participant.bonsai?.sizeCategory || "Large",
      photoUrl: participant.bonsai?.photoUrl || "",
    });
    setIsCheckInOpen(true);
  };

  const handleAddParticipant = async () => {
    try {
      await addParticipantMutation.mutateAsync(newParticipant);
      toast.success("Participant registered successfully");
      setIsAddParticipantOpen(false);
      setNewParticipant({ name: "", phone: "", city: "" });
    } catch {
      toast.error("Registration failed");
    }
  };

  const handleCheckIn = async () => {
    if (!selectedParticipant) {
      return;
    }

    try {
      await checkInMutation.mutateAsync({
        participantId: selectedParticipant.id,
        ...newTree,
      });
      toast.success("Check-in confirmed and judging number activated");
      setIsCheckInOpen(false);
      setSelectedParticipant(null);
      setNewTree({ treeName: "", species: "", sizeCategory: "Large", photoUrl: "" });
    } catch {
      toast.error("Check-in failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Participant Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {participants?.length || 0} peserta terdaftar · {participants?.reduce((accumulator, participant) => accumulator + (participant.treesCount || 0), 0) || 0} bonsai
          </p>
        </div>
        <Button onClick={() => setIsAddParticipantOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Register Participant
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, event, nomor register, atau nomor penjurian..."
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Nomor</TableHead>
              <TableHead>Bonsai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((item) => (
                <TableRow key={item}>
                  <TableCell colSpan={6} className="h-16 animate-pulse bg-muted/20" />
                </TableRow>
              ))
            ) : filteredParticipants?.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{participant.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {participant.city}
                    </p>
                    <p className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                      <Phone className="h-3 w-3" /> {participant.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{participant.eventName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{participant.treesCount} bonsai entry</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg border bg-muted/20 p-2">
                      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <Ticket className="h-3 w-3" /> Registration
                      </p>
                      <p className="mt-1 font-mono font-bold">{participant.registrationNumber || "Belum ada"}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-2">
                      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <Hash className="h-3 w-3" /> Judging
                      </p>
                      <p className="mt-1 font-mono font-bold">{participant.judgingNumber || "Belum ada"}</p>
                      <Badge className={`mt-2 ${judgingStatusVariant[participant.judgingNumberStatus] || judgingStatusVariant.reserved}`}>
                        {participant.judgingNumberStatus}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {participant.bonsai ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{participant.bonsai.treeName}</p>
                      <p className="text-xs text-muted-foreground italic">{participant.bonsai.species}</p>
                      <Badge variant="outline">{participant.bonsai.sizeCategory}</Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TreePine className="h-4 w-4" />
                      Belum ada bonsai
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={participantStatusVariant[participant.status] || participantStatusVariant.registered}>
                    {participant.status}
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
                      <DropdownMenuItem onClick={() => openCheckIn(participant)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        {participant.status === "registered" ? "Verify & Check-in" : "Edit Check-in"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Participant</DialogTitle>
            <DialogDescription>
              Registrasi admin akan langsung membuat nomor registrasi dan nomor penjurian reserved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="e.g. Ahmad Wijaya"
                value={newParticipant.name}
                onChange={(event) => setNewParticipant({ ...newParticipant, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="0812..."
                value={newParticipant.phone}
                onChange={(event) => setNewParticipant({ ...newParticipant, phone: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="e.g. Depok"
                value={newParticipant.city}
                onChange={(event) => setNewParticipant({ ...newParticipant, city: event.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddParticipantOpen(false)}>Cancel</Button>
            <Button onClick={handleAddParticipant}>Register Participant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Entry & Check-in</DialogTitle>
            <DialogDescription>
              Verifikasi data bonsai untuk <strong>{selectedParticipant?.name}</strong>. Nomor penjurian reserved akan dikonfirmasi saat check-in selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Registration Number</div>
                <div className="mt-1 font-mono font-bold">{selectedParticipant?.registrationNumber || "Belum ada"}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Judging Number</div>
                <div className="mt-1 font-mono font-bold">{selectedParticipant?.judgingNumber || "Belum ada"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tree Name / Variety</label>
              <Input
                placeholder="e.g. Sang Penjaga / Santigi"
                value={newTree.treeName}
                onChange={(event) => setNewTree({ ...newTree, treeName: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Species</label>
              <Input
                placeholder="e.g. Pemphis acidula"
                value={newTree.species}
                onChange={(event) => setNewTree({ ...newTree, species: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Size Category</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={newTree.sizeCategory}
                onChange={(event) => setNewTree({ ...newTree, sizeCategory: event.target.value })}
              >
                <option value="Mame">Mame (&lt; 15cm)</option>
                <option value="Small">Small (15-30cm)</option>
                <option value="Medium">Medium (31-60cm)</option>
                <option value="Large">Large (61-90cm)</option>
                <option value="XL">XL (&gt; 90cm)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo URL</label>
              <Input
                placeholder="https://..."
                value={newTree.photoUrl}
                onChange={(event) => setNewTree({ ...newTree, photoUrl: event.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckIn} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
