"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { useModal } from "@/components/modals/ModalProvider";
import { trainsAPI, bookingsAPI } from "@/lib/api";
import { Train } from "@/data/trains";

const CLASS_LABELS: Record<string, string> = {
  SL: "Sleeper (SL)",
  "3A": "AC 3 Tier (3A)",
  "2A": "AC 2 Tier (2A)",
  "1A": "AC First Class (1A)",
  GEN: "General (GEN)",
};

const CLASS_TO_API: Record<string, string> = {
  SL: "SLEEPER",
  "3A": "AC_3",
  "2A": "AC_2",
  "1A": "AC_1",
  GEN: "GENERAL",
};

const CLASS_PRICE_KEY: Record<string, keyof Train> = {
  SL: "price_sleeper",
  "3A": "price_ac3",
  "2A": "price_ac2",
  "1A": "price_ac1",
  GEN: "price_general",
};

interface PassengerForm {
  name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
}



export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const { openLoginModal } = useModal();

  const trainId = Number(params.id);
  const requestedClass = (searchParams.get("class") || "3A") as string;
  const quota = searchParams.get("quota") || "General";
  // Date is pre-selected from the search — read from URL, not editable here
  const urlDate = searchParams.get("date") || "";

  const [train, setTrain] = useState<Train | null>(null);
  const [trainLoading, setTrainLoading] = useState(true);
  const [trainError, setTrainError] = useState<string | null>(null);

  const journeyDate = urlDate;
  const [numPassengers, setNumPassengers] = useState(1);
  const [passengers, setPassengers] = useState<PassengerForm[]>([
    { name: "", age: "", gender: "Male" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [pnr, setPnr] = useState("");
  const [bookingStatus, setBookingStatus] = useState<"CONFIRMED" | "WAITLISTED">("CONFIRMED");
  const [wlNumber, setWlNumber] = useState<number | null>(null);

  // Helper function to determine available class
  const getAvailableClass = (train: Train, requestedClass: string): string => {
    const requestedPriceKey = CLASS_PRICE_KEY[requestedClass];
    if (requestedPriceKey && Number(train[requestedPriceKey]) > 0) {
      return requestedClass;
    }
    return Object.entries(CLASS_PRICE_KEY).find(([, priceKey]) => Number(train[priceKey]) > 0)?.[0] || "";
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      const query = searchParams.toString();
      const bookingUrl = `/booking/${trainId}${query ? `?${query}` : ""}`;
      openLoginModal(bookingUrl);
    }
  }, [authLoading, isLoggedIn, openLoginModal, searchParams, trainId]);

  // Fetch train details
  useEffect(() => {
    if (!trainId) return;
    const fetchTrain = async () => {
      try {
        setTrainLoading(true);
        const data = await trainsAPI.getById(trainId);
        setTrain(data);
      } catch {
        setTrainError("Could not load train details.");
      } finally {
        setTrainLoading(false);
      }
    };
    fetchTrain();
   }, [trainId]);

   const handlePassengerCountChange = (count: number) => {
    setNumPassengers(count);
    setPassengers((prev) => {
      if (count > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: count - prev.length }, () => ({
            name: "",
            age: "",
            gender: "Male" as const,
          })),
        ];
      }
      return prev.slice(0, count);
    });
  };

  const updatePassenger = (
    index: number,
    field: keyof PassengerForm,
    value: string
  ) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const selectedClass = train ? getAvailableClass(train, requestedClass) : requestedClass;
  const pricePerPerson = train && selectedClass
    ? (train[CLASS_PRICE_KEY[selectedClass]] as number) ?? 0
    : 0;
  const totalFare = pricePerPerson * numPassengers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!train || !journeyDate) return;
    if (!selectedClass || pricePerPerson <= 0) {
      addToast("Selected class is not available for this train", "error");
      return;
    }

    // Validate all passenger names
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        addToast(`Please enter name for Passenger ${i + 1}`, "error");
        return;
      }
      const age = Number(passengers[i].age);
      if (!passengers[i].age || isNaN(age) || age < 1 || age > 120) {
        addToast(`Please enter a valid age for Passenger ${i + 1}`, "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const passengerNames = passengers
        .map((p) => `${p.name.trim()} (${p.age}, ${p.gender})`)
        .join(", ");

      const response = await bookingsAPI.create({
        train_id: train.id,
        journey_date: journeyDate,
        seat_class: CLASS_TO_API[selectedClass],
        num_passengers: numPassengers,
        passenger_names: passengerNames,
      });

      setPnr(response.pnr);
      setBookingStatus(response.status as "CONFIRMED" | "WAITLISTED");
      setWlNumber(response.wl_number);
      setBooked(true);
      addToast(
        response.status === "WAITLISTED"
          ? `Waitlisted at WL/${response.wl_number}. PNR: ${response.pnr}`
          : `Booking confirmed! PNR: ${response.pnr}`,
        "success"
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const msg = error?.response?.data?.detail || "Booking failed. Please try again.";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Minimum date = today (kept for reference, date is locked from URL)
  // const today = new Date().toISOString().split("T")[0];

  if (authLoading || trainLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (trainError || !train) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-slate-300">
          train
        </span>
        <p className="text-lg font-semibold text-slate-700">Train not found</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Booking Confirmed Screen ──────────────────────────────────────────────
  if (booked) {
    const isWL = bookingStatus === "WAITLISTED";

    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Hidden print-only ticket */}
        <div id="print-ticket" className="hidden print:block font-sans text-black">
          <div style={{ border: "2px solid #000", padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", borderBottom: "1px solid #ccc", paddingBottom: "12px", marginBottom: "16px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>RailLink — E-Ticket</h1>
              <p style={{ fontSize: "12px", color: "#555", margin: "4px 0 0" }}>Indian Railways Authorized Partner</p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <tbody>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold", width: "40%" }}>PNR Number</td><td style={{ letterSpacing: "3px", fontWeight: "bold", fontSize: "16px" }}>{pnr}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Status</td><td style={{ color: isWL ? "#b45309" : "#15803d", fontWeight: "bold" }}>{isWL ? `WAITLISTED — WL/${wlNumber}` : "CONFIRMED"}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Train</td><td>{train?.train_name} ({train?.train_number})</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>From → To</td><td>{train?.source} → {train?.destination}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Departure</td><td>{train?.departure_time}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Arrival</td><td>{train?.arrival_time}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Journey Date</td><td>{journeyDate}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Class</td><td>{CLASS_LABELS[selectedClass]}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Passengers</td><td>{numPassengers}</td></tr>
                <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Passenger Names</td><td>{passengers.map(p => `${p.name} (${p.age}, ${p.gender})`).join(", ")}</td></tr>
                <tr style={{ borderTop: "1px solid #ccc" }}><td style={{ padding: "10px 0 6px", fontWeight: "bold", fontSize: "15px" }}>Total Fare</td><td style={{ fontWeight: "bold", fontSize: "15px" }}>₹{totalFare.toLocaleString()}</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: "11px", color: "#888", marginTop: "20px", textAlign: "center" }}>
              This is a computer-generated ticket. For assistance call 139.
            </p>
          </div>
        </div>

        {/* Screen confirmation card */}
        <div className={`rounded-2xl border p-8 text-center shadow-sm ${isWL ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}`}>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isWL ? "bg-amber-100" : "bg-green-100"}`}>
            <span className={`material-symbols-outlined text-4xl ${isWL ? "text-amber-600" : "text-green-600"}`}>
              {isWL ? "schedule" : "check_circle"}
            </span>
          </div>

          <h1 className={`mb-1 text-2xl font-bold ${isWL ? "text-amber-800" : "text-green-800"}`}>
            {isWL ? "Added to Waiting List" : "Booking Confirmed!"}
          </h1>
          <p className={`mb-6 text-sm ${isWL ? "text-amber-700" : "text-green-700"}`}>
            {isWL
              ? `No seats available right now. You are at position WL/${wlNumber}. You will be confirmed if a seat opens up.`
              : "Your journey has been booked successfully."}
          </p>

          {/* WL banner */}
          {isWL && (
            <div className="mb-5 flex items-center justify-center gap-3 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3">
              <span className="material-symbols-outlined text-2xl text-amber-600">hourglass_empty</span>
              <div className="text-left">
                <p className="text-sm font-bold text-amber-800">Waiting List Position</p>
                <p className="text-2xl font-black tracking-wider text-amber-700">WL / {wlNumber}</p>
              </div>
            </div>
          )}

          {/* Ticket details */}
          <div className={`mb-6 rounded-xl border bg-white p-5 text-left ${isWL ? "border-amber-200" : "border-green-200"}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">PNR Number</p>
                <p className="text-lg font-bold tracking-widest text-slate-900">{pnr}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${isWL ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                  {isWL ? `WAITLISTED — WL/${wlNumber}` : "CONFIRMED"}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Train</p>
                <p className="font-semibold text-slate-900">{train.train_name}</p>
                <p className="text-xs text-slate-400">{train.train_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Route</p>
                <p className="font-semibold text-slate-900">{train.source} → {train.destination}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Journey Date</p>
                <p className="font-semibold text-slate-900">{journeyDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Class</p>
                <p className="font-semibold text-slate-900">{CLASS_LABELS[selectedClass]}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Passengers</p>
                <p className="font-semibold text-slate-900">{numPassengers}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Fare</p>
                <p className="text-lg font-bold text-secondary">₹{totalFare.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={() => router.push(`/pnr-status?pnr=${pnr}`)}
              className="rounded-lg border border-secondary/30 bg-secondary/10 px-5 py-2.5 text-sm font-bold text-secondary hover:bg-secondary/20"
            >
              Check PNR Status
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-bold text-white hover:bg-secondary/90"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download Ticket
            </button>
          </div>

          {isWL && (
            <p className="mt-4 text-xs text-amber-600">
              WL bookings are automatically confirmed when cancellations occur. Check PNR status for updates.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Main Booking Form ─────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to results
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: Form ── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Train Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">
                Train Details
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">
                    train
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {train.train_name}
                    </p>
                    <p className="text-xs text-slate-500">{train.train_number}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {train.departure_time}
                    </p>
                    <p className="text-sm text-slate-500">{train.source}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-500">
                      {train.duration}
                    </p>
                    <div className="mt-1 h-px bg-slate-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">
                      {train.arrival_time}
                    </p>
                    <p className="text-sm text-slate-500">{train.destination}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700 border border-orange-200">
                    {CLASS_LABELS[selectedClass]}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    {quota} Quota
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                    Runs: {train.days_of_operation}
                  </span>
                </div>
              </div>
            </div>

            {/* Journey Date & Passengers */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">
                Journey Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Date — locked, chosen on search page */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Journey Date
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <span className="material-symbols-outlined text-base text-slate-400">
                      calendar_month
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {journeyDate
                        ? new Date(journeyDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "No date selected"}
                    </span>
                    <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                      Locked
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Date selected during search.{" "}
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="text-orange-500 hover:underline"
                    >
                      Go back to change
                    </button>
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Number of Passengers
                  </label>
                  <select
                    value={numPassengers}
                    onChange={(e) => handlePassengerCountChange(Number(e.target.value))}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Passenger{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">
                Passenger Details
              </h2>
              <div className="flex flex-col gap-5">
                {passengers.map((passenger, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Passenger {index + 1}
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="flex flex-col gap-1.5 sm:col-span-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={passenger.name}
                          onChange={(e) =>
                            updatePassenger(index, "name", e.target.value)
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Age
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={120}
                          placeholder="25"
                          value={passenger.age}
                          onChange={(e) =>
                            updatePassenger(index, "age", e.target.value)
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Gender
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) =>
                            updatePassenger(index, "gender", e.target.value)
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !journeyDate || !selectedClass || pricePerPerson <= 0}              className="w-full rounded-xl bg-orange-500 py-4 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Confirming Booking..." : `Confirm & Book — ₹${totalFare.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* ── Right: Fare Summary ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 flex flex-col gap-4">
            {/* Fare Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">
                Fare Summary
              </h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Class</span>
                  <span className="font-medium text-slate-900">
                    {CLASS_LABELS[selectedClass]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fare per person</span>
                  <span className="font-medium text-slate-900">
                    ₹{pricePerPerson.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Passengers</span>
                  <span className="font-medium text-slate-900">
                    × {numPassengers}
                  </span>
                </div>
                <div className="my-1 h-px bg-slate-100" />
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-orange-600">
                    ₹{totalFare.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-slate-900">
                Booking Info
              </h2>
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                {user && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-slate-400">
                      person
                    </span>
                    <span>{user.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">
                    confirmation_number
                  </span>
                  <span>PNR generated on confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">
                    cancel
                  </span>
                  <span>Free cancellation available</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-800">
              <p className="font-semibold mb-1">Cancellation Policy</p>
              <p>Cancellations made before departure are eligible for a refund as per Indian Railways policy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
