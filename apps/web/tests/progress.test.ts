/// <reference types="vitest" />

import { clearProgress, loadProgress, saveProgress } from "@/features/progress/localProgress";

describe("local progress storage", () => {
  const record = { lessonId: "lesson-1", activityIndex: 2, completed: false };

  it("saves and loads progress", () => {
    saveProgress(record.lessonId, {
      activityIndex: record.activityIndex,
      completed: record.completed,
    });
    const loaded = loadProgress(record.lessonId);
    expect(loaded).toEqual(record);
  });

  it("clears progress per lesson", () => {
    saveProgress(record.lessonId, {
      activityIndex: record.activityIndex,
      completed: record.completed,
    });
    clearProgress(record.lessonId);
    const loaded = loadProgress(record.lessonId);
    expect(loaded).toBeUndefined();
  });

  it("clears all progress when no lessonId is provided", () => {
    saveProgress(record.lessonId, {
      activityIndex: record.activityIndex,
      completed: record.completed,
    });
    saveProgress("lesson-2", { activityIndex: 0, completed: true });
    clearProgress();
    expect(loadProgress(record.lessonId)).toBeUndefined();
    expect(loadProgress("lesson-2")).toBeUndefined();
  });
});
