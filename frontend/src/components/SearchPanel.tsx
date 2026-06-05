"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import DatePicker from "@/components/DatePicker";
import StationAutocomplete from "@/components/StationAutocomplete";

export default function SearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState(() => ({
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    date: searchParams.get("date") || "",
    travelClass: searchParams.get("class") || "AC 2 Tier (2A)",
    flexibleDate: false,
    withBerth: true,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : value,
    }));
  };

  const handleSwap = () => {
    setFormData((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const from = normalizeStationInput(formData.from);
    const to = normalizeStationInput(formData.to);

    const params = new URLSearchParams({
      from,
      to,
      date: formData.date,
      class: formData.travelClass,
      flexibleDate: String(formData.flexibleDate),
      withBerth: String(formData.withBerth),
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="glass-panel p-6">
      <form onSubmit={handleSearch} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_auto_1.2fr_0.9fr_auto] xl:items-end">
          <StationAutocomplete
            label="From"
            icon="location_on"
            value={formData.from}
            onChange={(from) => setFormData((prev) => ({ ...prev, from }))}
            placeholder="Departure City"
            stationList="sources"
          />

          <div className="flex justify-center xl:pb-0.5">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap origin and destination"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-primary shadow-sm transition-all hover:bg-primary-fixed active:scale-95"
            >
              <span className="material-symbols-outlined text-5">swap_horiz</span>
            </button>
          </div>

          <StationAutocomplete
            label="To"
            icon="near_me"
            value={formData.to}
            onChange={(to) => setFormData((prev) => ({ ...prev, to }))}
            placeholder="Arrival City"
            stationList="destinations"
          />

          <div>
            <FieldLabel>Date</FieldLabel>
            <DatePicker
              value={formData.date}
              onChange={(d) => setFormData((prev) => ({ ...prev, date: d }))}
              placeholder="Select travel date"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-secondary px-6 py-3.5 text-base font-semibold text-white transition-all hover:opacity-95 active:scale-95 xl:w-auto"
          >
            Search Trains
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="flexibleDate"
              checked={formData.flexibleDate}
              onChange={handleChange}
              className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
            />
            <span className="text-sm leading-5 text-on-surface-variant">
              Flexible with Date
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="withBerth"
              checked={formData.withBerth}
              onChange={handleChange}
              className="h-4 w-4 rounded border-outline text-primary focus:ring-primary"
            />
            <span className="text-sm leading-5 text-on-surface-variant">
              Train with Berth
            </span>
          </label>
        </div>
      </form>
    </div>
  );
}

function normalizeStationInput(value: string) {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-semibold leading-5 tracking-wider text-primary">
      {children}
    </label>
  );
}
