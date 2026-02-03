import { Header } from "@/components/nav/header";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TimezoneSync } from "@/components/timezone-sync";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="mx-auto min-h-screen max-w-md"
      style={{
        background: "linear-gradient(to bottom right, #ffe4fa, #f1dedc, #e1dabd)",
      }}
    >
      <TimezoneSync />
      <Header />
      <main className="px-4 pb-20 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
