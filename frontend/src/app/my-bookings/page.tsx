"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { bookingsAPI, BookingResponse } from "@/lib/api";

const CLASS_LABELS: Record<string, string> = {
  SLEEPER: "Sleeper (SL)",
  AC_3: "AC 3 Tier (3A)",
  AC_2: "AC 2 Tier (2A)",
  AC_1: "AC First Class (1A)",
  GENERAL: "General (GEN)",
};

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  WAITLISTED: "bg-slate-100 text-slate-600 border-slate-200",
};

function isUpcoming(journeyDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(journeyDate) >= today;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await bookingsAPI.getMyBookings();
        // Sort newest first
        data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setBookings(data);
      } catch {
        addToast("Failed to load bookings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isLoggedIn, addToast]);

  const handleCancel = async (booking: BookingResponse) => {
    if (!confirm(`Cancel booking PNR ${booking.pnr}? This cannot be undone.`))
      return;
    setCancellingId(booking.id);
    try {
      await bookingsAPI.cancel(booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "CANCELLED" } : b
        )
      );
      addToast(`Booking ${booking.pnr} cancelled`, "success");
    } catch {
      addToast("Cancellation failed. Please try again.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status !== "CANCELLED" && isUpcoming(b.journey_date)
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "CANCELLED" || !isUpcoming(b.journey_date)
  );
  const displayed = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="text-sm text-slate-500">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {user?.name}. Here are all your train journeys.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Bookings</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-700">{upcomingBookings.length}</p>
          <p className="text-xs text-green-600 mt-0.5">Upcoming Trips</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">
            ₹{bookings
              .filter((b) => b.status === "CONFIRMED")
              .reduce((sum, b) => sum + b.total_fare, 0)
              .toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total Spent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        {(["upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "upcoming"
              ? `Upcoming (${upcomingBookings.length})`
              : `Past & Cancelled (${pastBookings.length})`}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <span className="material-symbols-outlined mb-3 text-5xl text-slate-300">
            {activeTab === "upcoming" ? "train" : "history"}
          </span>
          <p className="font-semibold text-slate-700">
            {activeTab === "upcoming"
              ? "No upcoming trips"
              : "No past bookings"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === "upcoming"
              ? "Book a train to get started."
              : "Your completed and cancelled trips will appear here."}
          </p>
          {activeTab === "upcoming" && (
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-4 rounded-lg bg-orange-500 px-6 py-2 text-sm font-bold text-white hover:bg-orange-600"
            >
              Search Trains
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayed.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Booking Card Component ────────────────────────────────────────────────────
function BookingCard({
  booking,
  onCancel,
  cancelling,
}: {
  booking: BookingResponse;
  onCancel: (b: BookingResponse) => void;
  cancelling: boolean;
}) {
  const upcoming = isUpcoming(booking.journey_date);
  const canCancel = booking.status === "CONFIRMED" && upcoming;

  const formattedDate = new Date(booking.journey_date).toLocaleDateString(
    "en-IN",
    { weekday: "short", day: "numeric", month: "short", year: "numeric" }
  );

  const bookedOn = new Date(booking.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition-all ${
        booking.status === "CANCELLED"
          ? "border-slate-200 opacity-70"
          : upcoming
          ? "border-orange-100"
          : "border-slate-200"
      }`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-orange-500">
            confirmation_number
          </span>
          <span className="font-mono text-sm font-bold tracking-widest text-slate-900">
            {booking.pnr}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {upcoming && booking.status === "CONFIRMED" && (
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-600 border border-orange-200">
              Upcoming
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              STATUS_STYLES[booking.status] ?? STATUS_STYLES.PENDING
            }`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Train name */}
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">train</span>
          <div>
            <p className="font-semibold text-slate-900">
              {booking.train.train_name}
            </p>
            <p className="text-xs text-slate-500">{booking.train.train_number}</p>
          </div>
        </div>

        {/* Route timeline */}
        <div className="mb-4 grid grid-cols-3 items-center gap-4 rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-lg font-bold text-slate-900">
              {booking.train.departure_time}
            </p>
            <p className="text-sm text-slate-500">{booking.train.source}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-slate-400">
              {booking.train.duration}
            </p>
            <div className="relative mt-1 flex items-center">
              <div className="h-px flex-1 bg-slate-300" />
              <span className="material-symbols-outlined mx-1 text-sm text-orange-400">
                arrow_forward
              </span>
              <div className="h-px flex-1 bg-slate-300" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">
              {booking.train.arrival_time}
            </p>
            <p className="text-sm text-slate-500">{booking.train.destination}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Journey Date</p>
            <p className="font-semibold text-slate-900">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Class</p>
            <p className="font-semibold text-slate-900">
              {CLASS_LABELS[booking.seat_class] ?? booking.seat_class}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Passengers</p>
            <p className="font-semibold text-slate-900">{booking.num_passengers}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Fare</p>
            <p className="font-semibold text-orange-600">
              ₹{booking.total_fare.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Passenger names */}
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Passengers: </span>
          {booking.passenger_names}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <p className="text-xs text-slate-400">Booked on {bookedOn}</p>
        {canCancel && (
          <button
            type="button"
            onClick={() => onCancel(booking)}
            disabled={cancelling}
            className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        )}
      </div>
    </div>
  );
}
