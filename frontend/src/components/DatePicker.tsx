"use client";

import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  /** "default" uses the glass-panel InputShell style; "compact" matches flat search bars */
  variant?: "default" | "compact";
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(ymd: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  variant = "default",
  error,
}: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayYMD = toYMD(today);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    value ? Number(value.split("-")[0]) : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    value ? Number(value.split("-")[1]) - 1 : today.getMonth()
  );

  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      setViewYear(Number(value.split("-")[0]));
      setViewMonth(Number(value.split("-")[1]) - 1);
    }
  }, [value]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function selectDay(day: number) {
    const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (ymd < todayYMD) return; // blocked
    onChange(ymd);
    setOpen(false);
  }

  function isPast(day: number) {
    const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return ymd < todayYMD;
  }

  function isToday(day: number) {
    const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return ymd === todayYMD;
  }

  function isSelected(day: number) {
    const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return ymd === value;
  }

  // Disable prev-month nav if already at current month
  const atMinMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-2 text-left transition focus:outline-none
          ${variant === "compact"
            ? `rounded-lg border px-3 py-2 ${error ? "border-red-400 bg-white" : "border-slate-200 bg-orange-50/40 hover:border-orange-400 hover:bg-white"}`
            : `rounded-lg border p-3 ${error ? "border-red-400 bg-white" : "border-outline bg-surface-container-lowest hover:border-primary"}`
          }`}
      >
        <span className={`material-symbols-outlined text-xl ${variant === "compact" ? (error ? "text-red-500" : "text-orange-400") : "text-on-surface-variant"}`}>
          calendar_month
        </span>
        <span className={`flex-1 leading-6 ${variant === "compact" ? "text-sm" : "text-base"} ${value ? "text-slate-900" : "text-slate-400"}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <span className={`material-symbols-outlined text-base ${error ? "text-red-500" : "text-slate-400"} transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-100 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          {/* Month/Year header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={atMinMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            <p className="text-sm font-bold text-slate-900">
              {MONTHS[viewMonth]} {viewYear}
            </p>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DAYS.map((d) => (
              <div key={d} className="py-1 text-xs font-semibold text-slate-400">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const past = isPast(day);
              const today_ = isToday(day);
              const selected = isSelected(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  disabled={past}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition
                    ${past ? "cursor-not-allowed text-slate-300" : ""}
                    ${!past && !selected ? "text-slate-700 hover:bg-orange-50 hover:text-orange-600" : ""}
                    ${today_ && !selected ? "ring-1 ring-orange-400 text-orange-600" : ""}
                    ${selected ? "bg-orange-500 text-white shadow-sm" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-3 border-t border-slate-100 pt-3 text-center">
            <button
              type="button"
              onClick={() => { onChange(todayYMD); setOpen(false); }}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
