import ppbiLogo from "@/assets/ppbi-logo.png";

export function PublicFooter() {
  return (
    <footer className="border-t bg-surface">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={ppbiLogo} alt="PPBI Depok" className="h-12 w-12 opacity-60" />
          <div>
            <p className="font-display text-sm font-semibold">PPBI Depok Bonsai Digital Platform</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Digital System for Bonsai Exhibitions, Competitions, and Bonsai Registry
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Perhimpunan Penggemar Bonsai Indonesia — Cabang Depok
          </p>
        </div>
      </div>
    </footer>
  );
}
