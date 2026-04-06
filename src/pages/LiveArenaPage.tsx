import { useState, useEffect } from "react";
import { useGet } from "@/hooks/useApi";
import { useRealtime } from "@/hooks/useRealtime";
import { 
  Trophy, 
  Users, 
  Activity, 
  TreePine, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveArenaPage() {
  const [currentJudging, setCurrentJudging] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [eventStats, setEventStats] = useState<any>({
    totalJudged: 0,
    totalEntries: 0,
    activeViewers: 0
  });

  // Initial Data
  const { data: initialData } = useGet<any>(['live-arena-init'], '/event-control/live-status');

  // Real-time Updates
  useRealtime('judging-update', (data) => {
    if (data.type === 'score_update') {
      setCurrentJudging(data.entry);
    }
    if (data.type === 'leaderboard_update') {
      setLeaderboard(data.rankings);
    }
    if (data.type === 'stats_update') {
      setEventStats(data.stats);
    }
  });

  useEffect(() => {
    if (initialData) {
      setCurrentJudging(initialData.currentJudging);
      setLeaderboard(initialData.leaderboard);
      setEventStats(initialData.stats);
    }
  }, [initialData]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 animate-pulse rounded-full bg-red-500/20 blur-sm" />
              <Badge className="relative border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/10">
                ● LIVE ARENA
              </Badge>
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight">Depok Bonsai Festival 2026</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="font-mono text-blue-100">{eventStats.activeViewers || 42} Viewers</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-emerald-100">{Math.round((eventStats.totalJudged / eventStats.totalEntries) * 100) || 0}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container grid gap-8 py-8 lg:grid-cols-12">
        {/* Left: Current Judging (Live) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
             <AnimatePresence mode="wait">
               {currentJudging ? (
                 <motion.div 
                   key={currentJudging.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="relative h-full w-full"
                 >
                    <img 
                      src={currentJudging.imageUrl || '/placeholder.svg'} 
                      alt={currentJudging.treeName}
                      className="h-full w-full object-cover opacity-60 grayscale-[0.2]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-12">
                       <div className="flex items-end justify-between">
                          <div>
                             <span className="font-mono text-2xl font-black text-primary drop-shadow-lg">{currentJudging.treeNumber}</span>
                             <h2 className="mt-2 font-display text-5xl font-black tracking-tight drop-shadow-2xl">{currentJudging.treeName}</h2>
                             <p className="mt-2 text-xl italic text-white/70">{currentJudging.species} · {currentJudging.ownerName}</p>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-black uppercase tracking-widest text-primary">Live Score</div>
                             <motion.div 
                               key={currentJudging.totalScore}
                               initial={{ scale: 0.8, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               className="font-mono text-[120px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                             >
                               {currentJudging.totalScore || '00'}
                             </motion.div>
                          </div>
                       </div>
                       
                       <div className="mt-8 grid grid-cols-5 gap-4">
                          {['nebari', 'trunk', 'branch', 'composition', 'pot'].map((key) => (
                            <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                               <div className="text-[10px] font-black uppercase tracking-wider text-white/50">{key}</div>
                               <div className="mt-1 font-mono text-2xl font-bold">{currentJudging.scores?.[key] || '0'}</div>
                               <Progress value={((currentJudging.scores?.[key] || 0) / 20) * 100} className="mt-2 h-1 bg-white/10" />
                            </div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="flex h-full flex-col items-center justify-center p-12 text-center">
                    <TreePine className="h-20 w-20 text-white/20 animate-pulse" />
                    <h3 className="mt-6 text-2xl font-bold text-white/50">Waiting for next entry...</h3>
                 </div>
               )}
             </AnimatePresence>
          </div>

          <div className="grid grid-cols-3 gap-6">
             <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                   <TrendingUp className="h-4 w-4" /> TRENDING UP
                </div>
                <div className="mt-4 flex items-center justify-between">
                   <span className="font-medium text-lg">Santigi #102</span>
                   <span className="font-mono font-bold text-emerald-400">+4.5</span>
                </div>
             </div>
             <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">ENTRIES REMAINING</div>
                <div className="mt-1 font-mono text-4xl font-bold">{eventStats.totalEntries - eventStats.totalJudged}</div>
             </div>
             <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                   <Award className="h-4 w-4" /> HIGHEST SCORE
                </div>
                <div className="mt-4 flex items-center justify-between">
                   <span className="font-medium text-lg">Juniper #105</span>
                   <span className="font-mono font-bold text-primary">89.5</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
             <h3 className="flex items-center gap-3 font-display text-xl font-bold">
                <Trophy className="h-6 w-6 text-amber-500" />
                Live Standings
             </h3>
             <div className="mt-8 space-y-4">
                {leaderboard.length > 0 ? leaderboard.map((item, index) => (
                  <motion.div 
                    layout
                    key={item.id}
                    className={`group flex items-center gap-4 rounded-2xl border border-white/5 p-4 transition-all hover:bg-white/10 ${
                      index === 0 ? 'bg-amber-500/10 border-amber-500/20 ring-1 ring-amber-500/10' : ''
                    }`}
                  >
                     <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-lg font-black ${
                        index === 0 ? 'bg-amber-500 text-black' : 
                        index === 1 ? 'bg-slate-300 text-black' : 
                        index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'
                     }`}>
                        {index + 1}
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="truncate font-bold tracking-tight">{item.treeName}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{item.treeNumber} · {item.ownerName}</p>
                     </div>
                     <div className="text-right">
                        <div className="font-mono text-xl font-black text-primary">{item.totalScore}</div>
                        <div className="text-[8px] font-black uppercase tracking-tighter text-white/30">POINTS</div>
                     </div>
                  </motion.div>
                )) : (
                  [1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-white/5" />
                  ))
                )}
             </div>
             <button className="mt-6 w-full rounded-xl border border-white/10 py-3 text-xs font-bold uppercase tracking-widest text-white/50 transition-colors hover:bg-white/5">
                View Full Rankings <ChevronRight className="inline h-3 w-3" />
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}
