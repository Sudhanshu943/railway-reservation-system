"use client";

import { Suspense } from "react";
import SearchPanel from "@/components/SearchPanel";

export default function HeroSection() {
  return (
    <section className="hero-gradient relative px-4 py-14 md:px-6 md:py-20 3xl:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
            <span className="material-symbols-outlined text-[18px] text-primary">
              verified_user
            </span>
            IRCTC Authorized Partner
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-primary md:text-6xl">
            Smarter train booking for modern rail travel.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">
            Search routes faster, compare options clearly, and book your journey
            with confidence across India.
          </p>
        </div>

        <div className="relative z-20 mx-auto max-w-6xl">
          <Suspense>
            <SearchPanel />
          </Suspense>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure booking flow
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Transparent pricing
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Fast search and live status
          </div>
        </div>
      </div>
    </section>
  );
}