import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TreePine, CalendarDays, Users, Award, Trophy,
  Radio, ArrowUpRight, ArrowRight, TrendingUp,
  PlusCircle, Play, ShieldCheck, ChevronRight,
  MapPin, Clock,
} from "lucide-react";
import { useGet } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminEvent {
  id: string;
  name: string;
  location: string;
  startDate: string;
  status: string;
  totalParticipants: number;
}

interface RankEntry {
  id: string;
  rank: number;
  treeNumber: string;
  treeName: string;
  species: string;
  ownerName: string;
  imageUrl?: string;
  totalScore: number;
}

interface QueueEntry {
  id: string;
  queueStatus: string;
  eventId: string;
  treeName: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, subUp, icon: Icon, accent,
}: {
  label: string;
  value: number | string;
  sub: string;
  subUp?: boolean;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${accent}18` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
      <div>
        <div className="font-display text-3xl font-bold text-foreground">{value}</div>
        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${subUp ? "text-emerald-600" : "text-muted-foreground"}`}>
          {subUp && <ArrowUpRight className="h-3.5 w-3.5" />}
          {sub}
        </div>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  registration_open:  { label: "Open",      bg: "bg-emerald-100", text: "text-emerald-700" },
  ongoing:            { label: "Active",     bg: "bg-blue-100",    text: "text-blue-700"    },
  finished:           { label: "Completed",  bg: "bg-gray-100",    text: "text-gray-500"    },
  registration_closed:{ label: "Closed",     bg: "bg-amber-100",   text: "text-amber-700"   },
  published:          { label: "Upcoming",   bg: "bg-yellow-100",  text: "text-yellow-700"  },
  draft:              { label: "Draft",      bg: "bg-gray-100",    text: "text-gray-500"    },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: events = [] } = useGet<AdminEvent[]>(["admin-events"], "/events");
  const { data: participants = [] } = useGet<any[]>(["participants"], "/participants");
  const { data: rankings = [] } = useGet<RankEntry[]>(["ranking"], "/ranking");
  const { data: queue = [] } = useGet<QueueEntry[]>(["queue"], "/queue");

  const liveEntry = useMemo(
    () => queue.find((q) => q.queueStatus === "current"),
    [queue]
  );
  const activeEvent = useMemo(
    () => events.find((e) => e.status === "ongoing" || e.status === "registration_open"),
    [events]
  );
  const judgedCount = useMemo(
    () => queue.filter((q) => q.queueStatus === "done").length,
    [queue]
  );
  const waitingCount = useMemo(
    () => queue.filter((q) => q.queueStatus === "waiting").length,
    [queue]
  );

  const recentEvents = events.slice(0, 4);
  const topBonsai = rankings.slice(0, 4);

  return (
    <div className="space-y-6">

      {/* ── Header intro ───────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0D2818]">
          Dashboard <span className="text-[#2E8B57]">/</span> Control Center
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Welcome back, <strong>{user?.name || "Admin"}</strong> 👋 &nbsp;—&nbsp;
          Here's what's happening in the PPBI Bonsai Platform today.
        </p>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Bonsai"
          value={participants.length}
          sub="+2 this week"
          subUp
          icon={TreePine}
          accent="#2E8B57"
        />
        <KpiCard
          label="Active Events"
          value={events.length}
          sub={`${events.filter((e) => e.status === "registration_open" || e.status === "ongoing").length} active`}
          icon={CalendarDays}
          accent="#1F6F4A"
        />
        <KpiCard
          label="Participants"
          value={participants.length}
          sub={`${waitingCount} in queue`}
          subUp={participants.length > 0}
          icon={Users}
          accent="#C8A951"
        />
        <KpiCard
          label="Judged"
          value={judgedCount}
          sub={judgedCount > 0 ? "entries finalized" : "no entries yet"}
          icon={Award}
          accent="#6B7280"
        />
      </div>

      {/* ── Live System Status ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-5 shadow-lg"
        style={{
          background: "linear-gradient(120deg, #0D2818 0%, #1A4030 50%, #163526 100%)",
        }}
      >
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 30% 50%, #2E8B57 0%, transparent 70%)" }} />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 items-center justify-center">
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-white/80">
              Live System Status
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400" />
              <span className="text-white/60">Live Arena:</span>
              <span className="font-bold text-emerald-400">ACTIVE</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-white/60">Session:</span>
              <span className="font-bold text-white">
                {liveEntry ? "ONGOING" : "STANDBY"}
              </span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-white/60">Queue:</span>
              <span className="font-bold text-white">{queue.length} entries</span>
            </div>
            {activeEvent && (
              <>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Event:</span>
                  <span className="font-semibold text-[#C8A951]">{activeEvent.name}</span>
                </div>
              </>
            )}
          </div>

          <Link
            to="/live"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#0D2818] transition-all hover:scale-105"
            style={{ background: "#C8A951" }}
          >
            Go to Live Arena <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Main grid: Recent Events + Top Bonsai ─────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-2">

        {/* Recent Events */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#0D2818]">
              <CalendarDays className="h-4 w-4 text-[#2E8B57]" />
              Recent Events
            </h2>
            <Link to="/admin/events" className="flex items-center gap-1 text-xs font-medium text-[#2E8B57] hover:underline">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentEvents.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Belum ada event.</p>
            )}
            {recentEvents.map((event) => {
              const progressPct = event.status === "finished" ? 100
                : event.status === "ongoing" ? 60
                : event.status === "registration_open" ? 30
                : 10;
              const progressColor = event.status === "finished" ? "#9CA3AF"
                : event.status === "ongoing" ? "#2E8B57"
                : "#C8A951";
              return (
                <div
                  key={event.id}
                  className="group rounded-xl border border-border/60 p-4 hover:border-[#2E8B57]/30 hover:bg-[#F5F7F6] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{event.name}</p>
                        <StatusBadge status={event.status} />
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                        {event.startDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.startDate), "dd MMM yyyy")}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%`, background: progressColor }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/events`)}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 hover:border-[#2E8B57] hover:text-[#2E8B57] transition-all"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Bonsai */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#0D2818]">
              <Trophy className="h-4 w-4 text-[#C8A951]" />
              Top Bonsai
            </h2>
            <Link to="/admin/ranking" className="flex items-center gap-1 text-xs font-medium text-[#2E8B57] hover:underline">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {topBonsai.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data penilaian.</p>
            )}
            {topBonsai.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center gap-4 rounded-xl border border-border/60 p-3 hover:border-[#C8A951]/30 hover:bg-[#FEFCF3] transition-all"
              >
                {/* Rank / thumbnail */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ background: "#F5F7F6" }}>
                  {entry.imageUrl ? (
                    <img src={entry.imageUrl} alt={entry.treeName}
                      className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <span>{MEDAL[entry.rank] || `#${entry.rank}`}</span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-muted-foreground">{entry.treeNumber}</div>
                  <div className="truncate text-sm font-bold text-foreground">{entry.treeName}</div>
                  <div className="truncate text-xs text-muted-foreground">{entry.ownerName}</div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1">
                  <span
                    className="font-display text-xl font-bold"
                    style={{ color: "#1F6F4A" }}
                  >
                    {entry.totalScore}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom grid: Analytics + Quick Actions ─────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-2">

        {/* Analytics Overview */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-[#0D2818]">
            <TrendingUp className="h-4 w-4 text-[#2E8B57]" />
            Analytics Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Bonsai Growth */}
            <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #F0FAF4, #E8F5EE)" }}>
              <div className="mb-2 flex items-center gap-2">
                <TreePine className="h-4 w-4 text-[#2E8B57]" />
                <span className="text-xs font-semibold text-[#1F6F4A]">Bonsai Growth</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#0D2818]">{participants.length}</div>
              <div className="text-xs text-[#2E8B57]">terdaftar saat ini</div>
              {/* Mini bar chart */}
              <div className="mt-3 flex items-end gap-1 h-8">
                {[20, 40, 35, 60, 45, 70, participants.length > 0 ? 100 : 0].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t"
                    style={{ height: `${h}%`, background: i === 6 ? "#2E8B57" : "#2E8B5720" }} />
                ))}
              </div>
            </div>

            {/* Event Activity */}
            <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg, #FEFCF0, #FEF9E7)" }}>
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#C8A951]" />
                <span className="text-xs font-semibold text-[#8B6914]">Event Activity</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#0D2818]">{events.length}</div>
              <div className="text-xs text-[#C8A951]">
                {events.filter((e) => e.status === "registration_open" || e.status === "ongoing").length} active
              </div>
              {/* Mini bar chart */}
              <div className="mt-3 flex items-end gap-1 h-8">
                {[30, 50, 40, 70, 55, 80, events.length > 0 ? 100 : 0].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t"
                    style={{ height: `${h}%`, background: i === 6 ? "#C8A951" : "#C8A95120" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Queue progress */}
          {queue.length > 0 && (
            <div className="mt-4 rounded-xl border border-border/60 p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Judging Progress</span>
                <span className="font-bold text-[#2E8B57]">{judgedCount}/{queue.length}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: queue.length > 0 ? `${(judgedCount / queue.length) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #2E8B57, #1F6F4A)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 font-display text-base font-semibold text-[#0D2818]">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Register Bonsai",
                icon: PlusCircle,
                to: "/admin/participants",
                color: "#2E8B57",
                bg: "#F0FAF4",
              },
              {
                label: "Create Event",
                icon: CalendarDays,
                to: "/admin/events",
                color: "#1F6F4A",
                bg: "#E8F5EE",
              },
              {
                label: "Start Judging",
                icon: Play,
                to: "/admin/judging",
                color: "#C8A951",
                bg: "#FEFCF0",
              },
              {
                label: "Users & Roles",
                icon: ShieldCheck,
                to: "/admin/users",
                color: "#6B7280",
                bg: "#F9FAFB",
              },
            ].map(({ label, icon: Icon, to, color, bg }) => (
              <Link
                key={label}
                to={to}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border/60 p-4 transition-all hover:border-current hover:shadow-sm hover:-translate-y-0.5"
                style={{ borderColor: `${color}20` }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                  style={{ background: bg }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </Link>
            ))}
          </div>

          {/* Live Arena shortcut */}
          <Link
            to="/live"
            className="mt-3 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md"
            style={{ background: "linear-gradient(90deg, #0D2818, #1A4030)" }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Open Live Arena
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
