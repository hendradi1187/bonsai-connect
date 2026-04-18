import { getCategoryColor } from "@/data/mockData";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export interface ApiPassport {
  id: string;
  passportId: string;
  treeName: string;
  species: string;
  ownerName: string;
  city: string;
  category: string;
  photoUrl?: string | null;
  averageScore?: number | null;
  status?: string;
}

interface BonsaiCardProps {
  bonsai: ApiPassport;
  index?: number;
}

export function BonsaiCard({ bonsai, index = 0 }: BonsaiCardProps) {
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
          {bonsai.photoUrl ? (
            <img
              src={bonsai.photoUrl}
              alt={bonsai.treeName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
              <span className="text-5xl select-none">🌿</span>
            </div>
          )}
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
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(bonsai.category)}`}>
              {bonsai.category}
            </span>
            {bonsai.averageScore != null && bonsai.averageScore > 0 && (
              <span className="font-mono text-xs text-muted-foreground">
                {bonsai.averageScore} pts
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">{bonsai.ownerName} · {bonsai.city}</p>
        </div>
      </Link>
    </motion.div>
  );
}
