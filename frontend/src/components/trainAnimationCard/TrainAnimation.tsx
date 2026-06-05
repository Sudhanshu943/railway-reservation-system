export default function TrainAnimation() {
  const coaches = [1, 2, 3];

  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-b border-slate-200 bg-slate-100 py-10"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Live Network Motion
          </span>
          <span className="text-sm text-slate-500">Europe-wide routes</span>
        </div>

        <div className="relative h-16 overflow-hidden rounded-2xl bg-white/70 px-4 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
          <div className="absolute inset-x-4 bottom-4 h-[2px] bg-slate-300" />
          <div className="absolute inset-x-4 bottom-[10px] flex justify-between opacity-50">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="h-1.5 w-6 rounded-full bg-slate-300" />
            ))}
          </div>

          <div className="motion-reduce:hidden absolute left-0 top-1/2 animate-[trainRide_10s_linear_infinite] will-change-transform">
            <div className="flex items-end">
              <div className="relative h-8 w-24 rounded-l-2xl rounded-r-md bg-slate-900">
                <div className="absolute right-3 top-2 h-3 w-6 rounded-sm bg-white/20" />
                <div className="absolute bottom-[-6px] left-4 h-3 w-3 rounded-full bg-slate-700" />
                <div className="absolute bottom-[-6px] right-4 h-3 w-3 rounded-full bg-slate-700" />
              </div>

              {coaches.map((coach) => (
                <div
                  key={coach}
                  className="relative mx-0.5 h-7 w-20 rounded-sm bg-slate-800"
                >
                  <div className="absolute inset-x-2 top-2 flex justify-between">
                    <span className="h-2 w-3 rounded-sm bg-white/20" />
                    <span className="h-2 w-3 rounded-sm bg-white/20" />
                    <span className="h-2 w-3 rounded-sm bg-white/20" />
                  </div>
                  <div className="absolute bottom-[-6px] left-3 h-3 w-3 rounded-full bg-slate-700" />
                  <div className="absolute bottom-[-6px] right-3 h-3 w-3 rounded-full bg-slate-700" />
                </div>
              ))}

              <div className="relative h-8 w-24 rounded-l-md rounded-r-2xl bg-slate-900">
                <div className="absolute left-3 top-2 h-3 w-6 rounded-sm bg-white/20" />
                <div className="absolute right-2 top-1/2 h-2 w-4 -translate-y-1/2 rounded-full bg-amber-300/80 blur-[1px]" />
                <div className="absolute bottom-[-6px] left-4 h-3 w-3 rounded-full bg-slate-700" />
                <div className="absolute bottom-[-6px] right-4 h-3 w-3 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>

          <div className="hidden h-full items-center justify-center motion-reduce:flex">
            <span className="text-sm font-medium text-slate-500">
              Train animation disabled for reduced motion
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}