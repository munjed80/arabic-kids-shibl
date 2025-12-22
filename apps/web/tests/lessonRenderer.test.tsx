/// <reference types="vitest" />

import { act } from "react";
import { createRoot } from "react-dom/client";
import { LessonActivityCard } from "@/components/LessonActivityCard";
import { I18nProvider } from "@/i18n/I18nProvider";
import type { Activity } from "@/features/lesson-engine/lessonSchema";

const renderActivity = async (activity: Activity, onSubmit = vi.fn()) => {
  const container = document.createElement("div");
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <I18nProvider>
        <LessonActivityCard activity={activity} onSubmit={onSubmit} />
      </I18nProvider>,
    );
  });

  await act(async () => {});

  return {
    onSubmit,
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
});
