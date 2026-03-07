export default function HomeLoading() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="skeleton h-10 w-3/4 rounded-xl" />
        <div className="skeleton h-4 w-1/3 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
      </div>

      {/* Banner / reward card placeholder */}
      <div className="skeleton h-20 w-full rounded-2xl" />

      {/* Goal cards */}
      <div className="space-y-3">
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="skeleton h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}
