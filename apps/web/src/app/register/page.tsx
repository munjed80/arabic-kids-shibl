"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/i18n/I18nProvider";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
    };

    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.confirmPassword?.length) {
        setError(t("auth.passwordsDontMatch"));
      } else if (fieldErrors.password?.includes("auth.passwordTooShort")) {
        setError(t("auth.passwordTooShort"));
      } else if (fieldErrors.password?.includes("auth.passwordTooLong")) {
        setError(t("auth.passwordTooLong"));
      } else {
        setError(t("auth.invalidCredentials"));
      }
      setPending(false);
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data?.message === "EMAIL_IN_USE") {
        setError(t("auth.emailAlreadyUsed"));
      } else {
        setError(t("auth.invalidCredentials"));
      }
      setPending(false);
      return;
    }

    router.push(
      `/login?message=${encodeURIComponent(t("auth.accountWelcome", { email: parsed.data.email }))}`,
    );
  };

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md space-y-6">
        <LanguageSelector />
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            {t("auth.parentAreaTitle")}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            {t("auth.registerTitle")}
          </h1>
          <p className="text-sm text-slate-600">{t("auth.parentRegisterDesc")}</p>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="email">
              {t("auth.emailLabel")}
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
              {t("auth.passwordLabel")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="confirmPassword">
              {t("auth.confirmPasswordLabel")}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none"
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full justify-center" disabled={pending}>
            {pending ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>
        </form>

        <div className="flex items-center justify-between text-sm text-slate-700">
          <span>{t("auth.alreadyRegistered")}</span>
          <Link href="/login" className="font-semibold text-amber-700 hover:underline">
            {t("auth.signIn")}
          </Link>
        </div>
      </Card>
    </Container>
  );
}
