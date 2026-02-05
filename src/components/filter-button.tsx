"use client";

export function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-white text-gray-500 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
