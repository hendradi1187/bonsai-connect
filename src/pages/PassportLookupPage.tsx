import { useState } from "react";
import { Link } from "react-router-dom";
import { mockBonsai } from "@/data/mockData";
import { Search } from "lucide-react";

export default function PassportLookupPage() {
  const [search, setSearch] = useState("");
  
  const filtered = search.length >= 2
    ? mockBonsai.filter(
        (b) =>
          b.passportId.toLowerCase().includes(search.toLowerCase()) ||
          b.treeName.toLowerCase().includes(search.toLowerCase()) ||
          b.ownerName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-3 pl-10 pr-4 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 space-y-2">
            {filtered.map((b) => (
              <Link
                key={b.id}
                to={`/bonsai-passport/${b.passportId}`}
                className="card-archive block p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="passport-id">{b.passportId}</p>
                    <p className="mt-0.5 text-sm font-medium">{b.treeName} — <span className="italic text-muted-foreground">{b.species}</span></p>
                    <p className="text-xs text-muted-foreground">{b.ownerName} · {b.city}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {search.length >= 2 && filtered.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">No bonsai found</p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Try: BNS-DPK-00001, Rajawali, or Ahmad
        </p>
      </div>
    </div>
  );
}
