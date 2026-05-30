"use client";

import ResultsSearchBar from "@/components/ResultsSearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import ResultsHeaderCard from "@/components/resultCards/ResultsHeaderCard";
import TrainResultsCard from "@/components/resultCards/TrainResultsCard";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trainsAPI } from "@/lib/api";
import { Train } from "@/data/trains";

type SortOption = "Earliest Departure" | "Lowest Price" | "Shortest Duration";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("Earliest Departure");

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  // Re-fetch whenever route params change
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: Train[];
        if (from && to) {
          data = await trainsAPI.search(from, to);
        } else {
          data = await trainsAPI.getAll();
        }
        setTrains(data);
      } catch (err) {
        console.error("Error fetching trains:", err);
        setError("Failed to load trains. Is the backend running?");
        setTrains([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrains();
  }, [from, to]);

  const sortedTrains = useMemo(() => {
    const list = [...trains];
    if (sortBy === "Lowest Price") {
      return list.sort((a, b) => {
        const aP = a.price_ac2 ?? a.price_ac3 ?? a.price_sleeper ?? Number.MAX_SAFE_INTEGER;
        const bP = b.price_ac2 ?? b.price_ac3 ?? b.price_sleeper ?? Number.MAX_SAFE_INTEGER;
        return aP - bP;
      });
    }
    if (sortBy === "Shortest Duration") {
      return list.sort((a, b) => parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration));
    }
    return list.sort((a, b) => (a.departure_time ?? "").localeCompare(b.departure_time ?? ""));
  }, [trains, sortBy]);

  // Route summary for the header
  const routeLabel = from && to ? `${from} → ${to}` : "All Routes";
  const dateLabel = searchParams.get("date") || "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Compact search bar strip */}
      <div className="border-b border-secondary/20 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-7xl">
          <ResultsSearchBar />
        </div>
      </div>

      {/* Page body */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-orange-600">{routeLabel}</span>
          {dateLabel && (
            <>
              <span className="text-orange-300">·</span>
              <span className="text-sm text-slate-500">
                {new Date(dateLabel).toLocaleDateString("en-IN", {
                  weekday: "short", day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </>
          )}
          {!loading && !error && (
            <>
              <span className="text-orange-300">·</span>
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600 border border-orange-200">
                {sortedTrains.length} trains found
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <FilterSidebar />
          </aside>

          {/* Results */}
          <section className="flex min-w-0 flex-col gap-4 lg:col-span-9">
            <ResultsHeaderCard
              loading={loading}
              error={error}
              count={sortedTrains.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
            <TrainResultsCard
              loading={loading}
              error={error}
              trains={sortedTrains}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function parseDurationToMinutes(duration: string) {
  const n = duration.toLowerCase();
  const h = n.match(/(\d+)\s*h/);
  const m = n.match(/(\d+)\s*m/);
  return (h ? Number(h[1]) : 0) * 60 + (m ? Number(m[1]) : 0);
}