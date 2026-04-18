import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, ChevronRight, Home } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Admin",
  events: "Events",
  judging: "Judging",
  ranking: "Ranking",
  bonsai: "Bonsai Trees",
  passports: "Bonsai Passport",
  participants: "Participants",
  certificates: "Certificates",
  users: "Users & Roles",
  control: "Event Control",
  reports: "Reports",
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg) => ROUTE_LABELS[seg] || seg);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SA";

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Home className="h-3.5 w-3.5" />
            {breadcrumbs.map((label, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <span className={i === breadcrumbs.length - 1 ? "font-medium text-foreground" : ""}>
                  {label}
                </span>
              </span>
            ))}
          </div>

          {/* Right: notifications + user profile */}
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow"
                style={{ background: "linear-gradient(135deg, #2E8B57, #1F6F4A)" }}
              >
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-semibold text-foreground">{user?.name}</div>
                <div className="text-[11px] capitalize text-muted-foreground">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-[#F5F7F6] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
