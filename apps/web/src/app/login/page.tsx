"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const infoMessage = searchParams.get("message");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const credentials = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) {
      setError("Enter a valid email and password.");
      setPending(false);
      return;
    }

    const result = await signIn("credentials", {
      ...parsed.data,
      redirect: false,
      callbackUrl: "/account",
    });

    if (result?.error) {
      setError("Unable to sign in. Check your email or password.");
      setPending(false);
      return;
    }

    router.push(result?.url || "/account");
  };

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Parent login
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Manage your subscription</h1>
          <p className="text-sm text-slate-600">
            Access parent controls. Children can keep learning without seeing this page.
          </p>
        </div>

        {infoMessage ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {infoMessage}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <Button type="submit" className="w-full justify-center" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm text-slate-700">
          <span>New here?</span>
          <Link href="/register" className="font-semibold text-amber-700 hover:underline">
            Create a parent account
          </Link>
        </div>
      </Card>
    </Container>
  );
}
