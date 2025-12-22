"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/i18n/I18nProvider";
import {
  getLessonProgressFromLevel,
  loadLevelProgress,
  type LevelProgressRecord,
} from "@/features/progress/localProgress";
import { lessonSchema } from "@/features/lesson-engine/lessonSchema";
import lessonData from "@/content/lessons/lesson-letters.json";
import wordsLessonData from "@/content/lessons/lesson-words.json";
import readingLessonData from "@/content/lessons/lesson-reading.json";
import reviewLessonData from "@/content/lessons/lesson-review.json";

const LEVEL_ID = "level-1";

export default function AccountPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const lessons = useMemo(
    () => [
      lessonSchema.parse(lessonData),
      lessonSchema.parse(wordsLessonData),
      lessonSchema.parse(readingLessonData),
      lessonSchema.parse(reviewLessonData),
    ],
    [],
  );
  const firstLessonId = lessons[0]?.id ?? "";
  const levelProgress = useMemo<LevelProgressRecord | null>(
    () => (firstLessonId ? loadLevelProgress(LEVEL_ID, firstLessonId) : null),
    [firstLessonId],
  );

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

  const completedLessonsCount =
    levelProgress && lessons.length
      ? lessons.filter(
          (lesson) => getLessonProgressFromLevel(levelProgress, lesson.id).completed,
        ).length
      : 0;

  const currentLessonTitle =
    levelProgress && lessons.length
      ? lessons.find((lesson) => lesson.id === levelProgress.currentLessonId)?.title ??
        lessons[0].title
      : "";

  return (
    <Container as="main" className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-2xl space-y-6">
        <LanguageSelector />
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            {t("auth.parentAreaTitle")}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{t("auth.accountWelcome", { email: session?.user?.email ?? "" })}</h1>
          <p className="text-sm text-slate-600">{t("account.placeholder")}</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">{t("account.progressHeading")}</p>
          <p className="mt-1 text-slate-700">
            {t("account.progressSummary", {
              completed: completedLessonsCount,
              total: lessons.length,
            })}
          </p>
          <p className="mt-1 text-slate-700">
            {t("account.currentLesson", { title: currentLessonTitle })}
          </p>
          {!levelProgress?.started ? (
            <p className="mt-3 text-slate-700">{t("account.noProgress")}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-700">
          <p>{t("account.dataNotice")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
            {t("auth.signOut")}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/")}>
            {t("account.backToLessons")}
          </Button>
        </div>
      </Card>
    </Container>
  );
}
