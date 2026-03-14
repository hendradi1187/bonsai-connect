import { mockBonsai, getCategoryColor, getAverageScore, getRankBadge } from "@/data/mockData";

const categories = ["All", "Sito", "Mame", "Shohin", "Medium", "Large"];

import { useState } from "react";

export default function AdminRankingPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const scored = mockBonsai
    .filter((b) => b.scores && b.scores.length > 0)
    .filter((b) => selectedCategory === "All" || b.category === selectedCategory)
    .sort((a, b) => getAverageScore(b.scores) - getAverageScore(a.scores));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Live Ranking</h1>
          <p className="mt-1 text-sm text-muted-foreground">Depok Bonsai Festival 2026</p>
        </div>
        <button className="rounded-lg border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
          Lock Rankings
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {scored.map((b, i) => {
          const avg = getAverageScore(b.scores);
          const rank = i + 1;
          const badge = getRankBadge(rank <= 3 ? rank : undefined);

          return (
            <div key={b.id} className="card-archive flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold ${
                rank === 1 ? "bg-gold/20 text-gold" :
                rank === 2 ? "bg-muted text-muted-foreground" :
                rank === 3 ? "bg-amber-100 text-amber-700" :
                "bg-muted text-muted-foreground"
              }`}>
                {rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{b.treeName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(b.category)}`}>
                    {b.category}
                  </span>
                  {badge && (
                    <span className="text-xs">{badge}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{b.ownerName} · {b.species}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-primary tabular-nums">{avg}</p>
                <p className="text-xs text-muted-foreground">{b.scores?.length} judge(s)</p>
              </div>
            </div>
          );
        })}

        {scored.length === 0 && (
          <div className="card-archive p-8 text-center text-sm text-muted-foreground">
            No scored entries in this category
          </div>
        )}
      </div>
    </div>
  );
}
