import TrainCard from "@/components/resultCards/TrainCard";
import { Train } from "@/data/trains";

interface TrainResultsCardProps {
  loading: boolean;
  error: string | null;
  trains: Train[];
}

export default function TrainResultsCard({
  loading,
  error,
  trains,
}: TrainResultsCardProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="animate-pulse p-5 md:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="h-4 w-20 rounded-full bg-blue-200" />
                  <div className="h-6 w-40 rounded-lg bg-slate-200" />
                </div>
                <div className="h-10 w-28 rounded-xl bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="h-20 rounded-2xl bg-slate-100" />
                <div className="h-20 rounded-2xl bg-slate-100" />
                <div className="h-20 rounded-2xl bg-slate-100" />
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-11 w-32 rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <span className="material-symbols-outlined text-[26px]">
              error
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Unable to load trains
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (trains.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <span className="material-symbols-outlined text-[26px]">
              train
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            No trains found
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Try changing your route, date, or filters to see more available
            train options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trains.map((train) => (
        <div
          key={train.id}
          className="w-full rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
        >
          <TrainCard {...train} />
        </div>
      ))}
    </div>
  );
}