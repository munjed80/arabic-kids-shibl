/// <reference types="vitest" />

import { loadLessonsFromDisk } from "@/features/lesson-engine/loadLessons";

describe("lesson loading", () => {
  it("detects all available lesson levels including level 3", async () => {
    const lessons = await loadLessonsFromDisk();
    const levels = new Set(lessons.map((lesson) => lesson.level));

    expect(levels.has(1)).toBe(true);
    expect(levels.has(2)).toBe(true);
    expect(levels.has(3)).toBe(true);

    const levelTwoLessonIds = lessons.filter((lesson) => lesson.level === 2).map((lesson) => lesson.id);
    expect(levelTwoLessonIds).toContain("level2-thaa-shapes");
    expect(levelTwoLessonIds).toContain("level2-noon-shapes");
    expect(levelTwoLessonIds).toContain("level2-yaa-shapes");

    const levelThreeLessonIds = lessons.filter((lesson) => lesson.level === 3).map((lesson) => lesson.id);
    expect(levelThreeLessonIds).toContain("level3-jeem-shapes");
    expect(levelThreeLessonIds).toContain("level3-haa-shapes");
    expect(levelThreeLessonIds).toContain("level3-khaa-shapes");
  });
});
