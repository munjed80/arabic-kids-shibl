import type { Activity } from "@/features/lesson-engine/lessonSchema";

type Props = {
  activity: Activity;
  onSubmit: (choice: string) => void;
  disabled?: boolean;
  feedback?: { correct?: boolean; message?: string | null };
  onThinking?: () => void;
};

export function LessonActivityCard({
  activity,
  onSubmit,
  disabled,
  feedback,
  onThinking,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
        Activity
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activity.prompt}</h2>
      {activity.hint ? (
        <p className="mt-1 text-sm text-slate-500">Hint: {activity.hint}</p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {activity.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => {
              onThinking?.();
              onSubmit(choice);
            }}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled}
            aria-label={`Choose ${choice}`}
          >
            {choice}
          </button>
        ))}
      </div>

      {feedback?.message ? (
        <div
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            feedback.correct
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}
    </div>
  );
}
