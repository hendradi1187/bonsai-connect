import { Link, useLocation } from "react-router-dom";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import { Menu, X, ChevronDown, BookOpen, Shield, QrCode, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const platformLinks = [
  { label: "Bonsai Registry", path: "/gallery", icon: BookOpen, desc: "Koleksi bonsai terdaftar secara nasional" },
  { label: "Bonsai Passport", path: "/passport-lookup", icon: QrCode, desc: "Identitas digital setiap bonsai" },
  { label: "Verifikasi Sertifikat", path: "/verify-certificate", icon: Shield, desc: "Cek keaslian sertifikat digital" },
  { label: "Portal Peserta", path: "/peserta", icon: LayoutDashboard, desc: "Cek status & skor Anda" },
];

const mainLinks = [
  { label: "Beranda", path: "/" },
  { label: "Events", path: "/events" },
  { label: "Live Arena", path: "/live" },
  { label: "Gallery", path: "/gallery" },
];

export function PublicHeader() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPlatformOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={ppbiLogo} alt="PPBI" className="h-9 w-9" />
          <div className="hidden h-7 w-px bg-border sm:block" />
          <img src={depokLogo} alt="Kota Depok" className="hidden h-9 w-9 sm:block" />
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold leading-none tracking-tight text-foreground">PPBI Depok</p>
            <p className="text-[9px] leading-none text-muted-foreground mt-0.5 uppercase tracking-wider">Bonsai Digital Platform</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 md:flex flex-1 justify-center">
          {mainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Platform Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setPlatformOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                platformOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              Platform
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${platformOpen ? "rotate-180" : ""}`} />
            </button>

            {platformOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border bg-white shadow-xl shadow-black/10 overflow-hidden">
                <div className="p-1.5">
                  {platformLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setPlatformOpen(false)}
                      className="flex items-start gap-3 rounded-lg p-3 text-sm transition-colors hover:bg-muted/60 group"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right CTA */}
        <div className="hidden items-center gap-2 md:flex shrink-0">
          <Link
            to="/admin"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Admin Panel
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t bg-white px-4 py-3 md:hidden space-y-1">
          {mainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive(link.path) ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-1 pb-1 border-t border-dashed">
            <p className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Platform</p>
            {platformLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-1 border-t">
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
