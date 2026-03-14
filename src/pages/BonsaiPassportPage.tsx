import { useParams, Link } from "react-router-dom";
import { mockBonsai, getCategoryColor, getAverageScore, getRankBadge } from "@/data/mockData";
import { getBonsaiImage } from "@/components/BonsaiCard";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Ruler, Clock, Award } from "lucide-react";

export default function BonsaiPassportPage() {
  const { passportId } = useParams<{ passportId: string }>();
  const bonsai = mockBonsai.find((b) => b.passportId === passportId);

  if (!bonsai) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground">Passport not found</p>
          <Link to="/gallery" className="mt-4 inline-block text-sm text-primary hover:underline">
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  const avgScore = getAverageScore(bonsai.scores);

  return (
    <div className="growth-ring-bg min-h-screen">
      <div className="container py-8">
        <Link to="/gallery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Gallery
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr,1.2fr]">
          {/* Photo - Sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[4/5] overflow-hidden rounded-2xl border shadow-lg"
            >
              <img src={getBonsaiImage(bonsai.id)} alt={bonsai.treeName} className="h-full w-full object-cover" />
            </motion.div>
          </div>

          {/* Info */}
          <div className="py-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Passport Header */}
              <div className="border-l-4 border-primary pl-4">
                <span className="font-mono text-xs tracking-widest text-muted-foreground">{bonsai.passportId}</span>
                <h1 className="mt-1 font-display text-4xl font-bold tracking-tight italic">{bonsai.species}</h1>
                <p className="mt-1 font-display text-lg font-medium">{bonsai.treeName}</p>
              </div>

              {/* Meta */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: "Owner", value: bonsai.ownerName, icon: null },
                  { label: "City", value: bonsai.city, icon: MapPin },
                  { label: "Category", value: bonsai.category, icon: null },
                  { label: "Height", value: `${bonsai.heightCm} cm`, icon: Ruler },
                  { label: "Est. Age", value: bonsai.estimatedAge ? `${bonsai.estimatedAge} years` : "—", icon: Clock },
                  { label: "Style", value: bonsai.style || "—", icon: null },
                ].map((item) => (
                  <div key={item.label} className="card-archive p-3">
                    <p className="data-label">{item.label}</p>
                    <p className="mt-1 text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Score */}
              {avgScore > 0 && (
                <div className="mt-8 card-archive p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="data-label">Competition Score</p>
                      <p className="mt-1 font-mono text-4xl font-bold text-primary tabular-nums">{avgScore}</p>
                      <p className="text-xs text-muted-foreground">{bonsai.scores?.length} judge(s)</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(bonsai.category)}`}>
                      {bonsai.category}
                    </span>
                  </div>

                  {/* Score breakdown */}
                  {bonsai.scores && bonsai.scores.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="data-label mb-3">Score Breakdown (Average)</p>
                      {["Nebari", "Trunk", "Branch", "Composition", "Pot"].map((criteria) => {
                        const key = criteria.toLowerCase() as "nebari" | "trunk" | "branch" | "composition" | "pot";
                        const avg = Math.round(
                          bonsai.scores!.reduce((s, sc) => s + sc[key], 0) / bonsai.scores!.length
                        );
                        return (
                          <div key={criteria} className="mb-2 flex items-center gap-3">
                            <span className="w-28 text-xs font-medium">{criteria}</span>
                            <div className="flex-1 h-2 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${(avg / 20) * 100}%` }}
                              />
                            </div>
                            <span className="w-10 text-right font-mono text-xs font-bold">{avg}/20</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Event History Timeline */}
              {bonsai.eventHistory && bonsai.eventHistory.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-semibold tracking-tight">Event History</h2>
                  <div className="mt-4 space-y-0">
                    {bonsai.eventHistory.map((entry, i) => {
                      const rankBadge = getRankBadge(entry.rank);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="flex gap-4"
                        >
                          <div className="flex flex-col items-center">
                            <div className={`h-3 w-3 rounded-full border-2 ${entry.rank ? "border-gold bg-gold" : "border-primary bg-primary"}`} />
                            {i < bonsai.eventHistory!.length - 1 && <div className="w-px flex-1 bg-border" />}
                          </div>
                          <div className="pb-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-mono text-xs text-muted-foreground">{entry.year}</span>
                            </div>
                            <p className="mt-1 text-sm font-medium">{entry.eventName}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{entry.result}</span>
                              {rankBadge && (
                                <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                                  {rankBadge}
                                </span>
                              )}
                              {entry.certificateId && (
                                <Link
                                  to={`/verify-certificate?cert=${entry.certificateId}`}
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <Award className="h-3 w-3" />
                                  Certificate
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Registration Info */}
              <div className="mt-8 border-t pt-6">
                <p className="data-label">Registration Date</p>
                <p className="mt-1 font-mono text-sm">{bonsai.registrationDate}</p>
                <p className="data-label mt-3">Tree Number</p>
                <p className="mt-1 font-mono text-sm">{bonsai.treeNumber}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
