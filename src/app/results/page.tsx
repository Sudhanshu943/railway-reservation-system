"use client";

import SearchRefinement from "@/components/SearchRefinement";
import TrainCard from "@/components/TrainCard";
import FilterSidebar from "@/components/FilterSidebar";
import { trainsData } from "@/data/trains";
import { Suspense } from "react";

export default function SearchResultsPage() {
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
              <p className="text-body-md text-on-surface-variant m-0">
                Showing {trainsData.length} available trains
              </p>
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
            {trainsData.map((train) => (
              <TrainCard key={train.id} {...train} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
