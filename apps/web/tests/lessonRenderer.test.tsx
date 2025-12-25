/// <reference types="vitest" />

import { act } from "react";
import { createRoot } from "react-dom/client";
import { LessonActivityCard } from "@/components/LessonActivityCard";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { ComponentProps } from "react";
import type { Activity } from "@/features/lesson-engine/lessonSchema";

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
    const originalAudio = (global as any).Audio;
    const playSpy = vi.fn().mockResolvedValue(undefined);
    class MockAudio {
      preload = "";
      currentTime = 0;
      play = playSpy;
      pause = vi.fn();
      constructor() {}
    }
    (global as any).Audio = MockAudio;

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
    expect(rendered.container.textContent).not.toContain("should-hide");

    await rendered.unmount();
    (global as any).Audio = originalAudio;
  });
});
