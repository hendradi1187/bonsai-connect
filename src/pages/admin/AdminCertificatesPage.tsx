import { ExternalLink } from "lucide-react";
import { useGet } from "@/hooks/useApi";

interface CertificateItem {
  id: string;
  certificateNumber: string;
  ownerName: string;
  treeSpecies: string;
  category: string;
  rank: number;
  eventName: string;
  issueDate: string;
  verified: boolean;
}

export default function AdminCertificatesPage() {
  const { data: certificates = [], isLoading } = useGet<CertificateItem[]>(
    ["certificates"],
    "/certificates"
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">{certificates.length} certificates issued</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
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
              {certificates.map((cert) => (
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

          {certificates.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No certificates issued yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
