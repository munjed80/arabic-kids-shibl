"use client";

import { useI18n } from "@/i18n/I18nProvider";
import {
  companionLabelKeyByState,
  type CompanionMood,
  type CompanionState,
} from "@/features/companion/stateMachine";

const accentStyles: Record<CompanionMood["accent"], string> = {
  calm: "bg-sky-50 text-sky-900 border-sky-200",
  success: "bg-emerald-50 text-emerald-900 border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  info: "bg-indigo-50 text-indigo-900 border-indigo-200",
};

const accentTransitions: Record<CompanionMood["accent"], string> = {
  calm: "transition-colors duration-300",
  success: "transition-colors duration-300",
  warning: "transition-colors duration-300",
  info: "transition-colors duration-300",
};

const stateEmojis: Record<CompanionState, string> = {
  idle: "🦁",
  intro: "👋",
  thinking: "🤔",
  happy: "😺",
  celebrate: "🎉",
  sad: "😿",
  cooldown: "😌",
};

type Props = {
  mood: CompanionMood;
};

export function CompanionAvatar({ mood }: Props) {
  const { t } = useI18n();
  const style = accentStyles[mood.accent];
  const transition = accentTransitions[mood.accent];

  return (
    <div 
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm ${style} ${transition} motion-reduce:transition-none`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-inner">
        {stateEmojis[mood.state]}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {t("companion.name")}
        </p>
        <p className="text-base font-medium">{t(companionLabelKeyByState[mood.state])}</p>
        <p className="text-xs text-slate-500">{t("companion.nonVerbal")}</p>
      </div>
    </div>
  );
}
