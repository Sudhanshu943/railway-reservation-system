"use client";

import { Suspense } from "react";
import ResultsSearchBar from "@/components/ResultsSearchBar";
import FilterSidebar from "@/components/FilterSidebar";
import ResultsHeaderCard from "@/components/resultCards/ResultsHeaderCard";
import TrainResultsCard from "@/components/resultCards/TrainResultsCard";
import { useEffect, useMemo, useState } from "react";
import { trainsAPI } from "@/lib/api";
import { Train } from "@/data/trains";
import { useSearchParams } from "next/navigation";

type SortOption = "Earliest Departure" | "Lowest Price" | "Shortest Duration";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("Earliest Departure");

  const from = normalizeStationInput(searchParams.get("from") || "");
  const to = normalizeStationInput(searchParams.get("to") || "");
  const hasRouteSearch = Boolean(from && to);

  useEffect(() => {
    const fetchTrains = async () => {
      if (!hasRouteSearch) {
        setTrains([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const searchDate = searchParams.get("date") || undefined;
        const data = await trainsAPI.search(from, to, searchDate);
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
  }, [from, to, hasRouteSearch]);

  const sortedTrains = useMemo(() => {
    const list = [...trains];
    if (sortBy === "Lowest Price") {
      return list.sort((a, b) => {
        const aP = getLowestFare(a);
        const bP = getLowestFare(b);
        return aP - bP;
      });
    }
    if (sortBy === "Shortest Duration") {
      return list.sort((a, b) => parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration));
    }
    return list.sort((a, b) => (a.departure_time ?? "").localeCompare(b.departure_time ?? ""));
  }, [trains, sortBy]);

  const routeLabel = hasRouteSearch ? `${from} to ${to}` : "Search a route";
  const dateLabel = searchParams.get("date") || "";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-secondary/20 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-7xl">
          <ResultsSearchBar />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-orange-600">{routeLabel}</span>
          {dateLabel && (
            <>
              <span className="text-orange-300">/</span>
              <span className="text-sm text-slate-500">
                {new Date(dateLabel).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </>
          )}
          {hasRouteSearch && !loading && !error && (
            <>
              <span className="text-orange-300">/</span>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
                {sortedTrains.length} trains found
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <FilterSidebar />
          </aside>

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

export default function SearchResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}

function parseDurationToMinutes(duration: string) {
  const n = duration.toLowerCase();
  const h = n.match(/(\d+)\s*h/);
  const m = n.match(/(\d+)\s*m/);
  return (h ? Number(h[1]) : 0) * 60 + (m ? Number(m[1]) : 0);
}

function normalizeStationInput(value: string) {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function getLowestFare(train: Train) {
  const fares = [
    train.price_sleeper,
    train.price_ac3,
    train.price_ac2,
    train.price_ac1,
    train.price_general,
  ].filter((fare) => fare > 0);

  return fares.length ? Math.min(...fares) : Number.MAX_SAFE_INTEGER;
}