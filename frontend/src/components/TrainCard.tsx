"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ClassOption {
  code: string;
  price: string;
  availability: string;
  bookable: boolean;
}

interface TrainCardProps {
  id: number;
  // Backend API properties
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
  // Legacy/frontend properties
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
  // Use backend properties if available, fall back to legacy properties
  const trainName = train_name || name || "Unknown Train";
  const trainNumber = train_number || number || "N/A";
  const fromStation = source || departureStation || "Unknown";
  const toStation = destination || arrivalStation || "Unknown";
  const depTime = departure_time || departure || "00:00";
  const arrTime = arrival_time || arrival || "00:00";
  const runDays = days_of_operation || runsOn || "Unknown";
  
  // Determine status based on available seats
  let trainStatus: "available" | "limited" | "soldout" = status || "available";
  if (available_seats !== undefined && total_seats !== undefined) {
    if (available_seats === 0) trainStatus = "soldout";
    else if (available_seats < total_seats! * 0.3) trainStatus = "limited";
    else trainStatus = "available";
  }

  const statusConfig = {
    available: {
      label: "Available",
      className: "bg-green-100 text-green-800",
      dotColor: "bg-green-500",
    },
    limited: {
      label: "Limited",
      className: "bg-surface-container-high text-on-surface-variant",
      dotColor: "bg-outline",
    },
    soldout: {
      label: "Sold Out",
      className: "bg-error-container text-on-error-container",
      dotColor: "bg-error",
    },
  };

  const config = statusConfig[trainStatus];
  const isGreyed = trainStatus === "soldout";

