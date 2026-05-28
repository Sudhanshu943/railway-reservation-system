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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        {loading ? (
          <p className="m-0 text-sm text-slate-500">Loading trains...</p>
        ) : error ? (
          <p className="m-0 text-sm font-medium text-red-600">{error}</p>
        ) : (
          <p className="m-0 text-sm text-slate-600">
            Showing {count} available trains
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-trains"
          className="text-sm font-medium text-slate-500"
        >
          Sort by:
        </label>
        <select
          id="sort-trains"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400"
        >
          <option>Earliest Departure</option>
          <option>Lowest Price</option>
          <option>Shortest Duration</option>
        </select>
      </div>
    </div>
  );
}