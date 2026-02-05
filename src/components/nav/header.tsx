import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let balance = 0;
  if (user) {
    const { data: transactions } = await supabase
      .from("currency_transactions")
      .select("amount")
      .eq("user_id", user.id);

    balance = transactions?.reduce((sum, t) => sum + t.amount, 0) ?? 0;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-6">
        <h1 className="heading-section text-neutral-900">Self Care</h1>
        <div className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-small text-primary-700">
          <CoinIcon />
          <span>{formatCurrency(balance)}</span>
        </div>
      </div>
    </header>
  );
}

function CoinIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 0 0 1.192-.91C12.637 5.55 11.596 5 10.5 5s-2.137.55-2.894 1.54A5.205 5.205 0 0 0 6.83 8H5.75a.75.75 0 0 0 0 1.5h.77a6.333 6.333 0 0 0 0 1h-.77a.75.75 0 0 0 0 1.5h1.08c.183.528.442 1.023.776 1.46.757.99 1.798 1.54 2.894 1.54s2.137-.55 2.894-1.54a.75.75 0 0 0-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95a3.505 3.505 0 0 1-.343-.55h1.795a.75.75 0 0 0 0-1.5H8.026a4.835 4.835 0 0 1 0-1h2.224a.75.75 0 0 0 0-1.5H8.455c.098-.195.212-.38.343-.55Z" clipRule="evenodd" />
    </svg>
  );
}
