/// <reference types="vitest" />

import { clearProgress, loadProgress, saveProgress } from "@/features/progress/localProgress";

describe("local progress storage", () => {
  const record = { lessonId: "lesson-1", activityIndex: 2, completed: false };

  it("saves and loads progress", () => {
    saveProgress(record);
    const loaded = loadProgress(record.lessonId);
    expect(loaded).toEqual(record);
  });

  it("clears progress per lesson", () => {
    saveProgress(record);
    clearProgress(record.lessonId);
    const loaded = loadProgress(record.lessonId);
    expect(loaded).toBeUndefined();
  });
});
