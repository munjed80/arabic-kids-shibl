"use client";

import type { CompanionMood } from "@/features/companion/stateMachine";

const faceByState: Record<CompanionMood["state"], string> = {
  idle: "🦁",
  intro: "👋",
  thinking: "🤔",
  happy: "😺",
  celebrate: "🎉",
  sad: "😿",
  cooldown: "😌",
};

const animationByState: Partial<Record<CompanionMood["state"], string>> = {
  happy: "shibl-bounce",
  celebrate: "shibl-bounce",
  sad: "shibl-nod",
  thinking: "shibl-focus",
  intro: "shibl-wave",
};

type Props = {
  mood: CompanionMood;
};

export function ShiblVisual({ mood }: Props) {
  const animation = animationByState[mood.state] ?? "";
  const face = faceByState[mood.state] ?? faceByState.idle;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white/80 p-3 shadow-sm">
      <div
        className={`grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-3xl text-amber-800 ${animation}`}
        aria-label="Shibl"
      >
        <span aria-hidden>{face}</span>
        <span className="sr-only">Shibl {mood.state}</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300 animate-pulse" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse [animation-delay:150ms]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-sky-300 animate-pulse [animation-delay:300ms]" aria-hidden />
        </div>
        <div className="h-2 w-20 rounded-full bg-amber-100" aria-hidden />
        <span className="sr-only">Shibl reacts with motion only</span>
      </div>
    </div>
  );
}
