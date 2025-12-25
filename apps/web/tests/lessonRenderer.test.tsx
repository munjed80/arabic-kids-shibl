/// <reference types="vitest" />

import { act } from "react";
import { createRoot } from "react-dom/client";
import { LessonActivityCard } from "@/components/LessonActivityCard";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { ComponentProps } from "react";
import type { Activity } from "@/features/lesson-engine/lessonSchema";
import { speakArabicLetter, speakUiPrompt } from "@/lib/tts";

vi.mock("@/lib/tts", () => ({
  speak: vi.fn().mockResolvedValue(undefined),
  speakUiPrompt: vi.fn().mockResolvedValue(undefined),
  speakArabicLetter: vi.fn().mockResolvedValue(undefined),
}));

type CardProps = ComponentProps<typeof LessonActivityCard>;

const renderActivity = async (activity: Activity, onSubmit = vi.fn(), extraProps: Partial<CardProps> = {}) => {
  const container = document.createElement("div");
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <I18nProvider>
        <LessonActivityCard activity={activity} onSubmit={onSubmit} {...extraProps} />
      </I18nProvider>,
    );
  });

  await act(async () => {});

  return {
    onSubmit,
    container,
    unmount: async () =>
      act(async () => {
        root.unmount();
      }),
  };
};

describe("LessonActivityCard", () => {
  const baseActivity: Activity = {
    id: "activity-1",
    type: "choose",
    prompt: "Prompt",
    choices: ["A", "B"],
    answer: "A",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders level 2 activity types without crashing", async () => {
    const activities: Activity[] = [
      { ...baseActivity, id: "listen", type: "listen" },
      { ...baseActivity, id: "build", type: "build" },
      { ...baseActivity, id: "match", type: "match" },
      { ...baseActivity, id: "review", type: "review" },
    ];

    for (const activity of activities) {
      const rendered = await renderActivity(activity);
      await rendered.unmount();
    }
  });

  it("auto-completes review steps", async () => {
    const onSubmit = vi.fn();
    const activity: Activity = {
      ...baseActivity,
      id: "review-auto",
      type: "review",
      answer: "done",
    };

    const rendered = await renderActivity(activity, onSubmit);
    await act(async () => {});
    expect(onSubmit).toHaveBeenCalledWith("done");
    await rendered.unmount();
  });

  it("warns for unknown step types without blocking rendering", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const activity = { ...baseActivity, id: "unknown", type: "mystery" as Activity["type"] };

    const rendered = await renderActivity(activity);
    expect(warnSpy).toHaveBeenCalled();
    await rendered.unmount();
    warnSpy.mockRestore();
  });

  it("keeps feedback non-textual in visual-only mode and still triggers audio", async () => {
    const globalWithAudio = globalThis as typeof globalThis & { Audio?: typeof Audio };
    const originalAudio = globalWithAudio.Audio;
    const playSpy = vi.fn().mockResolvedValue(undefined);
    class MockAudio {
      preload = "";
      currentTime = 0;
      play = playSpy;
      pause = vi.fn();
      constructor() {}
    }
    globalWithAudio.Audio = MockAudio as unknown as typeof Audio;

    const activity: Activity = {
      ...baseActivity,
      asset: "audio/level1/a-sound-1.wav",
    };

    const rendered = await renderActivity(activity, vi.fn(), {
      visualOnly: true,
      autoPlayAudio: true,
      feedback: { correct: true, message: "should-hide" },
      playEffects: true,
    });

    expect(playSpy).toHaveBeenCalled();
    expect(speakUiPrompt).toHaveBeenCalled();
    expect(rendered.container.textContent).not.toContain("should-hide");

    await rendered.unmount();
    globalWithAudio.Audio = originalAudio || undefined;
  });

  it("narrates prompt and target letter on demand", async () => {
    const activity: Activity = {
      ...baseActivity,
      id: "listen-1",
      type: "listen",
      answer: "ب",
      asset: "audio/level1/b-sound-1.wav",
    };

    const rendered = await renderActivity(activity, vi.fn(), { autoPlayAudio: true });

    expect(speakUiPrompt).toHaveBeenCalledWith(expect.stringContaining("Listen"), "en");
    expect(speakArabicLetter).toHaveBeenCalledWith("ب");

    const button = rendered.container.querySelector<HTMLButtonElement>('button[aria-label="Play prompt audio"]');
    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(speakUiPrompt).toHaveBeenCalledTimes(2);

    await rendered.unmount();
  });
});
