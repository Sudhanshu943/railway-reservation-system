"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/components/modals/ModalProvider";

interface ClassOption {
  code: string;
  price: string;
  availability: string;
  bookable: boolean;
}

interface AvailabilityRow {
  date: string;
  day: string;
  status: string;
  price: string;
  bookable: boolean;
}

interface TrainCardProps {
  id: number;
  train_name?: string;
  train_number?: string;
  source?: string;
  destination?: string;
  departure_time?: string;
  arrival_time?: string;
  duration: string;
  available_seats?: number;
  total_seats?: number;
  price_sleeper?: number;
  price_ac3?: number;
  price_ac2?: number;
  price_ac1?: number;
  price_general?: number;
  days_of_operation?: string;
}

type QuotaTab = "General" | "Tatkal" | "Senior Citizen" | "Ladies";

export default function TrainCard({
  id,
  train_name,
  train_number,
  source,
  destination,
  departure_time,
  arrival_time,
  duration,
  available_seats,
  total_seats,
  price_sleeper,
  price_ac3,
  price_ac2,
  price_ac1,
  price_general,
  days_of_operation,
}: TrainCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useModal();

  const [expanded, setExpanded] = useState(false);
  const [activeQuota, setActiveQuota] = useState<QuotaTab>("General");
  const [activeClass, setActiveClass] = useState<string>("SL");

  const trainName = train_name || "Unknown Train";
  const trainNumber = train_number || "N/A";
  const fromStation = source || "Unknown";
  const toStation = destination || "Unknown";
  const depTime = departure_time || "00:00";
  const arrTime = arrival_time || "00:00";
  const runDays = days_of_operation || "Unknown";

  let trainStatus: "available" | "limited" | "soldout" = "available";

  if (available_seats !== undefined && total_seats !== undefined) {
    if (available_seats === 0) trainStatus = "soldout";
    else if (available_seats < total_seats * 0.3) trainStatus = "limited";
    else trainStatus = "available";
  }

  const statusStyles = {
    available: "bg-green-50 text-green-700 border border-green-200",
    limited: "bg-amber-50 text-amber-700 border border-amber-200",
    soldout: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  const fareOptions = useMemo(() => {
    // Derive availability label from actual available_seats
    const seatsLabel = (available_seats ?? 0) > 0
      ? `${available_seats} seats`
      : "Sold Out";
    const isBookable = !!(available_seats && available_seats > 0);

    const backendFares = [
      price_sleeper !== undefined && price_sleeper > 0
        ? { code: "SL", price: `₹${price_sleeper.toLocaleString()}`, availability: seatsLabel, bookable: isBookable }
        : null,
      price_ac3 !== undefined && price_ac3 > 0
        ? { code: "3A", price: `₹${price_ac3.toLocaleString()}`, availability: seatsLabel, bookable: isBookable }
        : null,
      price_ac2 !== undefined && price_ac2 > 0
        ? { code: "2A", price: `₹${price_ac2.toLocaleString()}`, availability: seatsLabel, bookable: isBookable }
        : null,
      price_ac1 !== undefined && price_ac1 > 0
        ? { code: "1A", price: `₹${price_ac1.toLocaleString()}`, availability: seatsLabel, bookable: isBookable }
        : null,
      price_general !== undefined && price_general > 0
        ? { code: "GEN", price: `₹${price_general.toLocaleString()}`, availability: "No reservation", bookable: false }
        : null,
    ].filter(Boolean) as ClassOption[];

    return backendFares;
  }, [price_sleeper, price_ac3, price_ac2, price_ac1, price_general, available_seats]);

  // Generate real upcoming dates from the search date param
  const availabilityRows = useMemo(() => {
    const basePrice = fareOptions.find((item) => item.code === activeClass)?.price || "";
    const isBookable = !!(available_seats && available_seats > 0);
    const seatsLabel = isBookable ? `${available_seats} avail` : "Sold Out";

    const searchDate = searchParams.get("date");
    const startDate = searchDate ? new Date(searchDate) : new Date();
    startDate.setHours(0, 0, 0, 0);

    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        date: `${String(d.getDate()).padStart(2, "0")} ${monthNames[d.getMonth()]}`,
        day: dayNames[d.getDay()],
        status: seatsLabel,
        price: basePrice,
        bookable: isBookable,
        ymd: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      };
    }) as (AvailabilityRow & { ymd: string })[];
  }, [fareOptions, activeClass, available_seats, searchParams]);

   const handleBooking = (seatClass: string, bookable: boolean, rowDate?: string) => {
     if (!bookable) return;
     if (!isLoggedIn) {
       openLoginModal();
       return;
     }
     const date = rowDate || searchParams.get("date") || "";
     const dateParam = date ? `&date=${date}` : "";
     router.push(`/booking/${id}?class=${seatClass}&quota=${activeQuota}${dateParam}`);
   };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                {trainName}
              </h3>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {trainNumber}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[trainStatus]}`}>
                {trainStatus === "available" ? "Available" : trainStatus === "limited" ? "Limited" : "Sold Out"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Runs on: {runDays}</p>
          </div>

          <div className="grid grid-cols-3 items-center gap-4 sm:gap-8 lg:min-w-90">
            <div className="text-left">
              <p className="text-lg font-semibold text-slate-900 sm:text-xl">{depTime}</p>
              <p className="text-xs text-slate-500 sm:text-sm">{fromStation}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-500">{duration}</p>
              <div className="mt-2 h-px bg-slate-200" />
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900 sm:text-xl">{arrTime}</p>
              <p className="text-xs text-slate-500 sm:text-sm">{toStation}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {fareOptions.map((option, index) => (
            <button
              key={`${option.code}-${index}`}
              type="button"
              onClick={() => { setActiveClass(option.code); setExpanded(true); }}
              className={`rounded-xl border p-3 text-left transition-all ${
                activeClass === option.code
                  ? "border-secondary bg-secondary/10"
                  : option.bookable
                  ? "border-slate-200 bg-slate-50 hover:border-secondary/40"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">{option.code}</span>
                <span className="text-sm font-bold text-slate-900">{option.price}</span>
              </div>
              <p className={`mt-2 text-xs sm:text-sm ${option.bookable ? "text-secondary" : "text-slate-400"}`}>
                {option.availability}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Selected: <span className="font-semibold text-slate-900">{activeClass}</span>
          </p>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary/20"
          >
            {expanded ? "Hide availability" : "View availability"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {(["General", "Tatkal", "Senior Citizen", "Ladies"] as QuotaTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveQuota(tab)}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${
                  activeQuota === tab
                    ? "bg-secondary text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-secondary/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 sm:grid">
              <div>Date</div>
              <div>Availability</div>
              <div>Action</div>
            </div>
            <div className="divide-y divide-slate-100">
              {availabilityRows.map((row, index) => (
                <div key={`${row.date}-${index}`} className="grid gap-3 px-4 py-4 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.date}</p>
                    <p className="text-xs text-slate-500">{row.day}</p>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${row.bookable ? "text-green-600" : "text-red-500"}`}>{row.status}</p>
                    <p className="text-xs text-slate-500">{activeQuota}</p>
                  </div>
                  <div className="sm:text-right">
                    <button
                      type="button"
                      onClick={() => handleBooking(activeClass, row.bookable, (row as typeof row & { ymd: string }).ymd)}
                      disabled={!row.bookable}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto ${
                        row.bookable
                          ? "bg-secondary text-white hover:bg-secondary/90"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {row.bookable ? `Book ${row.price}` : "Unavailable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}