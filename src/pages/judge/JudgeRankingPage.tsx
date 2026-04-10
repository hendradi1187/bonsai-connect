import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useGet } from "@/hooks/useApi";
import { useRealtime } from "@/hooks/useRealtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JudgeRankingRow {
  id: string;
  rank: number;
  treeNumber: string;
  treeName: string;
  species: string;
  sizeCategory: string;
  totalScore: number;
}

export default function JudgeRankingPage() {
  const { data: initialRankings = [] } = useGet<JudgeRankingRow[]>(["judge-rankings"], "/ranking");
  const [rankings, setRankings] = useState<JudgeRankingRow[]>([]);

  useRealtime("ranking-update", (data) => {
    if (data) {
      setRankings(data);
    }
  });

  useEffect(() => {
    setRankings(initialRankings);
  }, [initialRankings]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Assigned Event Rankings</h2>
        <p className="text-sm text-muted-foreground">Hanya entry dari event yang di-assign ke akun juri ini yang akan tampil.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Live Standings
          </CardTitle>
          <CardDescription>Nama peserta disembunyikan. Ranking diurutkan berdasarkan total score.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rankings.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Belum ada hasil ranking pada event yang di-assign.
            </div>
          ) : rankings.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border bg-white/70 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-primary">
                  {item.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{item.treeNumber}</span>
                    <Badge variant="outline">{item.sizeCategory}</Badge>
                  </div>
                  <div className="mt-1 font-medium">{item.treeName}</div>
                  <div className="text-xs text-muted-foreground italic">{item.species}</div>
                </div>
              </div>
              <div className="font-mono text-2xl font-black text-primary">{item.totalScore}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
