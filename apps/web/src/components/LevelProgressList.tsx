"use client";

import type { Lesson } from "@/features/lesson-engine/lessonSchema";
import type { LevelProgressRecord } from "@/features/progress/localProgress";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  lessons: Lesson[];
  progress: LevelProgressRecord;
  currentLessonId: string;
  onSelect?: (lessonId: string) => void;
  locked?: boolean;
};

const badgeStyles = {
  current: "bg-sky-100 text-sky-900 border-sky-200",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  ready: "bg-amber-100 text-amber-900 border-amber-200",
  locked: "bg-slate-100 text-slate-700 border-slate-200",
};

export function LevelProgressList({ lessons, progress, currentLessonId, onSelect, locked }: Props) {
  const { t } = useI18n();

  const lessonsById = Object.fromEntries(progress.lessons.map((entry) => [entry.lessonId, entry]));

  return (
    <div className="flex flex-col gap-3">
      {lessons.map((lesson, index) => {
        const entry = lessonsById[lesson.id];
        const completed = entry?.completed ?? false;
        const isCurrent = lesson.id === currentLessonId;
        const previous = lessons[index - 1];
        const previousCompleted = previous ? (lessonsById[previous.id]?.completed ?? false) : true;
        const isLocked = locked || (!isCurrent && !completed && !previousCompleted);

        const statusKey = completed
          ? "completed"
          : isCurrent
            ? "current"
            : isLocked
              ? "locked"
              : "ready";
        const badgeStyle = badgeStyles[statusKey];

        return (
          <button
            key={lesson.id}
            type="button"
            disabled={isLocked}
            onClick={() => onSelect?.(lesson.id)}
            className={`flex items-start justify-between rounded-xl border px-4 py-3 text-left shadow-sm transition ${
              isLocked
                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
                : "border-slate-200 bg-white hover:border-amber-300 hover:shadow"
            }`}
            aria-label={t("level.lessonAria", { title: lesson.title })}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">{lesson.title}</span>
              <span className="text-xs text-slate-600">{lesson.description}</span>
            </div>
            <span className={`ml-3 rounded-full border px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
              {t(`level.lessonStatus.${statusKey}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
