import { useState, useEffect } from "react";
import { useGet } from "@/hooks/useApi";
import { useRealtime } from "@/hooks/useRealtime";
import { 
  Trophy, 
  Medal, 
  Download, 
  Filter, 
  TrendingUp, 
  Search,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["All", "Mame", "Small", "Medium", "Large", "XL"];

export default function AdminRankingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [rankings, setRankings] = useState<any[]>([]);

  // API Hooks
  const { data: initialRankings, isLoading } = useGet<any[]>(['rankings'], '/ranking');

  // Real-time Updates
  useRealtime('ranking-update', (data) => {
    if (data) setRankings(data);
  });

  useEffect(() => {
    if (initialRankings) setRankings(initialRankings);
  }, [initialRankings]);

  const filteredRankings = rankings
    .filter(r => selectedCategory === "All" || r.sizeCategory === selectedCategory)
    .filter(r => 
      r.treeName.toLowerCase().includes(search.toLowerCase()) || 
      r.treeNumber.toLowerCase().includes(search.toLowerCase())
    );

  const topThree = filteredRankings.slice(0, 3);
  const others = filteredRankings.slice(3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Live Competition Rankings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time standings for Depok Bonsai Festival 2026</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          <Button className="bg-amber-600 hover:bg-amber-700"><Medal className="mr-2 h-4 w-4" /> Finalize Results</Button>
        </div>
      </div>

      {/* Top 3 Podium Visual */}
      <div className="grid gap-6 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {topThree.map((item, index) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-2 ${
                index === 0 ? 'border-amber-400 bg-amber-50/30' : 
                index === 1 ? 'border-slate-300 bg-slate-50/30' : 
                'border-amber-700/30 bg-amber-900/5'
              }`}>
                <div className={`absolute -right-4 -top-4 h-16 w-16 rotate-12 opacity-10 ${
                  index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : 'text-amber-800'
                }`}>
                  <Trophy className="h-full w-full" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={`${
                      index === 0 ? 'bg-amber-500 hover:bg-amber-600' : 
                      index === 1 ? 'bg-slate-400 hover:bg-slate-500' : 
                      'bg-amber-800 hover:bg-amber-900'
                    }`}>
                      RANK {item.rank}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{item.treeNumber}</span>
                  </div>
                  <CardTitle className="mt-4 truncate text-xl">{item.treeName}</CardTitle>
                  <CardDescription className="italic">{item.species}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Owner</p>
                      <p className="text-sm font-semibold">{item.ownerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</p>
                      <p className={`font-mono text-3xl font-black ${
                        index === 0 ? 'text-amber-600' : index === 1 ? 'text-slate-600' : 'text-amber-900'
                      }`}>{item.totalScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Detailed Standings
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input 
                  placeholder="Search entries..." 
                  className="pl-9 h-9" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                 />
               </div>
               <div className="flex items-center gap-1.5 rounded-lg border bg-background p-1">
                 {categories.map(cat => (
                   <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading ? (
              [1,2,3,4,5].map(i => <div key={i} className="h-16 w-full animate-pulse bg-muted/20" />)
            ) : others.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {others.map((item, i) => (
                  <motion.div 
                    layout
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-xs font-bold">
                      {item.rank}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-primary">{item.treeNumber}</span>
                          <span className="text-sm font-semibold truncate">{item.treeName}</span>
                          <Badge variant="outline" className="h-4 px-1.5 text-[9px] uppercase tracking-tighter">
                            {item.sizeCategory}
                          </Badge>
                       </div>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.ownerName} · {item.city}</p>
                    </div>
                    <div className="text-right">
                       <span className="font-mono text-xl font-black text-primary">{item.totalScore}</span>
                       <ChevronRight className="ml-2 inline h-4 w-4 text-muted-foreground/30" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                No entries found for this criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
