import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Award,
  BookOpen,
  CalendarDays,
  TreePine,
  Star,
  CheckCircle2,
  Search,
  Radio,
  MapPin,
  Trophy,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import heroImage from "@/assets/bonsai-hero.jpg";
import { mockEvents, mockBonsai } from "@/data/mockData";
import { BonsaiCard, getBonsaiImage } from "@/components/BonsaiCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: "12,450+", label: "Bonsai Terdaftar", icon: TreePine },
  { value: "85+",     label: "Event Nasional",   icon: CalendarDays },
  { value: "5,200+",  label: "Sertifikat Aktif", icon: Award },
  { value: "34",      label: "Provinsi",         icon: MapPin },
];

const steps = [
  { number: "01", icon: BookOpen,    title: "Daftar Bonsai",      desc: "Upload data, foto, dan spesies bonsai Anda ke sistem registry nasional." },
  { number: "02", icon: CalendarDays, title: "Ikuti Kompetisi",   desc: "Pilih event nasional atau regional yang tersedia dan daftarkan bonsai." },
  { number: "03", icon: Star,         title: "Penilaian Berjuri", desc: "Bonsai dinilai oleh juri bersertifikat secara digital dan transparan." },
  { number: "04", icon: Shield,       title: "Bonsai Passport",   desc: "Dapatkan ID digital permanen dan sertifikat resmi terverifikasi." },
];

const liveArenaItems = [
  {
    id: "evt-001",
    name: "Depok Bonsai Festival 2026",
    location: "Balai Kota Depok",
    top3: [
      { no: "J-007", name: "Ficus Retusa 'Nusantara'", score: 87.5 },
      { no: "J-013", name: "Serissa Foetida 'Pagi'",   score: 85.0 },
      { no: "J-002", name: "Juniperus 'Gunung Mas'",   score: 82.0 },
    ],
  },
  {
    id: "evt-002",
    name: "West Java Championship 2025",
    location: "Gedung Sate, Bandung",
    top3: [
      { no: "J-021", name: "Bougainvillea 'Merah Api'", score: 90.0 },
      { no: "J-008", name: "Azalea 'Putih Bersih'",     score: 88.5 },
      { no: "J-034", name: "Wrightia 'Emas Kecil'",     score: 86.0 },
    ],
  },
  {
    id: "evt-003",
    name: "Nasional Open PPBI 2025",
    location: "GOR Bulungan, Jakarta",
    top3: [
      { no: "J-001", name: "Ficus Microcarpa 'Raja'",   score: 92.0 },
      { no: "J-044", name: "Carmona 'Subur Jaya'",      score: 89.5 },
      { no: "J-017", name: "Podocarpus 'Hijau Daun'",   score: 87.0 },
    ],
  },
];

const rankMedal = ["🥇", "🥈", "🥉"];

