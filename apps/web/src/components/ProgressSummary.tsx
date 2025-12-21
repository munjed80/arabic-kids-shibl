type Props = {
  current: number;
  total: number;
  completed: boolean;
};

export function ProgressSummary({ current, total, completed }: Props) {
  const percent = Math.round(((current + (completed ? 1 : 0)) / total) * 100);

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <span>
        Progress: Activity {Math.min(current + 1, total)} of {total}
      </span>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        {percent}% complete
      </span>
    </div>
  );
}
