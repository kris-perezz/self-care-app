import { BottomNav } from "@/components/nav/bottom-nav";
import { TimezoneSync } from "@/components/timezone-sync";

export default function ProtectedLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="app-shell mx-auto max-w-[900px]">
      <TimezoneSync />
      <main className="page-enter mx-auto max-w-[900px] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        {children}
      </main>
      <BottomNav />
      {modal}
    </div>
  );
}
