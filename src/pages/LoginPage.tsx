import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Eye, EyeOff, Globe, Lock, Mail, ShieldCheck,
  Building2, Users, Scale,
} from "lucide-react";
import ppbiLogo from "@/assets/ppbi-logo.png";
import { useAuth } from "@/contexts/AuthContext";

// ─── Trust indicator row ──────────────────────────────────────────────────────
function TrustItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-white/80">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-3.5 w-3.5 text-[#C8A951]" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────
function RoleCard({
  title, desc, color, bg, icon: Icon,
}: {
  title: string; desc: string; color: string; bg: string; icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: bg }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          {title}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-white/60">{desc}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "juri" ? "/judge" : "/admin"} replace />;
  }

  const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const authed = await login({ email: email.trim().toLowerCase(), password });
      navigate(from || (authed.role === "juri" ? "/judge" : "/admin"), { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || (i18n.language === 'id' ? "Email atau password tidak valid." : "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "id" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background:
          "linear-gradient(135deg, #0a1f12 0%, #0D2818 40%, #163526 70%, #1a3d29 100%)",
      }}
    >
      {/* Language Switcher Floating Button */}
      <button
        onClick={toggleLanguage}
        className="absolute right-6 top-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/10"
      >
        <Globe className="h-3.5 w-3.5" />
        {i18n.language === "en" ? "Indonesia" : "English"}
      </button>

      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #2E8B57, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #C8A951, transparent 70%)" }}
        />
        <div
          className="absolute right-1/3 top-1/3 h-[300px] w-[300px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #1F6F4A, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">

        {/* ── LEFT: Branding panel ────────────────────────────────────── */}
        <div className="hidden flex-col justify-between py-4 lg:flex">
          {/* Logo + platform label */}
          <div>
            <div className="flex items-center gap-3">
              <img src={ppbiLogo} alt="PPBI" className="h-11 w-11 rounded-xl" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A951]">
                  {t('common.official_platform')}
                </div>
                <div className="text-xs text-white/50">{t('common.association_name')}</div>
              </div>
            </div>

            {/* Headline */}
            <div className="mt-10">
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white">
                {t('common.secure_access')} <br />
                <span style={{ color: "#C8A951" }}>{t('common.bonsai_registry')}</span><br />
                {t('common.system')}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
                {t('common.platform_desc')}
              </p>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 space-y-3">
              <TrustItem icon={ShieldCheck} label={t('trust.secure_auth')} />
              <TrustItem icon={Building2}  label={t('trust.official_platform')} />
              <TrustItem icon={Globe}      label={t('trust.national_system')} />
            </div>

            {/* Divider */}
            <div className="mt-8 h-px bg-white/10" />

            {/* Role cards */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <RoleCard
                title={t('roles.super_admin')}
                desc={t('roles.super_admin_desc')}
                color="#C8A951"
                bg="rgba(200,169,81,0.08)"
                icon={ShieldCheck}
              />
              <RoleCard
                title={t('roles.admin')}
                desc={t('roles.admin_desc')}
                color="#2E8B57"
                bg="rgba(46,139,87,0.10)"
                icon={Users}
              />
              <RoleCard
                title={t('roles.judge')}
                desc={t('roles.judge_desc')}
                color="#60A5FA"
                bg="rgba(96,165,250,0.08)"
                icon={Scale}
              />
            </div>
          </div>

          {/* Footer text */}
          <div className="mt-10 text-xs text-white/30">
            © 2026 PPBI Cabang Kota Depok · {t('common.rights_reserved')}
          </div>
        </div>

        {/* ── RIGHT: Login form ───────────────────────────────────────── */}
        <div className="flex flex-col justify-center">
          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <img src={ppbiLogo} alt="PPBI" className="h-9 w-9 rounded-xl" />
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8A951]">
                {t('common.official_platform')}
              </div>
            </div>

            {/* Form header */}
            <div className="mb-7">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "rgba(46,139,87,0.15)", border: "1px solid rgba(46,139,87,0.25)" }}>
                <Lock className="h-5 w-5 text-[#2E8B57]" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">{t('common.secure_login')}</h2>
              <p className="mt-1 text-sm text-white/50">{t('common.access_system')}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">{t('common.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={t('common.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/60">{t('common.password')}</label>
                  <button type="button" className="text-[11px] font-medium text-[#C8A951] hover:underline">
                    {t('common.forgot_password')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t('common.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#2E8B57]"
                />
                <label htmlFor="remember" className="select-none text-xs text-white/40">
                  {t('common.remember_me')}
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative mt-2 w-full overflow-hidden rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
                style={{
                  background: isSubmitting
                    ? "rgba(46,139,87,0.5)"
                    : "linear-gradient(135deg, #2E8B57 0%, #1F6F4A 100%)",
                  boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(46,139,87,0.35)",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {t('common.authenticating')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    {t('common.login_securely')}
                  </span>
                )}
              </button>
            </form>

            {/* System status */}
            <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5 text-xs text-white/35">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t('common.system_status')}: <span className="ml-1 font-medium text-emerald-400">{t('common.operational')}</span>
              </div>
              <span>PPBI Bonsai Platform v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
