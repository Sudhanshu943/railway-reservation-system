'use client';

import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────
export interface RouteImage {
  src: string;
  alt: string;
}

export interface RouteCardProps {
  badge: string;
  route: string;
  price: string;
  duration: string;
  images: RouteImage[];
}

// ── Component ──────────────────────────────────────────────────
export default function RouteCard({
  badge,
  route,
  price,
  duration,
  images,
}: RouteCardProps) {
  return (
    <div
      className="group cursor-pointer bg-surface border border-outline-variant p-[var(--spacing-stack-md)] 3xl:p-6 rounded-xl transition-all hover:border-primary"
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).classList.remove("border-outline-variant");
        (e.currentTarget as HTMLDivElement).classList.add("border-primary");
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).classList.remove("border-primary");
        (e.currentTarget as HTMLDivElement).classList.add("border-outline-variant");
      }}
    >
      {/* ── Top Row: Badge + Favourite ── */}
      <div className="flex justify-between items-start mb-[var(--spacing-stack-sm)] 3xl:mb-3">
        {/* Badge */}
        <span className="bg-surface-container-high text-on-surface-variant text-label-bold 3xl:text-sm font-bold tracking-wider px-2 py-0.5 3xl:px-3 rounded">
          {badge}
        </span>

        {/* Favourite Icon */}
        <span
          className="material-symbols-outlined text-outline text-base transition-colors cursor-pointer"
        >
          favorite
        </span>
      </div>

      {/* ── Route Info ── */}
      <div className="mb-[var(--spacing-stack-md)] 3xl:mb-4">
        {/* Route Name */}
        <div className="text-headline-sm 3xl:text-lg font-semibold text-on-surface leading-tight">
          {route}
        </div>

        {/* Price & Duration */}
        <div className="text-body-sm text-on-surface-variant mt-0.5">
          From {price} • {duration}
        </div>
      </div>

      {/* ── Destination Thumbnails ── */}
      <div className="flex">
        {images.map((img, i) => (
          <Image
            key={i}
            src={img.src}
            alt={img.alt}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border-2 border-surface object-cover"
            style={{
              marginLeft: i === 0 ? "0" : "-8px",
            }}
          />
        ))}
      </div>
    </div>
  );
}