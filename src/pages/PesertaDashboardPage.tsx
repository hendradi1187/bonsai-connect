import { useState } from "react";
import { useGet } from "@/hooks/useApi";
import { 
  Search, 
  TreePine, 
  User, 
  MapPin, 
  Calendar, 
  Award,
  BookOpen,
  ArrowRight,
  QrCode
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PesertaDashboardPage() {
  const [searchPhone, setSearchPhone] = useState("");
  const [participantData, setParticipantData] = useState<any>(null);

  // API Hooks
  const { data: searchResult, isLoading, refetch } = useGet<any>(
    ['participant-lookup', searchPhone], 
    `/participants/lookup?phone=${searchPhone}`,
    { enabled: false }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone) return;
    
    try {
      const result = await refetch();
      if (result.data) {
        setParticipantData(result.data);
      } else {
        toast.error("Data tidak ditemukan. Pastikan nomor HP sesuai.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mencari data.");
    }
  };

  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary">
          PESERTA SELF-SERVICE
        </Badge>
        <h1 className="font-display text-4xl font-black tracking-tight">Portal Peserta Bonsai</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Cek status penjurian, lihat sertifikat digital, dan kelola Bonsai Passport Anda dalam satu tempat.
        </p>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row p-2 gap-2 bg-muted/30">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Masukkan Nomor WhatsApp (contoh: 0812...)" 
                className="pl-12 h-14 bg-background border-none text-lg"
                value={searchPhone}
                onChange={e => setSearchPhone(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-14 px-8 text-lg font-bold" type="submit" disabled={isLoading}>
              {isLoading ? "Mencari..." : "Buka Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {participantData ? (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{participantData.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" /> {participantData.city} · <Calendar className="h-4 w-4" /> Member sejak 2024
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Trees List */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <TreePine className="h-5 w-5 text-primary" />
                Pohon Terdaftar
              </h3>
              {participantData.trees?.map((tree: any) => (
                <Card key={tree.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="flex">
                    <div className="w-24 h-24 bg-muted shrink-0">
                      <img src={tree.imageUrl || "/placeholder.svg"} className="w-full h-full object-cover" alt={tree.treeName} />
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-[10px] font-bold text-primary">{tree.treeNumber}</p>
                          <h4 className="font-bold text-sm">{tree.treeName}</h4>
                        </div>
                        <Badge variant={tree.status === 'judged' ? 'default' : 'secondary'} className="text-[10px]">
                          {tree.status === 'judged' ? 'Dinilai' : 'Menunggu'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-[10px] text-muted-foreground italic">{tree.species}</p>
                        {tree.status === 'judged' && (
                          <div className="text-right">
                            <p className="text-[8px] uppercase font-bold text-muted-foreground">Total Skor</p>
                            <p className="font-mono font-black text-lg leading-none">{tree.totalScore}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Akses Cepat
              </h3>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-between h-16 group" asChild>
                  <a href={`/bonsai-passport/${participantData.id}`}>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="font-bold">Bonsai Passport</p>
                        <p className="text-[10px] text-muted-foreground">Identitas digital semua koleksi Anda</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button variant="outline" className="justify-between h-16 group">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-500" />
                    <div className="text-left">
                      <p className="font-bold">E-Certificate</p>
                      <p className="text-[10px] text-muted-foreground">Unduh sertifikat kemenangan Anda</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Tunjukkan QR Saat Check-in</p>
                    <p className="text-xs text-muted-foreground">Gunakan QR Code ini untuk pendaftaran cepat di lokasi event.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-12 text-center text-muted-foreground space-y-4">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
             <User className="h-10 w-10 opacity-20" />
          </div>
          <p>Belum ada data yang ditampilkan. Silakan cari menggunakan nomor WhatsApp Anda.</p>
        </div>
      )}
    </div>
  );
}
