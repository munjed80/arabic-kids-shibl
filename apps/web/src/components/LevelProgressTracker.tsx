"use client";

import type { Lesson } from "@/features/lesson-engine/lessonSchema";
import type { LevelProgressRecord } from "@/features/progress/localProgress";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  lessons: Lesson[];
  progress: LevelProgressRecord;
};

export function LevelProgressTracker({ lessons, progress }: Props) {
  const { t } = useI18n();
  const completedCount = lessons.filter((lesson) =>
    progress.lessons.find((entry) => entry.lessonId === lesson.id && entry.completed),
  ).length;
  const percent = Math.round(((completedCount || 0) / Math.max(lessons.length, 1)) * 100);
  const currentIndex = Math.max(
    0,
    lessons.findIndex((lesson) => lesson.id === progress.currentLessonId),
  );
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 1;
  const currentLessonTitle = lessons[currentIndex]?.title ?? lessons[0]?.title ?? "";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <span>{t("level.progressCount", { completed: completedCount, total: lessons.length })}</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {t("lesson.completePercent", { percent })}
        </span>
      </div>
      <p className="text-xs text-slate-600">
        {progress.levelCompleted
          ? t("level.completedStatus")
          : t("level.currentLessonLabel", {
              current: displayIndex,
              total: lessons.length,
              title: currentLessonTitle,
            })}
      </p>
    </div>
  );
}
