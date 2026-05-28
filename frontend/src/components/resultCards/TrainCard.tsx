"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
  name?: string;
  number?: string;
  runsOn?: string;
  departure?: string;
  departureStation?: string;
  arrival?: string;
  arrivalStation?: string;
  status?: "available" | "limited" | "soldout";
  classes?: ClassOption[];
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
  name,
  number,
  runsOn,
  departure,
  departureStation,
  arrival,
  arrivalStation,
  status,
  classes,
}: TrainCardProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [activeQuota, setActiveQuota] = useState<QuotaTab>("General");
  const [activeClass, setActiveClass] = useState<string>("SL");

  const trainName = train_name || name || "Unknown Train";
  const trainNumber = train_number || number || "N/A";
  const fromStation = source || departureStation || "Unknown";
  const toStation = destination || arrivalStation || "Unknown";
  const depTime = departure_time || departure || "00:00";
  const arrTime = arrival_time || arrival || "00:00";
  const runDays = days_of_operation || runsOn || "Unknown";

  let trainStatus: "available" | "limited" | "soldout" = status || "available";

  if (available_seats !== undefined && total_seats !== undefined) {
    if (available_seats === 0) trainStatus = "soldout";
    else if (available_seats < total_seats * 0.3) trainStatus = "limited";
    else trainStatus = "available";
  }

  const statusStyles = {
    available: "bg-orange-50 text-orange-700 border border-orange-200",
    limited: "bg-amber-50 text-amber-700 border border-amber-200",
    soldout: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  const fareOptions = useMemo(() => {
    const backendFares = [
      price_sleeper !== undefined && price_sleeper > 0
        ? {
            code: "SL",
            price: `₹${price_sleeper.toLocaleString()}`,
            availability:
              available_seats && available_seats > 0 ? "WL 58" : "Sold Out",
            bookable: !!(available_seats && available_seats > 0),
          }
        : null,
      price_ac3 !== undefined
        ? {
            code: "3A",
            price: `₹${price_ac3.toLocaleString()}`,
            availability:
              available_seats && available_seats > 0 ? "WL 42" : "Sold Out",
            bookable: !!(available_seats && available_seats > 0),
          }
        : null,
      price_ac2 !== undefined
        ? {
            code: "2A",
            price: `₹${price_ac2.toLocaleString()}`,
            availability:
              available_seats && available_seats > 0 ? "WL 30" : "Sold Out",
            bookable: !!(available_seats && available_seats > 0),
          }
        : null,
      price_ac1 !== undefined
        ? {
            code: "1A",
            price: `₹${price_ac1.toLocaleString()}`,
            availability:
              available_seats && available_seats > 0 ? "WL 6" : "Sold Out",
            bookable: !!(available_seats && available_seats > 0),
          }
        : null,
      price_general !== undefined && price_general > 0
        ? {
            code: "GEN",
            price: `₹${price_general.toLocaleString()}`,
            availability: "General",
            bookable: false,
          }
        : null,
    ].filter(Boolean) as ClassOption[];

    return backendFares.length > 0 ? backendFares : classes || [];
  }, [
    price_sleeper,
    price_ac3,
    price_ac2,
    price_ac1,
    price_general,
    available_seats,
    classes,
  ]);

  const availabilityRows = useMemo(() => {
    const basePrice =
      fareOptions.find((item) => item.code === activeClass)?.price || "₹655";

    return [
      { date: "01 Jun", day: "Mon", status: "WL 58", price: basePrice, bookable: true },
      { date: "02 Jun", day: "Tue", status: "WL 59", price: basePrice, bookable: true },
      { date: "03 Jun", day: "Wed", status: "WL 60", price: basePrice, bookable: true },
      { date: "04 Jun", day: "Thu", status: "WL 50", price: basePrice, bookable: true },
      { date: "05 Jun", day: "Fri", status: "WL 55", price: basePrice, bookable: true },
      { date: "06 Jun", day: "Sat", status: "WL 54", price: basePrice, bookable: true },
    ] as AvailabilityRow[];
  }, [fareOptions, activeClass]);

  const handleBooking = (seatClass: string, bookable: boolean) => {
    if (!bookable) return;

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    router.push(`/booking/${id}?class=${seatClass}&quota=${activeQuota}`);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-orange-200">
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
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[trainStatus]}`}
              >
                {trainStatus === "available"
                  ? "Available"
                  : trainStatus === "limited"
                  ? "Limited"
                  : "Sold Out"}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Runs on: {runDays}
            </p>
          </div>

          <div className="grid grid-cols-3 items-center gap-4 sm:gap-8 lg:min-w-[360px]">
            <div className="text-left">
              <p className="text-lg font-semibold text-slate-900 sm:text-xl">
                {depTime}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">{fromStation}</p>
            </div>

            <div className="text-center">
              <p className="text-xs font-medium text-slate-500">{duration}</p>
              <div className="mt-2 h-px bg-slate-200" />
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900 sm:text-xl">
                {arrTime}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">{toStation}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {fareOptions.map((option, index) => (
            <button
              key={`${option.code}-${index}`}
              type="button"
              onClick={() => {
                setActiveClass(option.code);
                setExpanded(true);
              }}
              className={`rounded-xl border p-3 text-left transition-all ${
                activeClass === option.code
                  ? "border-orange-300 bg-orange-50"
                  : option.bookable
                  ? "border-orange-100 bg-orange-50/50 hover:border-orange-200"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {option.code}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {option.price}
                </span>
              </div>

              <p
                className={`mt-2 text-xs sm:text-sm ${
                  option.bookable ? "text-orange-700" : "text-slate-500"
                }`}
              >
                {option.availability}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Selected class: <span className="font-medium text-slate-900">{activeClass}</span>
          </p>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
          >
            {expanded ? "Hide availability" : "View availability"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {(["General", "Tatkal", "Senior Citizen", "Ladies"] as QuotaTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveQuota(tab)}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition ${
                    activeQuota === tab
                      ? "bg-orange-500 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-orange-200"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 sm:grid">
              <div>Date</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            <div className="divide-y divide-slate-100">
              {availabilityRows.map((row, index) => (
                <div
                  key={`${row.date}-${index}`}
                  className="grid gap-3 px-4 py-4 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.date}</p>
                    <p className="text-xs text-slate-500">{row.day}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-orange-700">{row.status}</p>
                    <p className="text-xs text-slate-500">{activeQuota}</p>
                  </div>

                  <div className="sm:text-right">
                    <button
                      type="button"
                      onClick={() => handleBooking(activeClass, row.bookable)}
                      disabled={!row.bookable}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium sm:w-auto ${
                        row.bookable
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Book {row.price}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              type="button"
              className="text-sm font-medium text-orange-700 hover:text-orange-800"
            >
              Check more dates
            </button>
          </div>
        </div>
      )}
    </article>
  );
}