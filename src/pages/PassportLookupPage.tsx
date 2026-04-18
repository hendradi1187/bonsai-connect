import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import api from "@/services/api";

interface PassportSearchResult {
  passportId: string;
  treeName: string;
  species: string;
  ownerName: string;
  city: string;
}

export default function PassportLookupPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PassportSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (value.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<PassportSearchResult[]>("/public/passports/search", {
        params: { q: value },
      });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="growth-ring-bg min-h-[80vh] py-20">
      <div className="container max-w-2xl">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tighter">Bonsai Passport Lookup</h1>
          <p className="mt-2 text-muted-foreground">Search by Passport ID, tree name, or owner name</p>
        </div>

        <div className="mt-10 card-archive p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="e.g. BNS-DPK-00001 or Ficus..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {loading && (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((b) => (
              <Link
                key={b.passportId}
                to={`/bonsai-passport/${b.passportId}`}
                className="card-archive block p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="passport-id">{b.passportId}</p>
                    <p className="mt-0.5 text-sm font-medium">
                      {b.treeName} — <span className="italic text-muted-foreground">{b.species}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{b.ownerName} · {b.city}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && search.length >= 2 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">No bonsai found</p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Try: BNS-DPK-00001, Rajawali, or Ahmad
        </p>
      </div>
    </div>
  );
}
