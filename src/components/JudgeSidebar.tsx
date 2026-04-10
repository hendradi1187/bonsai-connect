import { Gavel, LogOut, Play, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ppbiLogo from "@/assets/ppbi-logo.png";

const items = [
  { title: "Scoring", url: "/judge", icon: Gavel },
  { title: "Ranking", url: "/judge/ranking", icon: Trophy },
  { title: "Live Arena", url: "/live", icon: Play },
];

export function JudgeSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="flex h-full w-full flex-col border-r bg-white/80 backdrop-blur">
      <div className="border-b px-5 py-5">
        <div className="flex items-center gap-3">
          <img src={ppbiLogo} alt="PPBI" className="h-10 w-10" />
          <div>
            <div className="font-display text-sm font-semibold tracking-tight">Judge Workspace</div>
            <div className="text-xs text-muted-foreground">{user?.name}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/judge"}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
          Mode anonim aktif. Identitas peserta disembunyikan dari juri.
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
