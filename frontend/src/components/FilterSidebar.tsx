"use client";

import { useState } from "react";

const DEPARTURE_SLOTS = [
  { label: "Early Morning", sub: "12am – 6am", icon: "bedtime" },
  { label: "Morning", sub: "6am – 12pm", icon: "wb_sunny" },
  { label: "Afternoon", sub: "12pm – 6pm", icon: "partly_cloudy_day" },
  { label: "Night", sub: "6pm – 12am", icon: "nights_stay" },
];

const TRAIN_TYPES = ["Rajdhani", "Shatabdi", "Duronto", "Express", "Superfast", "Garib Rath"];

export default function FilterSidebar() {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [acOnly, setAcOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const toggleSlot = (label: string) =>
    setSelectedSlots((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );

  const toggleType = (type: string) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );

  const hasFilters = selectedSlots.length > 0 || selectedTypes.length > 0 || acOnly || availableOnly;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-secondary">tune</span>
          <p className="text-sm font-bold text-slate-900">Filters</p>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSelectedSlots([]);
              setSelectedTypes([]);
              setAcOnly(false);
              setAvailableOnly(false);
            }}
            className="text-xs font-semibold text-secondary hover:text-secondary"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Quick filters */}
      <div className="rounded-2xl border border-secondary/20 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
          Quick Filters
        </p>
        <div className="flex flex-col gap-2.5">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={acOnly}
              onChange={(e) => setAcOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-secondary"
            />
            <span className="text-sm text-slate-700">AC Coaches Only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-secondary"
            />
            <span className="text-sm text-slate-700">Available Seats Only</span>
          </label>
        </div>
      </div>

      {/* Departure time */}
      <div className="rounded-2xl border border-secondary/20 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
          Departure Time
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEPARTURE_SLOTS.map(({ label, sub, icon }) => {
            const active = selectedSlots.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleSlot(label)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition
                  ${active
                    ? "border-secondary/40 bg-secondary/10 text-secondary"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-secondary/30 hover:bg-secondary/5"
                  }`}
              >
                <span className={`material-symbols-outlined text-xl ${active ? "text-secondary" : "text-slate-400"}`}>{icon}</span>
                <span className="text-xs font-semibold leading-tight">{label}</span>
                <span className="text-[10px] text-slate-400">{sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Train type */}
      <div className="rounded-2xl border border-secondary/20 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
          Train Type
        </p>
        <div className="flex flex-wrap gap-2">
          {TRAIN_TYPES.map((type) => {
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition
                  ${active
                    ? "border-secondary/40 bg-secondary/100 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-secondary/30 hover:bg-secondary/10"
                  }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Premium lounge banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-secondary to-secondary/80 p-4 text-white shadow-sm">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-200">
            Exclusive
          </p>
          <p className="mt-1 text-sm font-bold">Premium Lounge Access</p>
          <p className="mt-1 text-xs text-orange-100">
            Upgrade your journey with first-class lounge benefits.
          </p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
          >
            Learn more
          </button>
        </div>
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
