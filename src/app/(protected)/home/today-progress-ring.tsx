export function TodayProgressRing({
  completedToday,
  totalToday,
}: {
  completedToday: number;
  totalToday: number;
}) {
  const isEmpty = totalToday === 0;
  const isComplete = !isEmpty && completedToday === totalToday;
  const fraction = isEmpty ? 0 : completedToday / totalToday;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Fraction — matches sibling stat card text scale */}
      <div className="flex items-baseline gap-0.5 font-heading">
        {isEmpty ? (
          <span className="text-neutral-400">—</span>
        ) : (
          <>
            <span className={isComplete ? "text-primary-700" : "text-neutral-900"}>
              {completedToday}
            </span>
            <span className="text-lg font-normal text-neutral-400">
              /{totalToday}
            </span>
          </>
        )}
      </div>

      {/* Segmented progress bar */}
      {!isEmpty && (
        <div className="flex gap-0.5">
          {Array.from({ length: totalToday }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  i < completedToday
                    ? isComplete
                      ? "#74A12E"
                      : "#d4996f"
                    : "rgba(0,0,0,0.08)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
