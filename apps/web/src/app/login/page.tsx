"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { loginSchema } from "@/features/auth/schemas";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      router.replace("/account");
    }
  }, [router, session?.user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setMessage("Enter a valid email and a password with at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const result = await signIn("credentials", {
      ...parsed.data,
      redirect: false,
      callbackUrl: "/account",
    });

    if (result?.error) {
      setMessage(
        "We couldn&apos;t sign you in. Check your email and password or wait a moment if you tried multiple times.",
      );
    } else {
      router.push("/account");
    }
    setSubmitting(false);
  };

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-xl space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            Parent login
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Manage your subscription</h1>
          <p className="text-sm text-slate-600">
            Access billing and your child&apos;s progress. Children keep using lessons without typing
            passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-800" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-800" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              autoComplete="current-password"
              required
            />
          </div>
          {message ? <p className="text-sm text-amber-700">{message}</p> : null}
          <Button type="submit" className="w-full justify-center" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-700">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-800">
            Register as a parent
          </Link>
        </p>
      </Card>
    </Container>
  );
}
