"use client";

import { useMemo, useState } from "react";
import { loadStationSuggestions } from "@/lib/api";

type StationList = "sources" | "destinations";
type Variant = "home" | "results";

interface StationAutocompleteProps {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  stationList: StationList;
  variant?: Variant;
}

export default function StationAutocomplete({
  label,
  icon,
  value,
  onChange,
  placeholder,
  stationList,
  variant = "home",
}: StationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredStations = useMemo(() => {
    const query = normalizeStationInput(value).toLowerCase();
    const matches = query
      ? stations.filter((station) => station.toLowerCase().includes(query))
      : stations;

    return matches.slice(0, 8);
  }, [stations, value]);

  const loadSuggestions = () => {
    setOpen(true);
    if (stations.length || loading) return;

    setLoading(true);
    loadStationSuggestions()
      .then((data) => {
        setStations(data[stationList]);
      })
      .catch(() => {
        setStations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const compact = variant === "results";

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-1">
      <label
        className={
          compact
            ? "text-[10px] font-bold uppercase tracking-widest text-secondary"
            : "mb-1 block text-sm font-semibold leading-5 tracking-wider text-primary"
        }
      >
        {label}
      </label>

      <div
        className={
          compact
            ? "flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-secondary focus-within:bg-white"
            : "cyan-focus flex items-center rounded-lg border border-outline bg-surface-container-lowest p-3"
        }
      >
        <span
          className={
            compact
              ? "material-symbols-outlined shrink-0 text-base text-secondary/70"
              : "material-symbols-outlined mr-2 text-5 text-on-surface-variant"
          }
        >
          {icon}
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            loadSuggestions();
          }}
          onFocus={loadSuggestions}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          required
          className={
            compact
              ? "min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              : "w-full border-none bg-transparent p-0 text-base leading-6 text-on-surface outline-none"
          }
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_18px_45px_rgb(8_19_42/0.14)]">
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant">
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
              Loading stations...
            </div>
          ) : filteredStations.length > 0 ? (
            <div className="max-h-72 overflow-y-auto py-1">
              {filteredStations.map((station) => (
                <button
                  key={station}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(station);
                    setOpen(false);
                  }}
                  className="group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-secondary/10 focus:bg-secondary/10 focus:outline-none"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low text-primary transition group-hover:border-secondary/30 group-hover:bg-white group-hover:text-secondary">
                    <span className="material-symbols-outlined text-[18px]">train</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-on-surface">
                      {station}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                      Use exactly: {station}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface-variant">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary">
                <span className="material-symbols-outlined text-[18px]">search_off</span>
              </span>
              No matching station found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function normalizeStationInput(value: string) {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}
