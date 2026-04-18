import { Link } from "react-router-dom";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const platformLinks = [
  { label: "nav.gallery",       path: "/gallery" },
  { label: "nav.passport",       path: "/passport-lookup" },
  { label: "nav.verify", path: "/verify-certificate" },
  { label: "nav.dashboard",        path: "/peserta" },
];

const competitionLinks = [
  { label: "home.btn_register",    path: "/events" },
  { label: "nav.live_arena",      path: "/live" },
  { label: "nav.gallery",   path: "/gallery" },
];

export function PublicFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-[#0D1F15] text-white">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={ppbiLogo} alt="PPBI" className="h-12 w-12 opacity-90" />
              <div className="h-8 w-px bg-white/10" />
              <img src={depokLogo} alt="Kota Depok" className="h-12 w-12 opacity-90" />
              <div>
                <p className="font-display text-base font-bold leading-none">{t('common.branch_depok')}</p>
                <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">Bonsai Digital Platform</p>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>

            <div className="mt-6 space-y-2.5 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Jl. Contoh No. 1, Kota Depok, Jawa Barat 16400</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+62 21 1234 5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>admin@ppbi-depok.or.id</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">{t('footer.platform_title')}</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-3 bg-white/20 group-hover:bg-primary group-hover:w-5 transition-all" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kompetisi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">{t('footer.competition_title')}</h4>
            <ul className="space-y-2.5">
              {competitionLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-3 bg-white/20 group-hover:bg-primary group-hover:w-5 transition-all" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">{t('footer.supported_by')}</h4>
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{t('footer.central_ppbi')}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{t('footer.city_depok')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/30">
            © {year} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link to="/verify-certificate" className="hover:text-white/60 transition-colors">{t('nav.verify')}</Link>
            <span>·</span>
            <Link to="/peserta" className="hover:text-white/60 transition-colors">{t('nav.dashboard')}</Link>
            <span>·</span>
            <Link to="/admin" className="hover:text-white/60 transition-colors flex items-center gap-1">
              Admin <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
