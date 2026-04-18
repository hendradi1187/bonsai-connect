import { Link, useLocation } from "react-router-dom";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import { Menu, X, ChevronDown, BookOpen, Shield, QrCode, LayoutDashboard, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const platformLinks = [
  { label: "nav.gallery", path: "/gallery", icon: BookOpen, desc: "nav.gallery_desc" },
  { label: "nav.passport", path: "/passport-lookup", icon: QrCode, desc: "nav.passport_desc" },
  { label: "nav.verify", path: "/verify-certificate", icon: Shield, desc: "nav.verify_desc" },
  { label: "nav.dashboard", path: "/peserta", icon: LayoutDashboard, desc: "nav.dashboard_desc" },
];

const mainLinks = [
  { label: "nav.home", path: "/" },
  { label: "nav.events", path: "/events" },
  { label: "nav.live_arena", path: "/live" },
  { label: "nav.gallery", path: "/gallery" },
];

export function PublicHeader() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPlatformOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={ppbiLogo} alt="PPBI" className="h-9 w-9" />
          <div className="hidden h-7 w-px bg-border sm:block" />
          <img src={depokLogo} alt="Kota Depok" className="hidden h-9 w-9 sm:block" />
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold leading-none tracking-tight text-foreground">{t('common.branch_depok')}</p>
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
              {t(link.label)}
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
                        <p className="font-semibold text-foreground">{t(item.label)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t(item.desc)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 md:flex shrink-0">
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/60"
            >
              <Globe className="h-3.5 w-3.5" />
              {i18n.language === "en" ? "EN" : "ID"}
              <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 rounded-lg border bg-white p-1 shadow-lg overflow-hidden">
                <button
                  onClick={() => changeLanguage("id")}
                  className={`w-full text-left rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    i18n.language === "id" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Bahasa Indonesia
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`w-full text-left rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    i18n.language === "en" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          <Link
            to="/admin"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            {t('common.login')}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => changeLanguage(i18n.language === "en" ? "id" : "en")}
            className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground"
          >
            <span className="text-[10px] font-bold">{i18n.language === "en" ? "ID" : "EN"}</span>
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
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
              {t(link.label)}
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
                {t(link.label)}
              </Link>
            ))}
          </div>
          <div className="pt-1 border-t">
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {t('common.login')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
