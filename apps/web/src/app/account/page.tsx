"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/i18n/I18nProvider";

export default function AccountPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "unauthenticated") {
    return null;
  }

  if (status === "loading") {
    return (
      <Container as="main" className="flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md text-center text-slate-800">{t("auth.signingIn")}</Card>
      </Container>
    );
  }

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-2xl space-y-6">
        <LanguageSelector />
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            {t("account.dashboard")}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{t("account.manage")}</h1>
          <p className="text-sm text-slate-600">{t("account.placeholder")}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">{t("account.signedInAs")}</p>
          <p>{session?.user?.email}</p>
          <p className="mt-3 text-slate-700">{t("account.dataNotice")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/logout">
            <Button type="button">{t("auth.logout")}</Button>
          </Link>
          <Link href="/">
            <Button type="button" variant="ghost">
              {t("account.backToLessons")}
            </Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
}
