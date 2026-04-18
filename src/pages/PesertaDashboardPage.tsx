import { useState } from "react";
import {
  Search,
  TreePine,
  User,
  MapPin,
  Calendar,
  Award,
  Hash,
  ClipboardList,
  Trophy,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

type SearchType = "phone" | "registration_number" | "judging_number";

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  registered:  { label: "Terdaftar",      variant: "outline" },
  checked_in:  { label: "Check-in",       variant: "secondary" },
  waiting:     { label: "Menunggu Antrian", variant: "secondary" },
  judging:     { label: "Sedang Dinilai", variant: "default" },
  judged:      { label: "Sudah Dinilai",  variant: "default" },
};

const JUDGING_STATUS_LABEL: Record<string, string> = {
  reserved:  "Nomor Dirahasiakan",
  confirmed: "Nomor Dikonfirmasi",
};

const criteria = [
  { key: "nebari",      label: "Nebari" },
  { key: "trunk",       label: "Trunk" },
  { key: "branch",      label: "Branch" },
  { key: "composition", label: "Komposisi" },
  { key: "pot",         label: "Pot" },
];

export default function PesertaDashboardPage() {
  const [searchType, setSearchType] = useState<SearchType>("phone");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const placeholder: Record<SearchType, string> = {
    phone:               "Contoh: 08123456789",
    registration_number: "Contoh: REG-2026-0001",
    judging_number:      "Contoh: J-001",
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setData(null);
    try {
      const params = { [searchType]: query.trim() };
      const res = await axios.get(`${API_BASE}/participants/lookup`, { params });
      setData(res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        toast.error("Data tidak ditemukan. Periksa kembali nomor yang dimasukkan.");
      } else {
        toast.error("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const status = data ? STATUS_LABEL[data.status] ?? { label: data.status, variant: "outline" } : null;

  return (
    <div className="container max-w-3xl py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary">
          PESERTA SELF-SERVICE
        </Badge>
        <h1 className="font-display text-4xl font-black tracking-tight">Portal Peserta</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Cek status penjurian, nomor registrasi, skor, dan peringkat Anda.
        </p>
      </div>

      {/* Search */}
      <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="px-4 pt-4 pb-2">
            <Tabs value={searchType} onValueChange={(v) => { setSearchType(v as SearchType); setQuery(""); setData(null); }}>
              <TabsList className="w-full">
                <TabsTrigger value="phone" className="flex-1">No. HP</TabsTrigger>
                <TabsTrigger value="registration_number" className="flex-1">No. Registrasi</TabsTrigger>
                <TabsTrigger value="judging_number" className="flex-1">No. Penjurian</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row p-3 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={placeholder[searchType]}
                className="pl-10 h-12 bg-background border text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12 px-6 font-bold" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {data && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">

          {/* Identity card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{data.name}</CardTitle>
                    {data.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> {data.city}
                      </p>
                    )}
                  </div>
                </div>
                {status && (
                  <Badge variant={status.variant} className="shrink-0 mt-1">{status.label}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t pt-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">
                    No. Registrasi
                  </p>
                  <p className="font-mono font-semibold">{data.registrationNumber ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">
                    No. Penjurian
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-semibold">
                      {data.judgingNumberStatus === 'confirmed' ? data.judgingNumber : '—'}
                    </p>
                    {data.judgingNumberStatus && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                        {JUDGING_STATUS_LABEL[data.judgingNumberStatus]}
                      </Badge>
                    )}
                  </div>
                </div>
                {data.event && (
                  <>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">Event</p>
                      <p className="font-medium">{data.event.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">Lokasi</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {data.event.location}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Score & Rank — only if judged */}
          {data.status === 'judged' && data.totalScore !== null && (
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <h3 className="font-display text-base font-bold text-emerald-800 flex items-center gap-2">
                      <Award className="h-4 w-4" /> Hasil Penilaian
                    </h3>
                    {data.scores && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        {criteria.map((c) => (
                          <div key={c.key} className="flex justify-between">
                            <span className="text-muted-foreground">{c.label}</span>
                            <span className="font-mono font-bold text-emerald-700">{data.scores[c.key]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-center shrink-0">
                    {data.rank && (
                      <div className="mb-2">
                        <div className="text-[9px] uppercase font-bold text-emerald-600">Peringkat</div>
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          <span className="text-4xl font-mono font-black text-emerald-700">#{data.rank}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-[9px] uppercase font-bold text-emerald-600">Total Skor</div>
                      <div className="text-5xl font-mono font-black text-emerald-700 leading-none">
                        {data.totalScore}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bonsai list */}
          {data.bonsai?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" /> Bonsai Terdaftar
              </h3>
              {data.bonsai.map((b: any) => (
                <Card key={b.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-20 h-20 bg-muted shrink-0">
                      <img
                        src={b.imageUrl || "/placeholder.svg"}
                        className="w-full h-full object-cover"
                        alt={b.name}
                      />
                    </div>
                    <CardContent className="p-4 flex flex-col justify-center gap-1">
                      <p className="font-bold text-sm">{b.name}</p>
                      <p className="text-[11px] italic text-muted-foreground">{b.species}</p>
                      {b.sizeCategory && (
                        <Badge variant="secondary" className="w-fit text-[10px]">{b.sizeCategory}</Badge>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Status info for non-judged */}
          {data.status !== 'judged' && (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-5 flex items-center gap-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Penilaian belum selesai</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {data.status === 'registered' && 'Peserta terdaftar. Hadir dan lakukan check-in saat hari H.'}
                    {data.status === 'checked_in' && 'Check-in berhasil. Menunggu masuk antrian penjurian.'}
                    {data.status === 'waiting' && 'Bonsai Anda dalam antrian. Harap menunggu.'}
                    {data.status === 'judging' && 'Bonsai Anda sedang dinilai.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state */}
      {!data && !isLoading && (
        <div className="pt-8 text-center text-muted-foreground space-y-3">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Hash className="h-8 w-8 opacity-20" />
          </div>
          <p className="text-sm">Masukkan nomor HP, nomor registrasi, atau nomor penjurian untuk melihat status Anda.</p>
        </div>
      )}
    </div>
  );
}
