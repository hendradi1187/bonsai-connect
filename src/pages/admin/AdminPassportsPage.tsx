import { mockBonsai } from "@/data/mockData";
import { BookOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function AdminPassportsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockBonsai.filter(
    (b) => !search || b.passportId.toLowerCase().includes(search.toLowerCase()) || b.treeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Bonsai Passport Registry</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockBonsai.length} passports issued</p>
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

      <div className="mt-4 card-archive">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left data-label">Passport ID</th>
              <th className="px-4 py-3 text-left data-label">Tree Name</th>
              <th className="px-4 py-3 text-left data-label">Species</th>
              <th className="px-4 py-3 text-left data-label">Owner</th>
              <th className="px-4 py-3 text-left data-label">City</th>
              <th className="px-4 py-3 text-left data-label">Registered</th>
              <th className="px-4 py-3 text-left data-label">Events</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/bonsai-passport/${b.passportId}`} className="passport-id hover:underline">
                    {b.passportId}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{b.treeName}</td>
                <td className="px-4 py-3 text-sm italic text-muted-foreground">{b.species}</td>
                <td className="px-4 py-3 text-sm">{b.ownerName}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{b.city}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.registrationDate}</td>
                <td className="px-4 py-3 font-mono text-sm">{b.eventHistory?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
