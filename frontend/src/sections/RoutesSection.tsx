"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RouteCard from "@/components/RouteCard";
import { trainsAPI } from "@/lib/api";

interface PopularRoute {
  id: string;
  badge: string;
  route: string;
  price: string;
  duration: string;
  images: { src: string; alt: string }[];
}

export default function RoutesSection() {
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const trains = await trainsAPI.getAll();

interface TrainData {
  id: number;
  source: string;
  destination: string;
  duration: string;
  price_ac2?: number;
  price_ac3?: number;
  price_sleeper?: number;
}

const routeMap = new Map<
  string,
  {
    source: string;
    destination: string;
    price: string;
    duration: string;
    trains: TrainData[];
  }
>();

trains.forEach((train: TrainData) => {
          const routeKey = `${train.source}-${train.destination}`;

          if (!routeMap.has(routeKey)) {
            routeMap.set(routeKey, {
              source: train.source,
              destination: train.destination,
              price: `₹${
                train.price_ac2 || train.price_ac3 || train.price_sleeper || 0
              }`,
              duration: train.duration,
              trains: [],
            });
          }

          routeMap.get(routeKey)?.trains.push(train);
        });

        const popularRoutes: PopularRoute[] = Array.from(routeMap.entries())
  .sort(([, a], [, b]) => b.trains.length - a.trains.length)
  .slice(0, 4)
  .map(([key, data]) => ({
    id: key,
    badge: data.trains.length > 1 ? "Express" : "Standard",
    route: `${data.source} → ${data.destination}`,
    price: data.price,
    duration: data.duration,
    images: [],
  }));

        setRoutes(popularRoutes);
      } catch (error) {
        console.error("Error fetching routes:", error);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 md:py-14 3xl:max-w-[1600px] 3xl:py-16">
      <div className="mb-8 flex items-center justify-between gap-4 3xl:mb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl 3xl:text-4xl">
          Popular Routes
        </h2>

        <Link
          href="/routes"
          className="flex items-center gap-1 text-sm font-bold text-slate-900 transition-colors hover:text-slate-700"
        >
          View All
          <span className="material-symbols-outlined text-base">
            arrow_forward
          </span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 3xl:grid-cols-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-52 animate-pulse bg-slate-200" />
              <div className="p-5">
                <div className="mb-3 h-5 w-20 animate-pulse rounded bg-slate-200" />
                <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="mb-5 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : routes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 3xl:grid-cols-6 3xl:gap-6">
          {routes.map((route) => (
            <RouteCard key={route.id} {...route} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No popular routes available
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t load routes right now. Please try again shortly.
          </p>
        </div>
      )}
    </section>
  );
}