"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchPanel() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    class: "Economy",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({
      from: formData.from,
      to: formData.to,
      date: formData.date,
      class: formData.class,
    });
    router.push(`/results?${searchParams.toString()}`);
  };

  return (
    <div className="bg-surface border border-outline-variant p-[var(--spacing-stack-lg)] 3xl:p-10 rounded-xl shadow-sm">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 3xl:grid-cols-12 gap-4 3xl:gap-6 items-end">
        {/* From */}
        <div className="md:col-span-3 3xl:col-span-2">
          <FieldLabel>From</FieldLabel>
          <InputWrap icon="location_on">
            <input
              type="text"
              name="from"
              placeholder="Departure City"
              value={formData.from}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white border border-outline rounded outline-none transition-all text-body-md focus:border-primary"
            />
          </InputWrap>
        </div>

        {/* To */}
        <div className="md:col-span-3 3xl:col-span-2">
          <FieldLabel>To</FieldLabel>
          <InputWrap icon="train">
            <input
              type="text"
              name="to"
              placeholder="Destination City"
              value={formData.to}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white border border-outline rounded outline-none transition-all text-body-md focus:border-primary"
            />
          </InputWrap>
        </div>

        {/* Date */}
        <div className="md:col-span-2 3xl:col-span-2">
          <FieldLabel>Date</FieldLabel>
          <InputWrap icon="calendar_today">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white border border-outline rounded outline-none transition-all text-body-md focus:border-primary"
            />
          </InputWrap>
        </div>

        {/* Class */}
        <div className="md:col-span-2 3xl:col-span-2">
          <FieldLabel>Class</FieldLabel>
          <InputWrap icon="airline_seat_recline_extra">
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-outline rounded outline-none transition-all text-body-md focus:border-primary appearance-none"
            >
              <option>Economy</option>
              <option>Business</option>
              <option>First Class</option>
            </select>
          </InputWrap>
        </div>

        {/* Search Button */}
        <div className="md:col-span-2 3xl:col-span-2">
          <button
            type="submit"
            className="w-full bg-primary text-on-primary rounded text-headline-sm font-semibold py-3 px-0 border-none cursor-pointer hover:opacity-95 active:scale-95 transition-all"
          >
            Search Trains
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Sub-components ── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-label-bold font-bold text-on-surface-variant block mb-2 tracking-wider">
      {children}
    </label>
  );
}

function InputWrap({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span
        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline"
      >
        {icon}
      </span>
      {children}
    </div>
  );
}