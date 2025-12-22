"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut({ redirect: false }).finally(() => {
      router.push("/");
    });
  }, [router]);

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md text-center text-slate-800">
        Signing you out of your parent session...
      </Card>
    </Container>
  );
}
