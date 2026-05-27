"use client";

import SearchRefinement from "@/components/SearchRefinement";
import TrainCard from "@/components/TrainCard";
import FilterSidebar from "@/components/FilterSidebar";
import { Suspense, useState, useEffect } from "react";
import { trainsAPI } from "@/lib/api";

export default function SearchResultsPage() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const data = await trainsAPI.getAll();
        setTrains(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching trains:', err);
        setError('Failed to load trains');
        setTrains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, []);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchRefinement />
      </Suspense>

      {/* Filter and Results Section */}
      <div className="max-w-container-max-width 3xl:max-w-[1600px] mx-auto px-6 py-(--spacing-stack-lg) 3xl:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-(--spacing-stack-lg) 3xl:gap-8">
          {/* Side Filters */}
          <FilterSidebar />

          {/* Results List */}
          <div className="md:col-span-9 flex flex-col gap-[var(--spacing-stack-md)] 3xl:gap-6">
            <div className="flex justify-between items-center mb-[var(--spacing-stack-sm)]">
              {loading ? (
                <p className="text-body-md text-on-surface-variant m-0">Loading trains...</p>
              ) : error ? (
                <p className="text-body-md text-red-500 m-0">{error}</p>
              ) : (
                <p className="text-body-md text-on-surface-variant m-0">
                  Showing {trains.length} available trains
                </p>
              )}
              <div className="flex items-center gap-[var(--spacing-stack-sm)]">
                <span className="text-label-md text-on-surface-variant">Sort by:</span>
                <select className="bg-transparent border-none text-label-bold font-bold text-primary cursor-pointer outline-none">
                  <option>Earliest Departure</option>
                  <option>Lowest Price</option>
                  <option>Shortest Duration</option>
                </select>
              </div>
            </div>

            {/* Train Cards */}
            {loading ? (
              <div className="text-center py-8">Loading trains...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : trains.length > 0 ? (
              trains.map((train) => (
                <TrainCard key={train.id} {...train} />
              ))
            ) : (
              <div className="text-center py-8">No trains found</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
