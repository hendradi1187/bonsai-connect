import { BookOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useGet } from "@/hooks/useApi";
import type { ApiPassport } from "@/components/BonsaiCard";

export default function AdminPassportsPage() {
  const [search, setSearch] = useState("");
  const { data: passports = [], isLoading } = useGet<ApiPassport[]>(
    ["passports"],
    "/public/passports"
  );

  const filtered = passports.filter(
    (b) =>
      !search ||
      b.passportId.toLowerCase().includes(search.toLowerCase()) ||
      b.treeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Bonsai Passport Registry</h1>
          <p className="mt-1 text-sm text-muted-foreground">{passports.length} passports issued</p>
        </div>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by Passport ID or tree name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="mt-4 card-archive">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left data-label">Passport ID</th>
                <th className="px-4 py-3 text-left data-label">Tree Name</th>
                <th className="px-4 py-3 text-left data-label">Species</th>
                <th className="px-4 py-3 text-left data-label">Owner</th>
                <th className="px-4 py-3 text-left data-label">City</th>
                <th className="px-4 py-3 text-left data-label">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/bonsai-passport/${b.passportId}`} className="passport-id hover:underline flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      {b.passportId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{b.treeName}</td>
                  <td className="px-4 py-3 text-sm italic text-muted-foreground">{b.species}</td>
                  <td className="px-4 py-3 text-sm">{b.ownerName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{b.city}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      b.status === "judged" ? "bg-emerald-100 text-emerald-700" :
                      b.status === "approved" ? "bg-blue-100 text-blue-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No passports found.</p>
          )}
        </div>
      )}
    </div>
  );
}