  return (
    <div className={`bg-surface border border-outline-variant rounded-xl overflow-hidden transition-all ${isGreyed ? "opacity-80" : ""} hover:border-primary`}>
      {/* Header */}
      <div className="p-[var(--spacing-stack-md)] 3xl:p-6 bg-surface-container-low flex flex-col md:flex-row md:items-center md:justify-between border-b border-outline-variant gap-[var(--spacing-stack-md)] 3xl:gap-6">
        <div>
          <div className="flex items-center gap-[var(--spacing-stack-sm)]">
            <h2 className="text-headline-sm font-semibold text-primary m-0">
              {trainName}
            </h2>
            <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-label-bold font-bold uppercase">
              {trainNumber}
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-2 m-0">
            Runs On: {runDays}
          </p>
        </div>

        <div className="flex items-center gap-[var(--spacing-stack-lg)]">
          {/* Departure */}
          <div className="text-center">
            <div className="text-headline-sm font-semibold">
              {depTime}
            </div>
            <div className="text-label-md text-on-surface-variant">
              {fromStation}
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col items-center flex-1 min-w-20">
            <div className="text-label-bold font-bold text-outline">
              {duration}
            </div>
            <div className="w-full h-px bg-outline-variant relative my-2">
              <div className="absolute left-0 -top-1.5 w-2 h-2 rounded-full bg-outline-variant" />
              <div className="absolute right-0 -top-1.5 w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <div className="text-headline-sm font-semibold">
              {arrTime}
            </div>
            <div className="text-label-md text-on-surface-variant">
              {toStation}
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden md:block">
            <span className={`${config.className} px-4 py-1 rounded-full text-label-bold font-bold flex items-center gap-2`}>
              <span className={`w-2 h-2 ${config.dotColor} rounded-full`} />
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Class Options */}
      <div className="p-[var(--spacing-stack-md)] 3xl:p-6 overflow-x-auto">
        <div className="flex gap-[var(--spacing-stack-md)] 3xl:gap-6">
          {/* If backend prices are available, display them */}
          {price_ac1 !== undefined && (
            <>
              <ClassCard
                code="1AC"
                price={`₹${price_ac1.toLocaleString()}`}
                available={available_seats !== undefined && available_seats > 0}
                isGreyed={isGreyed}
              />
              <ClassCard
                code="2AC"
                price={`₹${price_ac2?.toLocaleString() || '0'}`}
                available={available_seats !== undefined && available_seats > 0}
                isGreyed={isGreyed}
              />
              <ClassCard
                code="3AC"
                price={`₹${price_ac3?.toLocaleString() || '0'}`}
                available={available_seats !== undefined && available_seats > 0}
                isGreyed={isGreyed}
              />
              {price_sleeper !== undefined && price_sleeper > 0 && (
                <ClassCard
                  code="SL"
                  price={`₹${price_sleeper.toLocaleString()}`}
                  available={available_seats !== undefined && available_seats > 0}
                  isGreyed={isGreyed}
                />
              )}
            </>
          )}
          {/* Fall back to legacy classes array if available */}
          {classes && classes.length > 0 && price_ac1 === undefined && (
            <>
              {classes.map((cls, idx) => (
                <div
                  key={idx}
                  className={`border border-outline rounded p-[var(--spacing-stack-md)] min-w-[140px] flex-1 transition-colors ${isGreyed ? "bg-surface-container" : "bg-surface hover:bg-surface-container"}`}
                >
                  <div className="flex justify-between items-start mb-[var(--spacing-stack-sm)]">
                    <span className="text-label-bold font-bold">
                      {cls.code}
                    </span>
                    <span className={`text-primary text-headline-sm font-semibold ${isGreyed ? "opacity-50" : ""}`}>
                      {cls.price}
                    </span>
                  </div>

                  <div className={`text-body-sm mb-[var(--spacing-stack-md)] ${
                    cls.availability === "NOT AVAILABLE"
                      ? "text-error"
                      : cls.availability.startsWith("WL")
                      ? "text-on-surface-variant"
                      : "text-green-600"
                  }`}>
                    {cls.availability}
                  </div>

                  <button
                    className={`w-full py-2 px-0 rounded text-label-bold font-bold transition-all hover:opacity-90 active:scale-95 ${
                      cls.bookable
                        ? "bg-primary text-on-primary cursor-pointer"
                        : cls.availability.startsWith("WL")
                        ? "border border-primary text-primary bg-transparent"
                        : "bg-outline text-on-surface-variant cursor-not-allowed"
                    } ${isGreyed ? "opacity-70" : ""}`}
                    disabled={!cls.bookable}
                  >
                    {cls.bookable ? "Book Now" : "Waitlist"}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying class cards
function ClassCard({
  code,
  price,
  available,
  isGreyed,
}: {
  code: string;
  price: string;
  available: boolean;
  isGreyed: boolean;
}) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const handleBookClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    // TODO: Handle booking logic
    console.log(`Booking ${code} seat class`);
  };

  return (
    <div
      className={`border border-outline rounded p-[var(--spacing-stack-md)] min-w-[140px] flex-1 transition-colors ${
        isGreyed ? "bg-surface-container" : "bg-surface hover:bg-surface-container"
      }`}
    >
      <div className="flex justify-between items-start mb-[var(--spacing-stack-sm)]">
        <span className="text-label-bold font-bold">{code}</span>
        <span className={`text-primary text-headline-sm font-semibold ${isGreyed ? "opacity-50" : ""}`}>
          {price}
        </span>
      </div>

      <div className={`text-body-sm mb-[var(--spacing-stack-md)] ${available ? "text-green-600" : "text-error"}`}>
        {available ? "Available" : "Sold Out"}
      </div>

      <button
        className={`w-full py-2 px-0 rounded text-label-bold font-bold transition-all hover:opacity-90 active:scale-95 ${
          available
            ? "bg-primary text-on-primary cursor-pointer"
            : "bg-outline text-on-surface-variant cursor-not-allowed"
        } ${isGreyed ? "opacity-70" : ""}`}
        disabled={!available}
        onClick={handleBookClick}
      >
        {available ? "Book Now" : "Unavailable"}
      </button>
    </div>
  );
}
