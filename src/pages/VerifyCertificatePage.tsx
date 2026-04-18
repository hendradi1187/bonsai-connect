import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Shield, ShieldCheck, Search } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/services/api";

interface CertificateResult {
  certificateNumber: string;
  ownerName: string;
  treeSpecies: string;
  category: string;
  rank: number;
  eventName: string;
  issueDate: string;
  verified: boolean;
  photoUrl?: string | null;
}

export default function VerifyCertificatePage() {
  const [searchParams] = useSearchParams();
  const [certNumber, setCertNumber] = useState(searchParams.get("cert") || "");
  const [result, setResult] = useState<CertificateResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!certNumber.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.get<CertificateResult>("/public/certificates/verify", {
        params: { cert: certNumber.trim() },
      });
      setResult(res.data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Auto-search on mount if cert param is present
  useState(() => {
    const cert = searchParams.get("cert");
    if (cert) handleSearch();
  });

  return (
    <div className="growth-ring-bg min-h-[80vh] py-20">
      <div className="container max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tighter">
            Certificate Verification
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter the certificate number to verify its authenticity
          </p>
        </div>

        <div className="mt-10 card-archive p-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. CERT-DPK-2026-001"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 rounded-lg border bg-background px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {searched && result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 card-archive overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b bg-primary/5 px-6 py-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Certificate Verified</span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-[160px,1fr]">
              <div className="aspect-[4/5] overflow-hidden rounded-lg border bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                {result.photoUrl ? (
                  <img src={result.photoUrl} alt="Bonsai" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl select-none">🌿</span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="data-label">Certificate Number</p>
                  <p className="font-mono text-sm font-bold">{result.certificateNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="data-label">Owner</p>
                    <p className="text-sm font-medium">{result.ownerName}</p>
                  </div>
                  <div>
                    <p className="data-label">Species</p>
                    <p className="text-sm font-medium italic">{result.treeSpecies}</p>
                  </div>
                  <div>
                    <p className="data-label">Category</p>
                    <p className="text-sm font-medium">{result.category}</p>
                  </div>
                  <div>
                    <p className="data-label">Rank</p>
                    <p className="text-sm font-bold">
                      {result.rank === 1 ? "🥇 1st Place" : result.rank === 2 ? "🥈 2nd Place" : "🥉 3rd Place"}
                    </p>
                  </div>
                  <div>
                    <p className="data-label">Event</p>
                    <p className="text-sm font-medium">{result.eventName}</p>
                  </div>
                  <div>
                    <p className="data-label">Issue Date</p>
                    <p className="font-mono text-sm">{result.issueDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {searched && !result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 card-archive p-8 text-center"
          >
            <p className="text-sm text-destructive font-medium">Certificate not found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please check the certificate number and try again
            </p>
          </motion.div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Try: CERT-DPK-2026-001, CERT-DPK-2026-002, or CERT-DPK-2026-006
        </p>
      </div>
    </div>
  );
}
