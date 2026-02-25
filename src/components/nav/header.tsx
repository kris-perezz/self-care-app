import { Coins } from "@phosphor-icons/react/dist/ssr";
import { getBalance } from "@/lib/queries";
import { formatCurrency } from "@/lib/currency";

export async function Header() {
  const balance = await getBalance();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-neutral-100 bg-neutral-50">
      <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-4">
        <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 900, fontStyle: "italic", fontSize: "1.25rem", lineHeight: 1 }}>
          himo
        </h1>
        <div className="ui-compact-pill h-6 gap-1 rounded-full bg-primary-100 px-3 text-[11px] font-semibold text-primary-700">
          <Coins size={14} weight="regular" />
          <span className="ui-compact-label">{formatCurrency(balance)}</span>
        </div>
      </div>
    </header>
  );
}
