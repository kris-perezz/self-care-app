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
      <main className="mx-auto max-w-[900px] px-4 pb-24 pt-6">{children}</main>
      <BottomNav />
      {modal}
    </div>
  );
}
