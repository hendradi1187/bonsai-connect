import { useState } from "react";
import { getCategoryColor } from "@/data/mockData";
import { BonsaiCard, type ApiPassport } from "@/components/BonsaiCard";
import { useGet } from "@/hooks/useApi";

const categories = ["All", "Sito", "Mame", "Shohin", "Medium", "Large"];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: passports = [], isLoading } = useGet<ApiPassport[]>(
    ["passports"],
    "/public/passports"
  );

  const filtered = passports.filter((b) => {
    const matchCategory = selectedCategory === "All" || b.category === selectedCategory;
    const matchSearch =
      !search ||
      b.treeName.toLowerCase().includes(search.toLowerCase()) ||
      b.species.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="py-12">
      <div className="container">
        <h1 className="font-display text-4xl font-semibold tracking-tighter">Bonsai Gallery</h1>
        <p className="mt-2 text-muted-foreground">Browse registered bonsai from our exhibitions</p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : getCategoryColor(cat === "All" ? "" : cat) || "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search tree, species, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:w-72"
          />
        </div>

        {isLoading ? (
          <div className="passport-grid mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-muted aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="passport-grid mt-8">
            {filtered.map((b, i) => (
              <BonsaiCard key={b.id} bonsai={b} index={i} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            No bonsai found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
