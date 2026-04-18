import { useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarDays, Check, Clock3, Copy, Download, ImagePlus, Loader2, MapPin, Plus, Ticket, Trash2, X } from "lucide-react";
import axios from "axios";
import { generateRegistrationPDF } from "@/utils/generateRegistrationPDF";
import { useGet, usePost } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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

const ACCESSORY_OPTIONS = ["Meja", "Batu", "Rumput Pendamping"] as const;

interface BonsaiEntry {
  id: string;
  name: string;
  species: string;
  sizeCategory: string;
  photoUrl: string;
  previewUrl?: string;
  uploading?: boolean;
  accessories: string[];
}

interface RegisterResponse {
  success: boolean;
  count: number;
  registrations: Array<{
    participant: {
      registrationNumber: string;
      judgingNumber: string;
      judgingNumberStatus: string;
      status: string;
    };
    bonsai: {
      name: string;
      species: string;
      sizeCategory?: string;
      accessories?: string[];
    };
  }>;
}

export default function EventRegistrationPage() {
  const { eventId = "" } = useParams();
  const { data: event, isLoading } = useGet<PublicEvent>(["public-event", eventId], `/events/public/${eventId}`);
  const registerMutation = usePost<any, RegisterResponse>("/public/register");

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    phone: "",
    city: "Depok",
  });

  const [bonsais, setBonsais] = useState<BonsaiEntry[]>([
    { id: crypto.randomUUID(), name: "", species: "", sizeCategory: "Large", photoUrl: "", accessories: [] }
  ]);

  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const isDisabled = useMemo(() => !event?.registrationAvailable, [event]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  const handleDownloadPDF = async () => {
    if (!result || !event) return;
    setPdfLoading(true);
    try {
      await generateRegistrationPDF({
        eventName: event.name,
        eventLocation: event.location,
        eventStartDate: format(new Date(event.startDate), "dd MMMM yyyy"),
        ownerName: personalInfo.name,
        ownerCity: personalInfo.city,
        ownerPhone: personalInfo.phone,
        registrations: result.registrations,
      });
      toast.success("PDF berhasil diunduh");
    } catch {
      toast.error("Gagal membuat PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const addBonsai = () => {
    setBonsais([
      ...bonsais,
      { id: crypto.randomUUID(), name: "", species: "", sizeCategory: "Large", photoUrl: "", accessories: [] }
    ]);
  };

  const toggleAccessory = (bonsaiId: string, item: string) => {
    setBonsais(bonsais.map(b => {
      if (b.id !== bonsaiId) return b;
      const already = b.accessories.includes(item);
      return {
        ...b,
        accessories: already
          ? b.accessories.filter(a => a !== item)
          : [...b.accessories, item],
      };
    }));
  };

  const removeBonsai = (id: string) => {
    if (bonsais.length <= 1) return;
    setBonsais(bonsais.filter(b => b.id !== id));
  };

  const updateBonsai = (id: string, updates: Partial<BonsaiEntry>) => {
    setBonsais(bonsais.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    updateBonsai(id, { previewUrl, uploading: true });

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Do NOT set Content-Type manually — axios sets it with the correct boundary automatically
      const { data } = await axios.post(`${API_BASE}/public/upload-photo`, formData);
      updateBonsai(id, { photoUrl: data.url, uploading: false });
      toast.success("Foto berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah foto. Silakan coba lagi.");
      updateBonsai(id, { previewUrl: undefined, photoUrl: "", uploading: false });
    }
  };

  const handleRemovePhoto = (id: string) => {
    updateBonsai(id, { previewUrl: undefined, photoUrl: "" });
  };

  const handleSubmit = async () => {
    if (!eventId) return;
    
    // Validate
    if (!personalInfo.name || !personalInfo.phone) {
      toast.error("Nama dan nomor telepon harus diisi");
      return;
    }

    const validBonsais = bonsais.filter(b => b.name && b.species);
    if (validBonsais.length === 0) {
      toast.error("Minimal satu bonsai dengan nama dan spesies harus diisi");
      return;
    }

    try {
      const payload = {
        eventId,
        ...personalInfo,
        bonsais: validBonsais.map(({ name, species, sizeCategory, photoUrl, accessories }) => ({
          name, species, sizeCategory, photoUrl, accessories
        }))
      };

      const response = await registerMutation.mutateAsync(payload);
      setResult(response);
      toast.success(`Berhasil mendaftarkan ${response.count} pohon`);
    } catch {
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <CardTitle className="text-emerald-800">Registrasi Berhasil ✓</CardTitle>
                <CardDescription className="mt-1">
                  {result.count} pohon berhasil didaftarkan. Simpan nomor registrasi sebelum menutup halaman ini.
                </CardDescription>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="shrink-0 bg-emerald-700 hover:bg-emerald-800 gap-2"
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Bukti PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.registrations.map((reg, idx) => (
              <div key={idx} className="rounded-2xl border bg-background shadow-sm overflow-hidden">
                {/* Tree header */}
                <div className="flex items-center gap-3 border-b px-5 py-3 bg-muted/30">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold leading-tight truncate">{reg.bonsai.name}</p>
                    <p className="text-xs italic text-muted-foreground truncate">{reg.bonsai.species}</p>
                  </div>
                  {reg.bonsai.sizeCategory && (
                    <span className="ml-auto shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium">
                      {reg.bonsai.sizeCategory}
                    </span>
                  )}
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
                  {/* Registration number */}
                  <div className="px-5 py-4">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Nomor Registrasi</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="font-mono text-lg font-black text-primary">
                        {reg.participant.registrationNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(reg.participant.registrationNumber, `reg-${idx}`)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Salin nomor registrasi"
                      >
                        {copiedKey === `reg-${idx}` ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Gunakan nomor ini untuk check-in</p>
                  </div>

                  {/* Judging number */}
                  <div className="px-5 py-4">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Nomor Penjurian</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="font-mono text-lg font-black text-emerald-600">
                        {reg.participant.judgingNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(reg.participant.judgingNumber, `jud-${idx}`)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Salin nomor penjurian"
                      >
                        {copiedKey === `jud-${idx}` ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-1 ${
                      reg.participant.judgingNumberStatus === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {reg.participant.judgingNumberStatus === 'confirmed' ? '● Dikonfirmasi' : '○ Akan dikonfirmasi saat check-in'}
                    </span>
                  </div>
                </div>

                {/* Accessories */}
                {reg.bonsai.accessories && reg.bonsai.accessories.length > 0 && (
                  <div className="border-t px-5 py-2.5 bg-muted/20">
                    <span className="text-xs text-muted-foreground">Perlengkapan: </span>
                    {reg.bonsai.accessories.map(acc => (
                      <span key={acc} className="mr-1.5 inline-flex items-center rounded-full bg-background border px-2 py-0.5 text-xs font-medium">{acc}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Reminder banner */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900 mb-1">⚠ Jangan tutup halaman sebelum menyimpan nomor Anda</p>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>Gunakan tombol <strong>Download Bukti PDF</strong> untuk menyimpan permanen.</li>
                <li>Atau salin nomor registrasi menggunakan ikon copy di atas.</li>
                <li>Nomor bisa dicek kapan saja di <Link to="/peserta" className="underline font-medium">Portal Peserta</Link> dengan nomor HP.</li>
              </ul>
            </div>

            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => window.location.reload()}>Daftar Pohon Lain</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Form Pendaftaran Peserta</CardTitle>
            <CardDescription>
              Isi data diri dan daftar pohon yang akan diikutkan dalam kompetisi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {!event.registrationAvailable && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Pendaftaran belum dibuka atau sudah ditutup untuk event ini.
              </div>
            )}

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[12px] text-primary-foreground">1</span>
                Informasi Pemilik
              </h3>
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <Input 
                    placeholder="Masukkan nama lengkap"
                    value={personalInfo.name} 
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} 
                    disabled={isDisabled} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nomor Telepon (WhatsApp)</label>
                  <Input 
                    placeholder="0812xxxx"
                    value={personalInfo.phone} 
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} 
                    disabled={isDisabled} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kota Asal</label>
                  <Input 
                    value={personalInfo.city} 
                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })} 
                    disabled={isDisabled} 
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Bonsai List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[12px] text-primary-foreground">2</span>
                  Daftar Pohon
                </h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addBonsai}
                  disabled={isDisabled}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" /> Tambah Pohon
                </Button>
              </div>

              <div className="space-y-8">
                {bonsais.map((bonsai, index) => (
                  <div key={bonsai.id} className="relative rounded-2xl border p-6 bg-muted/10">
                    {bonsais.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBonsai(bonsai.id)}
                        className="absolute right-4 top-4 text-muted-foreground hover:text-destructive transition-colors"
                        disabled={isDisabled}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                    
                    <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Pohon #{index + 1}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Bonsai</label>
                        <Input 
                          placeholder="Contoh: Sang Maestro"
                          value={bonsai.name} 
                          onChange={(e) => updateBonsai(bonsai.id, { name: e.target.value })} 
                          disabled={isDisabled} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Spesies</label>
                        <Input 
                          placeholder="Contoh: Santigi (Pemphis acidula)"
                          value={bonsai.species} 
                          onChange={(e) => updateBonsai(bonsai.id, { species: e.target.value })} 
                          disabled={isDisabled} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Kategori Ukuran</label>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={bonsai.sizeCategory}
                          onChange={(e) => updateBonsai(bonsai.id, { sizeCategory: e.target.value })}
                          disabled={isDisabled}
                        >
                          <option value="Mame">Mame (&lt; 15cm)</option>
                          <option value="Small">Small (15 - 30cm)</option>
                          <option value="Medium">Medium (31 - 60cm)</option>
                          <option value="Large">Large (61 - 90cm)</option>
                          <option value="XL">XL (&gt; 90cm)</option>
                        </select>
                      </div>

                      {/* Accessories */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">
                          Perlengkapan Pendamping
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(opsional — centang yang dibawa)</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {ACCESSORY_OPTIONS.map((item) => {
                            const checked = bonsai.accessories.includes(item);
                            return (
                              <button
                                key={item}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => toggleAccessory(bonsai.id, item)}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                  checked
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-input bg-background text-muted-foreground hover:border-primary/40"
                                } disabled:opacity-50 disabled:pointer-events-none`}
                              >
                                <span className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                                  checked ? "bg-primary border-primary text-primary-foreground" : "border-input"
                                }`}>
                                  {checked ? "✓" : ""}
                                </span>
                                {item}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Photo upload for this specific bonsai */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Foto Bonsai <span className="text-muted-foreground font-normal text-xs">(opsional)</span></label>
                        
                        {bonsai.previewUrl ? (
                          <div className="relative w-fit">
                            <img
                              src={bonsai.previewUrl}
                              alt="Preview"
                              className="h-24 w-24 rounded-lg object-cover border"
                            />
                            {bonsai.uploading && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                              </div>
                            )}
                            {!bonsai.uploading && (
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(bonsai.id)}
                                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <label
                            className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
                          >
                            <ImagePlus className="h-5 w-5" />
                            <span>Pilih foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isDisabled}
                              onChange={(e) => handleFileChange(bonsai.id, e)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <p className="text-xs text-muted-foreground text-center max-w-md">
                Dengan mengklik tombol di bawah, Anda menyetujui syarat dan ketentuan kompetisi.
                Semua data akan digunakan untuk keperluan administrasi event.
              </p>
              <Button 
                size="lg" 
                className="w-full md:w-64 h-12 text-lg font-semibold"
                onClick={handleSubmit} 
                disabled={isDisabled || registerMutation.isPending || bonsais.some(b => b.uploading)}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  `Daftar ${bonsais.length} Pohon`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
