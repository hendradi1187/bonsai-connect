import {
  LayoutDashboard,
  CalendarDays,
  Users,
  TreePine,
  Scale,
  Trophy,
  Award,
  FileBarChart,
  BookOpen,
  LogOut,
  Activity,
  Play,
  User,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import ppbiLogo from "@/assets/ppbi-logo.png";
import depokLogo from "@/assets/depok-logo.png";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Event Control", url: "/admin/events/control", icon: Activity },
  { title: "Participants", url: "/admin/participants", icon: Users },
  { title: "Bonsai Trees", url: "/admin/bonsai", icon: TreePine },
];

const competitionItems = [
  { title: "Judging", url: "/admin/judging", icon: Scale },
  { title: "Live Arena", url: "/live", icon: Play },
  { title: "Ranking", url: "/admin/ranking", icon: Trophy },
  { title: "Certificates", url: "/admin/certificates", icon: Award },
];

const registryItems = [
  { title: "Bonsai Passport", url: "/admin/passports", icon: BookOpen },
  { title: "Peserta Portal", url: "/peserta", icon: User },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const visibleMainItems = mainItems.filter((item) => user?.role !== "juri");
  const visibleCompetitionItems = user?.role === "juri"
    ? [{ title: "Judging", url: "/judge", icon: Scale }, { title: "Live Arena", url: "/live", icon: Play }]
    : competitionItems;
  const visibleRegistryItems = registryItems.filter((item) => user?.role !== "juri");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2.5 border-b px-4 py-4">
          <img src={ppbiLogo} alt="PPBI" className="h-8 w-8 shrink-0" />
          {!collapsed && (
            <>
              <div className="h-5 w-px bg-border" />
              <img src={depokLogo} alt="Depok" className="h-8 w-8 shrink-0" />
              <span className="font-display text-xs font-bold leading-tight tracking-tight">
                PPBI Depok<br />
                <span className="font-normal text-muted-foreground">{user?.role || "Admin"}</span>
              </span>
            </>
          )}
        </div>

        {visibleMainItems.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Competition</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleCompetitionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleRegistryItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Registry</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleRegistryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user?.role === "superadmin" && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin/users"
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Users & Roles</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && user && (
          <div className="px-3 pb-2 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{user.name}</div>
            <div>{user.email}</div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <span className="text-muted-foreground hover:text-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
