import { type BonsaiTree, getCategoryColor, getRankBadge, getAverageScore } from "@/data/mockData";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import bonsai1 from "@/assets/bonsai-1.jpg";
import bonsai2 from "@/assets/bonsai-2.jpg";
import bonsai3 from "@/assets/bonsai-3.jpg";
import bonsai4 from "@/assets/bonsai-4.jpg";
import bonsai5 from "@/assets/bonsai-5.jpg";
import bonsai6 from "@/assets/bonsai-6.jpg";

const bonsaiImages: Record<string, string> = {
  "b-001": bonsai1,
  "b-002": bonsai2,
  "b-003": bonsai3,
  "b-004": bonsai4,
  "b-005": bonsai5,
  "b-006": bonsai6,
};

export function getBonsaiImage(id: string) {
  return bonsaiImages[id] || bonsai1;
}

interface BonsaiCardProps {
  bonsai: BonsaiTree;
  index?: number;
}

export function BonsaiCard({ bonsai, index = 0 }: BonsaiCardProps) {
  const score = getAverageScore(bonsai.scores);
  const bestResult = bonsai.eventHistory?.find((e) => e.rank);
  const rankBadge = bestResult ? getRankBadge(bestResult.rank) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/bonsai-passport/${bonsai.passportId}`}
        className="group block card-archive overflow-hidden transition-all hover:shadow-md"
      >
        <div className="aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={getBonsaiImage(bonsai.id)}
            alt={bonsai.treeName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)" }}
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="passport-id">{bonsai.passportId}</p>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight truncate">
                {bonsai.treeName}
              </h3>
              <p className="text-sm italic text-muted-foreground">{bonsai.species}</p>
            </div>
            {rankBadge && (
              <span className="shrink-0 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                {rankBadge}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(bonsai.category)}`}>
              {bonsai.category}
            </span>
            {score > 0 && (
              <span className="font-mono text-xs text-muted-foreground">
                {score} pts
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{bonsai.ownerName} · {bonsai.city}</p>
        </div>
      </Link>
    </motion.div>
  );
}
