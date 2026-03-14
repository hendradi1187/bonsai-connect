import { mockBonsai, getCategoryColor, getAverageScore } from "@/data/mockData";
import { getBonsaiImage } from "@/components/BonsaiCard";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminBonsaiPage() {
  const [search, setSearch] = useState("");
  const filtered = mockBonsai.filter(
    (b) =>
      !search ||
      b.treeName.toLowerCase().includes(search.toLowerCase()) ||
      b.treeNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Bonsai Trees</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockBonsai.length} registered trees</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Register Bonsai
        </button>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by tree number, name, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

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
                    <img src={getBonsaiImage(b.id)} alt="" className="h-10 w-10 rounded-md object-cover border" />
                    <div>
                      <p className="passport-id text-[10px]">{b.treeNumber}</p>
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
                  {getAverageScore(b.scores) || "—"}
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
              <img src={getBonsaiImage(b.id)} alt="" className="h-14 w-14 rounded-lg object-cover border" />
              <div className="min-w-0 flex-1">
                <p className="passport-id text-[10px]">{b.treeNumber}</p>
                <p className="text-sm font-medium truncate">{b.treeName}</p>
                <p className="text-xs text-muted-foreground">{b.ownerName} · {b.species}</p>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(b.category)}`}>
                  {b.category}
                </span>
                {getAverageScore(b.scores) > 0 && (
                  <p className="mt-1 font-mono text-sm font-bold text-primary">{getAverageScore(b.scores)}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
