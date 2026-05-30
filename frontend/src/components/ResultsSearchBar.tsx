"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DatePicker from "@/components/DatePicker";

const CLASS_OPTIONS = [
  "All Classes",
  "Sleeper (SL)",
  "AC 3 Tier (3A)",
  "AC 2 Tier (2A)",
  "AC First Class (1A)",
  "General (GEN)",
];

export default function ResultsSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [date, setDate] = useState(searchParams.get("date") || todayYMD);
  const [travelClass, setTravelClass] = useState(searchParams.get("class") || "All Classes");

  // Keep in sync if URL changes externally
  useEffect(() => {
    setFrom(searchParams.get("from") || "");
    setTo(searchParams.get("to") || "");
    setDate(searchParams.get("date") || todayYMD);
    setTravelClass(searchParams.get("class") || "All Classes");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      from,
      to,
      date,
      class: travelClass,
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 rounded-2xl border border-secondary/20 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:gap-2"
    >
      {/* From */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          From
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-secondary focus-within:bg-white">
          <span className="material-symbols-outlined shrink-0 text-base text-secondary/70">
            location_on
          </span>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Origin"
            required
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Swap button */}
      <button
        type="button"
        onClick={handleSwap}
        aria-label="Swap stations"
        className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 text-secondary transition hover:bg-secondary/20 sm:mb-0.5"
      >
        <span className="material-symbols-outlined text-base">swap_horiz</span>
      </button>

      {/* To */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          To
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-secondary focus-within:bg-white">
          <span className="material-symbols-outlined shrink-0 text-base text-secondary/70">
            near_me
          </span>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Destination"
            required
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Date */}
      <div className="flex w-full flex-col gap-1 sm:w-44">
        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          Date
        </label>
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Travel date"
          variant="compact"
          className="w-full"
        />
      </div>

      {/* Class */}
      <div className="flex w-full flex-col gap-1 sm:w-40">
        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">
          Class
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-secondary focus-within:bg-white">
          <span className="material-symbols-outlined shrink-0 text-base text-secondary/70">
            airline_seat_recline_normal
          </span>
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
          >
            {CLASS_OPTIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search button */}
      <button
        type="submit"
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-white transition hover:bg-secondary/90 active:scale-95"
      >
        <span className="material-symbols-outlined text-base">search</span>
        Search
      </button>
    </form>
  );
}
