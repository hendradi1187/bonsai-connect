import { getCategoryColor } from "@/data/mockData";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGet } from "@/hooks/useApi";
import type { ApiPassport } from "@/components/BonsaiCard";

export default function AdminBonsaiPage() {
  const [search, setSearch] = useState("");
  const { data: bonsai = [], isLoading } = useGet<ApiPassport[]>(
    ["passports"],
    "/public/passports"
  );

  const filtered = bonsai.filter(
    (b) =>
      !search ||
      b.treeName.toLowerCase().includes(search.toLowerCase()) ||
      b.passportId.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Bonsai Trees</h1>
          <p className="mt-1 text-sm text-muted-foreground">{bonsai.length} registered trees</p>
        </div>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by passport ID, name, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="mt-4 card-archive hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left data-label">Tree</th>
                  <th className="px-4 py-3 text-left data-label">Owner</th>
                  <th className="px-4 py-3 text-left data-label">Species</th>
                  <th className="px-4 py-3 text-left data-label">Category</th>
                  <th className="px-4 py-3 text-left data-label">Status</th>
                  <th className="px-4 py-3 text-right data-label">Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/bonsai-passport/${b.passportId}`} className="flex items-center gap-3 hover:text-primary">
                        <div className="h-10 w-10 rounded-md border bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center text-lg">
                          🌿
                        </div>
                        <div>
                          <p className="passport-id text-[10px]">{b.passportId}</p>
                          <p className="text-sm font-medium">{b.treeName}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{b.ownerName}</td>
                    <td className="px-4 py-3 text-sm italic text-muted-foreground">{b.species}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(b.category)}`}>
                        {b.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        b.status === "judged" ? "bg-emerald-100 text-emerald-700" :
                        b.status === "approved" ? "bg-blue-100 text-blue-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold text-primary">
                      {b.averageScore ? b.averageScore.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mt-4 space-y-3 lg:hidden">
            {filtered.map((b) => (
              <Link key={b.id} to={`/bonsai-passport/${b.passportId}`} className="card-archive block p-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg border bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center text-2xl">
                    🌿
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="passport-id text-[10px]">{b.passportId}</p>
                    <p className="text-sm font-medium truncate">{b.treeName}</p>
                    <p className="text-xs text-muted-foreground">{b.ownerName} · {b.species}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(b.category)}`}>
                      {b.category}
                    </span>
                    {b.averageScore != null && b.averageScore > 0 && (
                      <p className="mt-1 font-mono text-sm font-bold text-primary">{b.averageScore.toFixed(1)}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">No bonsai found.</p>
      )}
    </div>
  );
}
