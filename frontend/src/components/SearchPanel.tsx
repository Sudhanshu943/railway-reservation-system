"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DatePicker from "@/components/DatePicker";

export default function SearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [formData, setFormData] = useState({
    from: "New Delhi (NDLS)",
    to: "Mumbai Central (MMCT)",
    date: todayYMD,
    travelClass: "AC 2 Tier (2A)",
    flexibleDate: false,
    withBerth: true,
  });

  // Pre-fill from URL params when on results page
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const cls = searchParams.get("class");
    if (from || to || date || cls) {
      setFormData((prev) => ({
        ...prev,
        from: from || prev.from,
        to: to || prev.to,
        date: date || prev.date,
        travelClass: cls || prev.travelClass,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const params = new URLSearchParams({
      from: formData.from,
      to: formData.to,
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
          <div>
            <FieldLabel>From</FieldLabel>
            <InputShell icon="location_on">
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Departure City"
                required
                className="w-full border-none bg-transparent p-0 text-base leading-6 text-on-surface outline-none"
              />
            </InputShell>
          </div>

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

          <div>
            <FieldLabel>To</FieldLabel>
            <InputShell icon="near_me">
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="Arrival City"
                required
                className="w-full border-none bg-transparent p-0 text-base leading-6 text-on-surface outline-none"
              />
            </InputShell>
          </div>

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-semibold leading-5 tracking-wider text-primary">
      {children}
    </label>
  );
}

function InputShell({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="cyan-focus flex items-center rounded-lg border border-outline bg-surface-container-lowest p-3">
      <span className="material-symbols-outlined mr-2 text-5 text-on-surface-variant">
        {icon}
      </span>
      {children}
    </div>
  );
}