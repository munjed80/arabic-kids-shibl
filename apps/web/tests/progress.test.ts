/// <reference types="vitest" />

import {
  getLessonProgressFromLevel,
  loadLevelProgress,
  resetLevelProgress,
  saveLessonProgress,
  updateLevelState,
} from "@/features/progress/localProgress";

describe("level progress storage", () => {
  const levelId = "level-1";
  const firstLessonId = "lesson-start";

  beforeEach(() => {
    resetLevelProgress(levelId, firstLessonId);
  });

  it("saves lesson progress and marks level as started", () => {
    const lessonRecord = { lessonId: "lesson-1", activityIndex: 1, completed: false };
    const level = saveLessonProgress(levelId, firstLessonId, lessonRecord);

    const loaded = loadLevelProgress(levelId, firstLessonId);
    const progress = getLessonProgressFromLevel(loaded, lessonRecord.lessonId);

    expect(progress).toEqual(lessonRecord);
    expect(loaded.started).toBe(true);
    expect(level.currentLessonId).toBe(lessonRecord.lessonId);
  });

  it("resets a level and clears lesson entries", () => {
    saveLessonProgress(levelId, firstLessonId, { lessonId: "lesson-1", activityIndex: 2, completed: true });
    resetLevelProgress(levelId, firstLessonId);

    const loaded = loadLevelProgress(levelId, firstLessonId);

    expect(loaded.lessons).toEqual([]);
    expect(loaded.started).toBe(false);
    expect(loaded.levelCompleted).toBe(false);
    expect(loaded.currentLessonId).toBe(firstLessonId);
  });

  it("updates level state when completed", () => {
    saveLessonProgress(levelId, firstLessonId, { lessonId: "lesson-1", activityIndex: 2, completed: true });
    const updated = updateLevelState(levelId, firstLessonId, { levelCompleted: true });

    expect(updated.levelCompleted).toBe(true);
    const loaded = loadLevelProgress(levelId, firstLessonId);
    expect(loaded.levelCompleted).toBe(true);
  });
});
