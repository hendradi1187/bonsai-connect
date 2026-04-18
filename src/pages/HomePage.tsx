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
import { useTranslation } from "react-i18next";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import heroImage from "@/assets/bonsai-hero.jpg";
import { mockEvents, mockBonsai } from "@/data/mockData";
import { BonsaiCard, getBonsaiImage } from "@/components/BonsaiCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Fade-up variant ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
});

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useTranslation();
  const [certCode, setCertCode] = useState("");
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certCode.trim()) navigate(`/verify-certificate?cert=${certCode.trim()}`);
  };

  const stats = [
    { value: "12,450+", label: t('home.stat_bonsai'), icon: TreePine },
    { value: "85+",     label: t('home.stat_events'),   icon: CalendarDays },
    { value: "5,200+",  label: t('home.stat_certs'), icon: Award },
    { value: "34",      label: t('home.stat_provinces'),         icon: MapPin },
  ];

  const steps = [
    { number: "01", icon: BookOpen,    title: t('home.process_step_1'),      desc: t('home.process_step_1_desc') },
    { number: "02", icon: CalendarDays, title: t('home.process_step_2'),   desc: t('home.process_step_2_desc') },
    { number: "03", icon: Star,         title: t('home.process_step_3'), desc: t('home.process_step_3_desc') },
    { number: "04", icon: Shield,       title: t('home.process_step_4'),   desc: t('home.process_step_4_desc') },
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
                  <p className="font-display text-xs font-bold leading-none tracking-widest uppercase text-muted-foreground">{t('common.branch_depok')}</p>
                </div>
              </div>

              {/* Official badge */}
              <motion.div {...fadeUp(0)}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('common.official_platform')}
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
                {t('home.hero_desc')}
              </motion.p>

              {/* CTAs */}
              <motion.div {...fadeUp(0.22)} className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <TreePine className="h-4 w-4" />
                  {t('home.btn_register')}
                </Link>
                <Link
                  to="/live"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-red-500 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  {t('home.btn_live')}
                </Link>
                <Link
                  to="/verify-certificate"
                  className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-foreground/20 active:scale-[0.98]"
                >
                  <Shield className="h-4 w-4" />
                  {t('home.btn_verify')}
                </Link>
              </motion.div>

              {/* Mini stats */}
              <motion.div {...fadeUp(0.28)} className="mt-10 flex flex-wrap gap-6">
                {[
                  { value: "12,450+", label: t('home.stat_bonsai') },
                  { value: "85+",     label: t('home.stat_events') },
                  { value: "5,200+",  label: t('home.stat_certs') },
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-5 shadow-2xl border w-64"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Best In Show</p>
                    <p className="font-display text-sm font-bold">Ficus Microcarpa</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Score</p>
                    <p className="font-display text-lg font-black text-primary">94.50</p>
                  </div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">Verified</Badge>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ──────────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-b py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp(i * 0.1)}
                className="flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-3xl font-black tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PROCESS STEPS ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white relative">
        <div className="container relative">
          <div className="mb-16 max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance lg:text-4xl">
              {t('home.process_title')}
            </h2>
            <div className="mt-4 h-1 w-20 bg-primary" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUp(i * 0.12)}
                className="group relative rounded-2xl border border-transparent p-6 transition-all hover:border-border hover:bg-muted/30"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                  <step.icon className="h-6 w-6" />
                </div>
                <p className="mb-2 text-xs font-black text-primary/40 tracking-widest">{step.number}</p>
                <h3 className="mb-3 font-display text-lg font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. LIVE ARENA SNEAK PEEK ──────────────────────────────────────── */}
      <section className="py-24 bg-muted/20 border-y relative overflow-hidden">
        <div className="growth-ring-bg absolute inset-0 opacity-40" />
        <div className="container relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600">
                <Radio className="h-3 w-3" />
                Live Scoring Arena
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
                Pantau Penilaian <span className="text-primary">Real-time</span>
              </h2>
            </div>
            <Link to="/live" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Buka Live Arena <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {liveArenaItems.map((item, i) => (
              <motion.div
                key={item.id}
                {...fadeUp(i * 0.15)}
                className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-6 border-b pb-4">
                  <h3 className="font-display font-bold text-lg leading-tight">{item.name}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Ranking Sementara</p>
                  {item.top3.map((entry, idx) => (
                    <div key={entry.no} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{rankMedal[idx]}</span>
                        <div>
                          <p className="text-xs font-bold leading-none">{entry.name}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">{entry.no}</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {entry.score.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/live`}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-muted/50 py-3 text-xs font-bold transition-all hover:bg-primary hover:text-white"
                >
                  Lihat Detail Event <ChevronRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SEARCH & VERIFY ────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="rounded-3xl bg-primary px-8 py-16 text-white lg:px-20 lg:py-24 relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* Decoration */}
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

            <div className="grid items-center gap-12 lg:grid-cols-2 relative z-10">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight lg:text-5xl leading-tight">
                  Verifikasi Sertifikat & Bonsai Passport
                </h2>
                <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-lg">
                  Pastikan keaslian sertifikat dan data kepemilikan bonsai Anda melalui sistem registry terpusat.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-md">
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Masukkan Kode Sertifikat (e.g. BC-2026-XXXX)"
                      value={certCode}
                      onChange={(e) => setCertCode(e.target.value)}
                      className="w-full rounded-xl bg-white/10 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/40 outline-none ring-1 ring-white/20 focus:ring-white/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-white px-8 py-4 text-sm font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.98] shadow-lg shadow-black/10"
                  >
                    Verifikasi
                  </button>
                </form>
                <p className="mt-4 px-2 text-xs text-white/60">
                  Contoh: <span className="font-mono text-white/80">CERT-DEP-001</span> atau scan QR Code di Bonsai Passport.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. LATEST ENTRIES ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">Terdaftar Baru</h2>
              <p className="text-muted-foreground mt-2">Bonsai yang baru saja mendapatkan identitas digital</p>
            </div>
            <Link to="/gallery" className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Lihat Galeri Nasional <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockBonsai.slice(0, 4).map((bonsai, i) => (
              <motion.div key={bonsai.id} {...fadeUp(i * 0.1)}>
                <BonsaiCard bonsai={bonsai} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center sm:hidden">
            <Link
              to="/gallery"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-all hover:bg-muted"
            >
              Lihat Galeri Nasional <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-primary/5">
        <div className="container">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-primary/10">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight mb-6">Siap mendaftarkan bonsai Anda?</h2>
            <p className="text-lg text-muted-foreground mb-10">
              Bergabunglah dengan ribuan penggemar bonsai lainnya dalam ekosistem digital PPBI yang transparan dan terpercaya.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/events"
                className="rounded-xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Mulai Registrasi
              </Link>
              <Link
                to="/gallery"
                className="rounded-xl bg-white border px-8 py-4 text-sm font-bold transition-all hover:bg-muted active:scale-[0.98]"
              >
                Lihat Koleksi
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
