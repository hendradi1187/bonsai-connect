import { useState } from "react";
import { mockBonsai, type JudgingScore } from "@/data/mockData";
import { getBonsaiImage } from "@/components/BonsaiCard";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const criteria = [
  { key: "nebari" as const, label: "Nebari (Root Spread)" },
  { key: "trunk" as const, label: "Trunk Quality" },
  { key: "branch" as const, label: "Branch Structure" },
  { key: "composition" as const, label: "Composition Balance" },
  { key: "pot" as const, label: "Pot Harmony" },
];

export default function AdminJudgingPage() {
  const bonsai = mockBonsai[2]; // Sang Penjaga - approved, not yet judged
  const [scores, setScores] = useState<Record<string, number>>({
    nebari: 15,
    trunk: 15,
    branch: 15,
    composition: 15,
    pot: 15,
  });
  const [submitted, setSubmitted] = useState(false);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight">Digital Judging</h1>
      <p className="mt-1 text-sm text-muted-foreground">Score bonsai entries for the current event</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* Tree Info */}
        <div className="card-archive overflow-hidden lg:sticky lg:top-20 lg:self-start">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={getBonsaiImage(bonsai.id)} alt={bonsai.treeName} className="h-full w-full object-cover" />
          </div>
          <div className="p-4">
            <p className="passport-id">{bonsai.treeNumber}</p>
            <h3 className="mt-1 font-display text-lg font-semibold">{bonsai.treeName}</h3>
            <p className="text-sm italic text-muted-foreground">{bonsai.species}</p>
            <p className="mt-1 text-xs text-muted-foreground">{bonsai.ownerName} · {bonsai.city}</p>
          </div>
        </div>

        {/* Scoring Form */}
        <div className="card-archive p-6">
          <h2 className="font-display text-lg font-semibold">Score Entry</h2>
          <p className="text-xs text-muted-foreground">Judge: Pak Budi · Depok Bonsai Festival 2026</p>

          <div className="mt-6 space-y-0">
            {criteria.map(({ key, label }) => (
              <div key={key} className="border-b border-muted py-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold uppercase tracking-tight">{label}</label>
                  <span className="font-mono text-primary font-bold">{scores[key]}/20</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={scores[key]}
                  onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none accent-primary cursor-pointer"
                  style={{ minHeight: "44px" }}
                />
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-primary/5 p-4">
            <span className="text-sm font-semibold">Total Score</span>
            <motion.span
              key={total}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-3xl font-bold text-primary tabular-nums"
            >
              {total}
            </motion.span>
          </div>

          <button
            onClick={() => setSubmitted(true)}
            disabled={submitted}
            className={`mt-6 w-full rounded-lg py-3.5 text-sm font-medium transition-all active:scale-[0.98] ${
              submitted
                ? "bg-emerald-100 text-emerald-700"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
            style={{ minHeight: "48px" }}
          >
            {submitted ? (
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> Score Submitted</span>
            ) : (
              "Submit Score"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
