type SortOption =
  | "Earliest Departure"
  | "Lowest Price"
  | "Shortest Duration";

interface ResultsHeaderCardProps {
  loading: boolean;
  error: string | null;
  count: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export default function ResultsHeaderCard({
  loading,
  error,
  count,
  sortBy,
  onSortChange,
}: ResultsHeaderCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-secondary/20 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base text-secondary">train</span>
        {loading ? (
          <p className="text-sm text-slate-500">Loading trains...</p>
        ) : error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : (
          <p className="text-sm text-slate-600">
            <span className="font-bold text-secondary">{count}</span> trains available
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="sort-trains" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Sort by
        </label>
        <select
          id="sort-trains"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-sm font-medium text-slate-900 outline-none transition focus:border-secondary focus:ring-1 focus:ring-secondary/30"
        >
          <option>Earliest Departure</option>
          <option>Lowest Price</option>
          <option>Shortest Duration</option>
        </select>
      </div>
    </div>
  );
}