import Image from "next/image";
import Link from "next/link";

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
  source: string;
  destination: string;
}

export default function RouteCard({
  badge,
  route,
  price,
  duration,
  images,
  source,
  destination,
}: RouteCardProps) {
  const coverImage = images[0];
  const href = `/results?from=${encodeURIComponent(source)}&to=${encodeURIComponent(destination)}`;

  return (
    <Link href={href} className="block">
      <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-52 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-slate-200" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-800 backdrop-blur">
              {badge}
            </span>
          </div>

          <button
            type="button"
            aria-label={`Save ${route}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-slate-700 backdrop-blur transition-colors hover:bg-white hover:text-red-500"
          >
            <span className="material-symbols-outlined text-[18px]">
              favorite
            </span>
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {route}
            </h3>
            <p className="mt-1 text-sm text-slate-200">{duration}</p>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Starting from
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {price}
              </p>
            </div>

            {images.length > 1 && (
              <div className="flex items-center">
                {images.slice(0, 3).map((img, i) => (
                  <div
                    key={`${img.src}-${i}`}
                    className={`${i === 0 ? "ml-0" : "-ml-2"} relative h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-sm`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                train
              </span>
              Direct route available
            </div>

            <div
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800"
            >
              Book now
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}