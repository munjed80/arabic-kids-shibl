"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { useI18n } from "@/i18n/I18nProvider";

export default function LogoutPage() {
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    signOut({ redirect: false }).finally(() => {
      router.push("/");
    });
  }, [router]);

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md text-center text-slate-800">
        {t("auth.loggingOut")}
      </Card>
    </Container>
  );
}
