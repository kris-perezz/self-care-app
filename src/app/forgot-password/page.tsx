"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="heading-large text-neutral-900">
            Self Care
          </h1>
          <p className="mt-2 text-small text-neutral-700">Reset your password</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-primary-100 p-4 text-center shadow-card">
              <p className="text-small text-primary-700">
                Check your email
              </p>
              <p className="mt-1 text-tiny text-neutral-700">
                We sent a password reset link to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
            <p className="text-center text-small text-neutral-700">
              <Link
                href="/login"
                className="text-emphasis text-primary-700 hover:text-primary-500"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-accent-50 p-3 text-small text-accent-900 shadow-card">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-small text-neutral-900"
                >
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="text-center text-small text-neutral-700">
              <Link
                href="/login"
                className="text-emphasis text-primary-700 hover:text-primary-500"
              >
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
