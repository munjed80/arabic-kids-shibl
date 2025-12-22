"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-xl space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">Logout</p>
        <h1 className="text-2xl font-bold text-slate-900">Sign out of your parent account</h1>
        <p className="text-sm text-slate-600">
          Signing out keeps lessons open for your child without exposing account details.
        </p>
        <Button className="w-full justify-center" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </Card>
    </Container>
  );
}