// ─── Fade-up variant ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
});

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [certCode, setCertCode] = useState("");
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certCode.trim()) navigate(`/verify-certificate?cert=${certCode.trim()}`);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative border-b bg-white">
        {/* Subtle dot grid */}
        <div className="growth-ring-bg absolute inset-0 opacity-60" />

        {/* Thin gold top bar */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#C8A951]/60 to-transparent" />

        <div className="container relative py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left */}
            <div className="max-w-xl">
              {/* Logo row */}
              <div className="mb-6 flex items-center gap-3">
                <img src={ppbiLogo} alt="PPBI" className="h-12 w-12" />
                <div className="h-8 w-px bg-border" />
                <img src={depokLogo} alt="Kota Depok" className="h-12 w-12" />
                <div>
                  <p className="font-display text-xs font-bold leading-none tracking-widest uppercase text-muted-foreground">PPBI Ranting Depok</p>
                </div>
              </div>

              {/* Official badge */}
              <motion.div {...fadeUp(0)}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  PPBI Official Platform
                </span>
              </motion.div>

              <motion.h1
                {...fadeUp(0.08)}
                className="mt-4 font-display text-5xl font-extrabold tracking-tighter text-balance leading-[1.1] lg:text-6xl"
              >
                National Bonsai{" "}
                <span className="text-primary">Registry</span> &{" "}
                <span className="text-[#C8A951]">Competition</span>{" "}
                Platform
              </motion.h1>

              <motion.p {...fadeUp(0.15)} className="mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
                Sistem terintegrasi untuk registrasi bonsai, kompetisi nasional, dan identitas digital Bonsai Passport berbasis PPBI. Transparan, terverifikasi, dan real-time.
              </motion.p>

              {/* CTAs */}
              <motion.div {...fadeUp(0.22)} className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <TreePine className="h-4 w-4" />
                  Daftar Kompetisi
                </Link>
                <Link
                  to="/live"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-red-500 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  Live Arena
                </Link>
                <Link
                  to="/verify-certificate"
                  className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-foreground/20 active:scale-[0.98]"
                >
                  <Shield className="h-4 w-4" />
                  Verifikasi Sertifikat
                </Link>
              </motion.div>

              {/* Mini stats */}
              <motion.div {...fadeUp(0.28)} className="mt-10 flex flex-wrap gap-6">
                {[
                  { value: "12,450+", label: "Bonsai Terdaftar" },
                  { value: "85+",     label: "Event Nasional" },
                  { value: "5,200+",  label: "Sertifikat Terverifikasi" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-black text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — image + floating card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/5] max-w-md mx-auto overflow-hidden rounded-2xl border shadow-2xl shadow-black/10">
                <img src={heroImage} alt="Bonsai" className="h-full w-full object-cover" />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              {/* Glassmorphism floating card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-5 -left-8 w-64 rounded-2xl border border-white/50 bg-white/80 p-4 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="passport-id">BNS-DPK-00001</span>
                  <span className="ml-auto rounded-full bg-[#C8A951]/20 px-2 py-0.5 text-[10px] font-bold text-[#C8A951] uppercase">Gold</span>
                </div>
                <p className="font-display text-base font-bold">Ficus Retusa</p>
                <p className="text-xs text-muted-foreground italic mt-0.5">Ficus microcarpa</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Score</p>
                    <p className="font-mono text-xl font-black text-primary">84</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Judge</p>
                    <p className="text-xs font-medium">Certified Panel</p>
                  </div>
                  <Link
                    to="/gallery"
                    className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white"
                  >
                    Detail
                  </Link>
                </div>
              </motion.div>

              {/* Top-right badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="absolute -right-4 top-8 rounded-xl border bg-white px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-foreground">System Online</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Real-time judging aktif</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. PLATFORM STATISTICS ───────────────────────────────────────────── */}
      <section className="border-b bg-primary py-14">
        <div className="container">
          <div className="grid grid-cols-2 divide-x divide-white/20 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.07)} className="px-6 py-4 text-center first:pl-0 last:pr-0">
                <s.icon className="mx-auto h-6 w-6 text-white/60 mb-2" />
                <p className="font-display text-3xl font-black text-white">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-white/70 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="border-b bg-white py-20">
        <div className="container">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Cara Kerja</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Empat Langkah Sederhana</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Dari registrasi hingga sertifikat digital — semua dalam satu platform terintegrasi.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div key={step.number} {...fadeUp(i * 0.08)}>
                <div className="group relative h-full rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                  {/* Connector arrow — hidden on last */}
                  {i < steps.length - 1 && (
                    <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-border hidden lg:block z-10" />
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-mono text-3xl font-black text-muted/20 text-border">{step.number}</span>
                  </div>
                  <h3 className="font-display text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. LIVE ARENA ────────────────────────────────────────────────────── */}
      <section className="bg-[#0D2818] py-20">
        <div className="container">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Live Arena
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
              Live Competition Arena
            </h2>
            <p className="mt-3 text-sm text-white/50 max-w-md mx-auto">
              Pantau penilaian bonsai secara real-time dari seluruh Indonesia.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {liveArenaItems.map((item, i) => (
              <motion.div key={item.id} {...fadeUp(i * 0.08)}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm hover:border-white/20 hover:bg-white/8 transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                          <Radio className="h-2.5 w-2.5" /> LIVE
                        </span>
                      </div>
                      <h3 className="font-display text-sm font-bold text-white leading-snug">{item.name}</h3>
                      <p className="text-[11px] text-white/50 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.location}
                      </p>
                    </div>
                    <Trophy className="h-5 w-5 text-[#C8A951]/60 shrink-0 mt-1" />
                  </div>

                  {/* Top 3 */}
                  <div className="space-y-2">
                    {item.top3.map((entry, rank) => (
                      <div key={entry.no} className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2">
                        <span className="text-base shrink-0">{rankMedal[rank]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[10px] text-[#C8A951]/70">{entry.no}</p>
                          <p className="text-xs text-white/80 font-medium truncate">{entry.name}</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-white/90 shrink-0">{entry.score}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/live"
                    className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 py-2.5 text-xs font-bold text-white/70 hover:border-white/30 hover:text-white transition-all"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Watch Live
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURED GALLERY ──────────────────────────────────────────────── */}
      <section className="border-b bg-[#F5F7F6] py-20">
        <div className="container">
          <motion.div {...fadeUp(0)} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Koleksi Unggulan</span>
              <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Featured Collection</h2>
              <p className="mt-2 text-sm text-muted-foreground">Bonsai pemenang dari registry kami</p>
            </div>
            <Link
              to="/gallery"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="passport-grid">
            {mockBonsai.slice(0, 3).map((b, i) => (
              <BonsaiCard key={b.id} bonsai={b} index={i} />
            ))}
          </div>

          <motion.div {...fadeUp(0.2)} className="mt-8 text-center sm:hidden">
            <Link to="/gallery" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 6. CERTIFICATE VERIFICATION WIDGET ──────────────────────────────── */}
      <section className="border-b bg-white py-20">
        <div className="container max-w-2xl text-center">
          <motion.div {...fadeUp(0)}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Verifikasi Resmi</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
              Verify Bonsai Certificate
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Cek keaslian sertifikat digital dengan memasukkan kode sertifikat.
            </p>
          </motion.div>

          <motion.form {...fadeUp(0.1)} onSubmit={handleVerify} className="mt-8 flex gap-2">
            <Input
              placeholder="Masukkan kode sertifikat, cth: CERT-DPK-2026-001"
              value={certCode}
              onChange={(e) => setCertCode(e.target.value)}
              className="flex-1 h-12 font-mono text-sm"
            />
            <Button type="submit" size="lg" className="h-12 px-6 shrink-0">
              <Search className="h-4 w-4 mr-2" />
              Verifikasi
            </Button>
          </motion.form>

          <motion.div {...fadeUp(0.18)} className="mt-6 flex justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: CheckCircle2, text: "Terverifikasi Digital" },
              { icon: Shield,       text: "Anti-Pemalsuan" },
              { icon: Award,        text: "Diterbitkan Resmi PPBI" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 7. CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="border-b bg-primary py-16">
        <div className="container text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white">
              Siap Bergabung dengan Platform Bonsai Nasional?
            </h2>
            <p className="mt-3 text-sm text-white/70 max-w-md mx-auto">
              Daftarkan bonsai Anda, ikuti kompetisi, dan dapatkan identitas digital resmi dari PPBI.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/events"
                className="rounded-xl bg-[#C8A951] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#b8962e] transition-all active:scale-[0.98]"
              >
                Daftar Sekarang
              </Link>
              <Link
                to="/peserta"
                className="rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all active:scale-[0.98]"
              >
                Portal Peserta
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
