import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/options";
import { ensureParentSession } from "@/features/auth/guards";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const guard = ensureParentSession(session);

  if (!guard.allowed) {
    redirect(guard.redirectTo);
  }

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-2xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Parent dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Manage subscription and progress</h1>
          <p className="text-sm text-slate-600">
            Placeholder dashboard. Lessons stay unlocked for children without needing their own
            credentials.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">Signed in as</p>
          <p>{session?.user?.email}</p>
          <p className="mt-3 text-slate-700">
            Subscription management and child progress tracking will appear here. No child data is
            collected beyond lesson completion status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/logout">
            <Button type="button">Log out</Button>
          </Link>
          <Link href="/">
            <Button type="button" variant="ghost">
              Back to lessons
            </Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
}
