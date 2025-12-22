import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { canAccessProtected } from "@/features/auth/protection";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!canAccessProtected(session)) {
    redirect("/login");
  }

  return (
    <Container as="main" className="flex min-h-screen flex-col gap-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Parent dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Manage your subscription and progress</h1>
        <p className="text-sm text-slate-600">
          This area is parent-only. Children can keep using lessons without entering credentials.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Account</h2>
          <p className="text-sm text-slate-700">Signed in as {session?.user.email}</p>
          <div className="flex gap-3">
            <Link href="/logout">
              <Button>Logout</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Back to lessons</Button>
            </Link>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Subscription</h2>
          <p className="text-sm text-slate-700">
            Subscription management placeholder. Billing for €7/month will be handled here.
          </p>
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            No child data is shown or collected. Only parent contact information is stored securely.
          </div>
        </Card>
      </div>
    </Container>
  );
}
