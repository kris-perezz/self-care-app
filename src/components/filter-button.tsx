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
      className={`interactive-button rounded-xl px-3 py-1.5 text-small transition-all duration-200 ease-in-out ${
        active
          ? "bg-primary-500 text-white shadow-button"
          : "bg-neutral-50 text-neutral-700 shadow-card hover:bg-neutral-100"
      }`}
    >
      {children}
    </button>
  );
}
