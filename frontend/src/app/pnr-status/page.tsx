"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { bookingsAPI, BookingResponse } from "@/lib/api";

const CLASS_LABELS: Record<string, string> = {
  SLEEPER: "Sleeper (SL)",
  AC_3: "AC 3 Tier (3A)",
  AC_2: "AC 2 Tier (2A)",
  AC_1: "AC First Class (1A)",
  GENERAL: "General (GEN)",
};

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  CONFIRMED: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: "check_circle" },
  CANCELLED: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: "cancel" },
  PENDING: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: "schedule" },
  WAITLISTED: { bg: "bg-slate-100 border-slate-200", text: "text-slate-600", icon: "hourglass_empty" },
};

export default function PNRStatusPage() {
  const searchParams = useSearchParams();
  const [pnrInput, setPnrInput] = useState("");
  const [result, setResult] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if ?pnr= is in the URL (e.g. coming from booking confirmation)
  useEffect(() => {
    const pnrParam = searchParams.get("pnr");
    if (pnrParam) {
      setPnrInput(pnrParam.toUpperCase());
      runSearch(pnrParam.toUpperCase());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = async (pnr: string) => {
    if (!pnr) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);
    try {
      const data = await bookingsAPI.checkPNR(pnr);
      setResult(data);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 404) {
        setError("No booking found for this PNR. Please check and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(pnrInput.trim().toUpperCase());
  };

  const statusStyle = result
    ? STATUS_STYLES[result.status] ?? STATUS_STYLES.PENDING
    : null;

  const formattedJourneyDate = result
    ? new Date(result.journey_date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const bookedOn = result
    ? new Date(result.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
          <span className="material-symbols-outlined text-3xl text-orange-500">
            confirmation_number
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">PNR Status</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your 10-character PNR number to check booking status
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
              search
            </span>
            <input
              type="text"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD34EF"
              maxLength={10}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 font-mono text-base tracking-widest text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || pnrInput.trim().length === 0}
            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="text-sm text-slate-500">Fetching booking details...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <span className="material-symbols-outlined text-xl text-red-500">
            error
          </span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* No result yet */}
      {!loading && !error && !result && !searched && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <span className="material-symbols-outlined mb-3 text-5xl text-slate-200">
            receipt_long
          </span>
          <p className="text-sm text-slate-500">
            Your booking details will appear here
          </p>
        </div>
      )}

      {/* Result card */}
      {!loading && result && statusStyle && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Status banner */}
          <div className={`flex items-center gap-3 border-b px-5 py-4 ${statusStyle.bg}`}>
            <span className={`material-symbols-outlined text-2xl ${statusStyle.text}`}>
              {STATUS_STYLES[result.status]?.icon ?? "info"}
            </span>
            <div>
              <p className={`font-bold ${statusStyle.text}`}>
                Booking {result.status}
              </p>
              <p className={`text-xs ${statusStyle.text} opacity-80`}>
                PNR: {result.pnr}
              </p>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Train info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                <span className="material-symbols-outlined text-xl text-orange-500">
                  train
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {result.train.train_name}
                </p>
                <p className="text-xs text-slate-500">{result.train.train_number}</p>
              </div>
            </div>

            {/* Route */}
            <div className="grid grid-cols-3 items-center gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {result.train.departure_time}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {result.train.source}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">{result.train.duration}</p>
                <div className="relative mt-1 flex items-center">
                  <div className="h-px flex-1 bg-slate-300" />
                  <span className="material-symbols-outlined mx-1 text-sm text-orange-400">
                    arrow_forward
                  </span>
                  <div className="h-px flex-1 bg-slate-300" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">
                  {result.train.arrival_time}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {result.train.destination}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500 mb-1">Journey Date</p>
                <p className="font-semibold text-slate-900">{formattedJourneyDate}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500 mb-1">Class</p>
                <p className="font-semibold text-slate-900">
                  {CLASS_LABELS[result.seat_class] ?? result.seat_class}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500 mb-1">Passengers</p>
                <p className="font-semibold text-slate-900">{result.num_passengers}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500 mb-1">Total Fare</p>
                <p className="font-semibold text-orange-600">
                  ₹{result.total_fare.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500 mb-1">Booked On</p>
                <p className="font-semibold text-slate-900">{bookedOn}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500 mb-1">Booked By</p>
                <p className="font-semibold text-slate-900 truncate">
                  {result.user.name}
                </p>
              </div>
            </div>

            {/* Passenger names */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Passenger Details
              </p>
              <p className="text-sm text-slate-700">{result.passenger_names}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-center">
            <p className="text-xs text-slate-400">
              For assistance, contact Indian Railways helpline: 139
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
