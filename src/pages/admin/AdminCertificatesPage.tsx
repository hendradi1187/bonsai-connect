import { mockCertificates } from "@/data/mockData";
import { Plus, ExternalLink } from "lucide-react";

export default function AdminCertificatesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockCertificates.length} certificates issued</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Generate Certificate
        </button>
      </div>

      <div className="mt-6 card-archive">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left data-label">Certificate No.</th>
              <th className="px-4 py-3 text-left data-label">Owner</th>
              <th className="px-4 py-3 text-left data-label">Species</th>
              <th className="px-4 py-3 text-left data-label">Category</th>
              <th className="px-4 py-3 text-left data-label">Rank</th>
              <th className="px-4 py-3 text-left data-label">Event</th>
              <th className="px-4 py-3 text-left data-label">Issued</th>
              <th className="px-4 py-3 text-left data-label">Verify</th>
            </tr>
          </thead>
          <tbody>
            {mockCertificates.map((cert) => (
              <tr key={cert.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold">{cert.certificateNumber}</td>
                <td className="px-4 py-3 text-sm">{cert.ownerName}</td>
                <td className="px-4 py-3 text-sm italic text-muted-foreground">{cert.treeSpecies}</td>
                <td className="px-4 py-3 text-sm">{cert.category}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  {cert.rank === 1 ? "🥇" : cert.rank === 2 ? "🥈" : "🥉"} {cert.rank}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{cert.eventName}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cert.issueDate}</td>
                <td className="px-4 py-3">
                  <a
                    href={`/verify-certificate?cert=${cert.certificateNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Verify
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
