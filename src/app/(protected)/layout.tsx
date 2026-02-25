import { Header } from "@/components/nav/header";
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
      <Header />
      <main className="mx-auto max-w-[900px] px-4 pb-16 pt-16">{children}</main>
      <BottomNav />
      {modal}
    </div>
  );
}
