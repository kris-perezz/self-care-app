"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/home");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 900, fontStyle: "italic", fontSize: "2rem", lineHeight: 1 }}>
            himo
          </h1>
          <p className="mt-2 text-small text-neutral-700">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-accent-50 p-3 text-small text-accent-900 shadow-card">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-small text-neutral-900">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-body text-neutral-900 shadow-card transition-all duration-200 ease-in-out focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-small text-neutral-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-body text-neutral-900 shadow-card transition-all duration-200 ease-in-out focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="••••••••"
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-tiny text-primary-700 hover:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-small text-neutral-700">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emphasis text-primary-700 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
