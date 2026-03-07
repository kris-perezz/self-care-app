export default function ReflectLoading() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="skeleton h-9 w-1/4 rounded-xl" />

      {/* Mood card */}
      <div className="skeleton h-28 w-full rounded-2xl" />

      {/* Write mode cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-24 rounded-2xl" />
      </div>

      {/* Prompt rows */}
      <div className="space-y-3">
        <div className="skeleton h-16 w-full rounded-2xl" />
        <div className="skeleton h-16 w-full rounded-2xl" />
        <div className="skeleton h-16 w-full rounded-2xl" />
        <div className="skeleton h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}
