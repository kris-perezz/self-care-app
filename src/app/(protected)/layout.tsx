import { Header } from "@/components/nav/header";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TimezoneSync } from "@/components/timezone-sync";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[900px]">
      <TimezoneSync />
      <Header />
      <main className="mx-auto max-w-[900px] px-6 pb-20 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
