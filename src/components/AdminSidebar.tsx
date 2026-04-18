import {
  LayoutDashboard,
  CalendarDays,
  Scale,
  Trophy,
  TreePine,
  BookOpen,
  ShieldCheck,
  LogOut,
  Radio,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ppbiLogo from "@/assets/ppbi-logo.png";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_GROUPS = [
  {
    label: "nav_groups.core",
    items: [
      { title: "nav.overview", url: "/admin", icon: LayoutDashboard, end: true },
      { title: "nav.scoring", url: "/live", icon: Radio },
    ],
    roles: ["superadmin", "admin", "juri"],
  },
  {
    label: "nav_groups.competition",
    items: [
      { title: "nav.events", url: "/admin/events", icon: CalendarDays },
      { title: "nav.judging", url: "/admin/judging", icon: Scale },
      { title: "nav.ranking", url: "/admin/ranking", icon: Trophy },
    ],
    roles: ["superadmin", "admin"],
  },
  {
    label: "nav_groups.registry",
    items: [
      { title: "nav.bonsai_trees", url: "/admin/bonsai", icon: TreePine },
      { title: "nav.passport", url: "/admin/passports", icon: BookOpen },
      { title: "nav.participants", url: "/admin/participants", icon: Users },
    ],
    roles: ["superadmin", "admin"],
  },
  {
    label: "nav_groups.system",
    items: [
      { title: "nav.users", url: "/admin/users", icon: ShieldCheck },
    ],
    roles: ["superadmin"],
  },
];

export function AdminSidebar({ collapsed, onToggle }: Props) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };


  return (
    <aside
      className="relative flex h-screen flex-col transition-all duration-300"
      style={{
        width: collapsed ? "64px" : "220px",
        background: "linear-gradient(180deg, #0D2818 0%, #1A4030 60%, #163526 100%)",
        flexShrink: 0,
      }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-[#2E8B57]/40 bg-[#1A4030] text-white shadow-md hover:bg-[#2E8B57]/60 transition-colors"
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <img src={ppbiLogo} alt="PPBI" className="h-9 w-9 shrink-0 rounded-lg" />
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="truncate text-sm font-bold text-white leading-tight">PPBI Depok</div>
            <div className="truncate text-[11px] font-medium capitalize" style={{ color: "#C8A951" }}>
              {user?.role || "Admin"}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none">
        {NAV_GROUPS.filter((group) =>
          !user?.role || group.roles.includes(user.role)
        ).map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <div
                className="px-4 pb-1 pt-3 text-[10px] font-semibold tracking-widest"
                style={{ color: "#C8A951", opacity: 0.8 }}
              >
                {t(group.label)}
              </div>
            )}
            {collapsed && <div className="my-2 mx-3 h-px bg-white/10" />}
            {group.items.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                    isActive
                      ? "bg-[#2E8B57]/35 text-white font-semibold border-l-2 border-[#C8A951]"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                    collapsed ? "justify-center px-2" : "",
                  ].join(" ")
                }
                title={collapsed ? t(item.title) : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{t(item.title)}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer — logout only */}
      <div className="border-t border-white/10">
        <button
          onClick={handleLogout}
          className={[
            "flex w-full items-center gap-3 px-4 py-3.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors",
            collapsed ? "justify-center" : "",
          ].join(" ")}
          title={collapsed ? t('common.logout') : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('common.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
