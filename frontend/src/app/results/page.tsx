"use client";

import FilterSidebar from "@/components/FilterSidebar";
import SearchPanel from "@/components/SearchPanel";
import ResultsHeaderCard from "@/components/resultCards/ResultsHeaderCard";
import TrainResultsCard from "@/components/resultCards/TrainResultsCard";
import { useEffect, useMemo, useState } from "react";
import { trainsAPI } from "@/lib/api";
import { Train } from "@/data/trains";

type SortOption =
  | "Earliest Departure"
  | "Lowest Price"
  | "Shortest Duration";

export default function SearchResultsPage() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("Earliest Departure");

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await trainsAPI.getAll();
        setTrains(data);
      } catch (err) {
        console.error("Error fetching trains:", err);
        setError("Failed to load trains.");
        setTrains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  const sortedTrains = useMemo(() => {
    const trainList = [...trains];

    if (sortBy === "Lowest Price") {
      return trainList.sort((a, b) => {
        const aPrice =
          a.price_ac2 ??
          a.price_ac3 ??
          a.price_sleeper ??
          Number.MAX_SAFE_INTEGER;
        const bPrice =
          b.price_ac2 ??
          b.price_ac3 ??
          b.price_sleeper ??
          Number.MAX_SAFE_INTEGER;
        return aPrice - bPrice;
      });
    }

    if (sortBy === "Shortest Duration") {
      return trainList.sort((a, b) => {
        const aDuration = parseDurationToMinutes(a.duration);
        const bDuration = parseDurationToMinutes(b.duration);
        return aDuration - bDuration;
      });
    }

    return trainList.sort((a, b) => {
      const aTime = normalizeTime(a.departure_time);
      const bTime = normalizeTime(b.departure_time);
      return aTime.localeCompare(bTime);
    });
  }, [trains, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 3xl:max-w-[1600px]">
      <div className="mb-8">
        <SearchPanel />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <aside className="md:col-span-3">
          <FilterSidebar />
        </aside>

        <section className="flex min-w-0 flex-col gap-4 md:col-span-9 3xl:gap-6">
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
  );
}

function parseDurationToMinutes(duration: string) {
  const normalized = duration.toLowerCase();
  const hours = normalized.match(/(\d+)\s*h/);
  const minutes = normalized.match(/(\d+)\s*m/);

  const h = hours ? Number(hours[1]) : 0;
  const m = minutes ? Number(minutes[1]) : 0;

  return h * 60 + m;
}

function normalizeTime(time: string) {
  return time?.trim() ?? "";
}