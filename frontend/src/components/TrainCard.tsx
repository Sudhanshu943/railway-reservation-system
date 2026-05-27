"use client";

interface ClassOption {
  code: string;
  price: string;
  availability: string;
  bookable: boolean;
}

interface TrainCardProps {
  id: number;
  name: string;
  number: string;
  runsOn: string;
  departure: string;
  departureStation: string;
  arrival: string;
  arrivalStation: string;
  duration: string;
  status: "available" | "limited" | "soldout";
  classes: ClassOption[];
}

export default function TrainCard({
  name,
  number,
  runsOn,
  departure,
  departureStation,
  arrival,
  arrivalStation,
  duration,
  status,
  classes,
}: TrainCardProps) {
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

  const config = statusConfig[status];
  const isGreyed = status === "soldout";

  return (
    <div className={`bg-surface border border-outline-variant rounded-xl overflow-hidden transition-all ${isGreyed ? "opacity-80" : ""} hover:border-primary`}>
      {/* Header */}
      <div className="p-[var(--spacing-stack-md)] 3xl:p-6 bg-surface-container-low flex flex-col md:flex-row md:items-center md:justify-between border-b border-outline-variant gap-[var(--spacing-stack-md)] 3xl:gap-6">
        <div>
          <div className="flex items-center gap-[var(--spacing-stack-sm)]">
            <h2 className="text-headline-sm font-semibold text-primary m-0">
              {name}
            </h2>
            <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-label-bold font-bold uppercase">
              {number}
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-2 m-0">
            Runs On: {runsOn}
          </p>
        </div>

        <div className="flex items-center gap-[var(--spacing-stack-lg)]">
          {/* Departure */}
          <div className="text-center">
            <div className="text-headline-sm font-semibold">
              {departure}
            </div>
            <div className="text-label-md text-on-surface-variant">
              {departureStation}
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
              {arrival}
            </div>
            <div className="text-label-md text-on-surface-variant">
              {arrivalStation}
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
                {cls.bookable ? (cls.availability.startsWith("WL") ? "Waitlist" : "Book Now") : "Full"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
