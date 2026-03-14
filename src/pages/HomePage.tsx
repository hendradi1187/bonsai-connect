import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Award, BookOpen, CalendarDays } from "lucide-react";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import heroImage from "@/assets/bonsai-hero.jpg";
import { mockEvents, mockBonsai } from "@/data/mockData";
import { BonsaiCard } from "@/components/BonsaiCard";

const features = [
  {
    icon: BookOpen,
    title: "Bonsai Passport",
    description: "Permanent digital identity for every registered bonsai tree with full history tracking.",
  },
  {
    icon: Award,
    title: "Digital Certificates",
    description: "Verified competition certificates with QR code authentication.",
  },
  {
    icon: Shield,
    title: "Digital Judging",
    description: "Mobile-friendly scoring system with real-time ranking updates.",
  },
  {
    icon: CalendarDays,
    title: "Event Management",
    description: "Complete exhibition and competition management platform.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="growth-ring-bg absolute inset-0" />
        <div className="container relative py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-8 flex items-center gap-4">
                <img src={ppbiLogo} alt="PPBI Depok" className="h-16 w-16" />
                <div className="h-10 w-px bg-border" />
                <img src={depokLogo} alt="Kota Depok" className="h-16 w-16" />
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-5xl font-semibold tracking-tighter text-balance lg:text-6xl"
              >
                The Permanent Registry for{" "}
                <span className="text-primary">Living Art</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 max-w-lg text-lg text-muted-foreground"
              >
                Digital platform for bonsai exhibitions, competitions, and the Bonsai Passport identity system — by PPBI Depok.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Explore Gallery
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/verify-certificate"
                  className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98]"
                >
                  Verify Certificate
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/5] max-w-md mx-auto overflow-hidden rounded-2xl border shadow-lg">
                <img src={heroImage} alt="Bonsai" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 card-archive px-4 py-3">
                <p className="passport-id">BNS-DPK-00001</p>
                <p className="font-display text-sm font-bold">Ficus Retusa</p>
                <p className="font-mono text-xs text-muted-foreground">84 Points · Gold</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-surface py-20">
        <div className="container">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Platform Features</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="card-archive p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Event */}
      {mockEvents.filter(e => e.status === "upcoming").map(event => (
        <section key={event.id} className="border-b py-20">
          <div className="container">
            <div className="data-label mb-2">Upcoming Event</div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">{event.eventName}</h2>
            <p className="mt-2 text-muted-foreground">{event.location} · {event.startDate} – {event.endDate}</p>
            <div className="mt-6 flex gap-8">
              <div>
                <p className="font-display text-2xl font-bold">{event.totalParticipants}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{event.totalBonsai}</p>
                <p className="text-xs text-muted-foreground">Bonsai Entries</p>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Featured Bonsai */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">Featured Collection</h2>
              <p className="mt-2 text-muted-foreground">Award-winning bonsai from our registry</p>
            </div>
            <Link to="/gallery" className="hidden text-sm font-medium text-primary hover:underline sm:block">
              View all →
            </Link>
          </div>
          <div className="passport-grid mt-10">
            {mockBonsai.slice(0, 3).map((b, i) => (
              <BonsaiCard key={b.id} bonsai={b} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
