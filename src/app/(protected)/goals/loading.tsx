export default function GoalsLoading() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="skeleton h-9 w-1/3 rounded-xl" />

      {/* Filter chips */}
      <div className="flex gap-2">
        <div className="skeleton h-9 w-16 rounded-full" />
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-12 rounded-full" />
      </div>

      {/* Goal cards */}
      <div className="space-y-3">
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}
