import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "juri" ? "/judge" : "/admin"} replace />;
  }

  const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const authenticatedUser = await login({
        email: email.trim().toLowerCase(),
        password,
      });
      navigate(from || (authenticatedUser.role === "juri" ? "/judge" : "/admin"), { replace: true });
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(17,94,89,0.12),_transparent_35%),linear-gradient(180deg,#f6fbf9_0%,#eef4f1_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden rounded-3xl border border-emerald-100 bg-white/80 p-10 shadow-sm backdrop-blur lg:block">
            <div className="flex items-center gap-3">
              <img src={ppbiLogo} alt="PPBI" className="h-12 w-12" />
              <img src={depokLogo} alt="Depok" className="h-12 w-12" />
            </div>
            <div className="mt-10 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Bonsai Connect</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900">
                Login operator untuk registrasi, kontrol event, dan penjurian.
              </h1>
              <p className="max-w-lg text-sm leading-6 text-slate-600">
                Autentikasi sekarang terhubung langsung ke backend. Role <strong>superadmin</strong>, <strong>admin</strong>, dan <strong>juri</strong> akan diarahkan ke workspace yang sesuai.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Superadmin</p>
                <p className="mt-2 text-sm text-slate-700">Kelola user, event, peserta, dan pengaturan utama aplikasi.</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Admin</p>
                <p className="mt-2 text-sm text-slate-700">Kelola event, registrasi, check-in, queue, dan ranking.</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Juri</p>
                <p className="mt-2 text-sm text-slate-700">Masuk langsung ke halaman penilaian dan submit skor ke backend.</p>
              </div>
            </div>
          </div>

          <Card className="border-white/70 bg-white/90 shadow-xl shadow-emerald-950/5 backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3 lg:hidden">
                <img src={ppbiLogo} alt="PPBI" className="h-10 w-10" />
                <img src={depokLogo} alt="Depok" className="h-10 w-10" />
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Secure Access</span>
              </div>
              <CardTitle>Masuk ke Bonsai Connect</CardTitle>
              <CardDescription>Gunakan akun operator yang tersimpan di backend.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="superadmin@ppbi.local"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  <LogIn className="h-4 w-4" />
                  {isSubmitting ? "Memproses..." : "Login"}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-dashed bg-muted/20 p-4 text-xs leading-6 text-muted-foreground">
                Akun default development dibuat otomatis saat backend start:
                <br />
                `superadmin@ppbi.local / superadmin123`
                <br />
                `admin@ppbi.local / admin12345`
                <br />
                `juri@ppbi.local / juri12345`
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
