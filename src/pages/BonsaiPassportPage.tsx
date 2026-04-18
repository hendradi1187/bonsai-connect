import { useParams, Link } from "react-router-dom";
import { useGet } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Ruler, Clock, Award, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ScoreData {
  appearance?: number;
  movement?: number;
  harmony?: number;
  maturity?: number;
  nebari?: number;
  trunk?: number;
  branch?: number;
  composition?: number;
  pot?: number;
  predicate?: string;
  note?: string;
}

interface ParticipantLookupResponse {
  id: string;
  name: string;
  city: string;
  registrationNumber: string;
  judgingNumber: string;
  status: string;
  event: {
    name: string;
    location: string;
    startDate: string;
  } | null;
  rank: number | null;
  totalScore: number | null;
  scores: ScoreData | null;
  bonsai: Array<{
    id: string;
    name: string;
    species: string;
    sizeCategory: string;
    imageUrl: string;
  }>;
}

const criteria = [
  { key: "appearance", label: "Penampilan (Appearance)" },
  { key: "movement", label: "Gerak Dasar (Basic Movement)" },
  { key: "harmony", label: "Keserasian (Harmony)" },
  { key: "maturity", label: "Kematangan (Maturity)" },
];

const getGrade = (score: number) => {
  if (score >= 81) return { label: 'A', color: 'text-emerald-600' };
  if (score >= 71) return { label: 'B', color: 'text-blue-600' };
  if (score >= 61) return { label: 'C', color: 'text-amber-600' };
  return { label: 'D', color: 'text-red-600' };
};

export default function BonsaiPassportPage() {
  const { passportId } = useParams<{ passportId: string }>();

  // Try passport registry first (BNS-DPK-XXXXX), fall back to participant lookup
  const isPassportId = passportId?.startsWith("BNS-");
  const { data: participant, isLoading } = useGet<ParticipantLookupResponse>(
    ["bonsai-passport", passportId],
    isPassportId
      ? `/public/passports/${passportId}`
      : `/participants/lookup?registration_number=${passportId}`
  );

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="h-96 w-full max-w-4xl animate-pulse rounded-3xl bg-muted/20" />
      </div>
    );
  }

  if (!participant) {
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

  const bonsaiInfo = participant.bonsai[0];
  const scores = participant.scores;

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
              className="aspect-[4/5] overflow-hidden rounded-2xl border shadow-lg bg-background"
            >
              <img src={bonsaiInfo?.imageUrl || '/placeholder.svg'} alt={bonsaiInfo?.name} className="h-full w-full object-cover" />
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
                <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{participant.registrationNumber}</span>
                <h1 className="mt-1 font-display text-4xl font-bold tracking-tight italic">{bonsaiInfo?.species || 'Unknown Species'}</h1>
                <p className="mt-1 font-display text-lg font-medium">{bonsaiInfo?.name || 'Unnamed Tree'}</p>
              </div>

              {/* Meta */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: "Owner", value: participant.name },
                  { label: "City", value: participant.city },
                  { label: "Size Category", value: bonsaiInfo?.sizeCategory || 'Large' },
                  { label: "Judging No.", value: participant.judgingNumber },
                  { label: "Event", value: participant.event?.name || '—' },
                  { label: "Status", value: participant.status },
                ].map((item) => (
                  <div key={item.label} className="card-archive p-3">
                    <p className="data-label">{item.label}</p>
                    <p className="mt-1 text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Score Display */}
              {participant.totalScore && participant.totalScore > 0 && (
                <div className="mt-8 card-archive p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="data-label">Competition Score</p>
                      <p className="mt-1 font-mono text-5xl font-black text-primary tabular-nums">{participant.totalScore}</p>
                      {scores?.predicate && (
                        <Badge className="mt-2 bg-primary/10 text-primary hover:bg-primary/10 border-primary/20 font-bold px-3">
                          {scores.predicate}
                        </Badge>
                      )}
                    </div>
                    {participant.rank && (
                      <div className="text-right">
                        <p className="data-label text-amber-600">Final Rank</p>
                        <p className="mt-1 font-mono text-4xl font-black text-amber-600">#{participant.rank}</p>
                      </div>
                    )}
                  </div>

                  {/* Score breakdown (New System) */}
                  {scores && scores.appearance !== undefined && (
                    <div className="mt-8 border-t pt-6 space-y-4">
                      <p className="data-label mb-4">Score Breakdown</p>
                      {criteria.map((c) => {
                        const score = (scores as any)[c.key] || 0;
                        const grade = getGrade(score);
                        const progress = ((score - 50) / 40) * 100;
                        
                        return (
                          <div key={c.key} className="space-y-1.5">
                            <div className="flex justify-between items-end">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{c.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-black ${grade.color}`}>{grade.label}</span>
                                <span className="font-mono text-sm font-bold">{score}</span>
                              </div>
                            </div>
                            <Progress value={progress > 0 ? progress : 0} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Legacy Score Breakdown (Fallback) */}
                  {scores && scores.appearance === undefined && scores.nebari !== undefined && (
                    <div className="mt-8 border-t pt-6 space-y-4">
                      <p className="data-label mb-4">Score Breakdown (Legacy)</p>
                      {["Nebari", "Trunk", "Branch", "Composition", "Pot"].map((key) => {
                        const score = (scores as any)[key.toLowerCase()] || 0;
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="w-24 text-xs font-medium">{key}</span>
                            <Progress value={(score / 20) * 100} className="flex-1 h-1.5" />
                            <span className="w-8 text-right font-mono text-xs font-bold">{score}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Judge's Note */}
                  {scores?.note && (
                    <div className="mt-8 bg-muted/30 rounded-xl p-4 border border-dashed">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3" /> Judge's Feedback
                      </p>
                      <p className="text-sm italic text-foreground/80 leading-relaxed">
                        "{scores.note}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Event Registration Info */}
              <div className="mt-12 border-t pt-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="data-label">Registration No.</p>
                    <p className="mt-1 font-mono text-sm font-bold text-primary">{participant.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="data-label">Judging No.</p>
                    <p className="mt-1 font-mono text-sm font-bold text-emerald-600">{participant.judgingNumber}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
