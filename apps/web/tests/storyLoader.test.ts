/// <reference types="vitest" />

import { loadStoriesFromDisk } from "@/features/stories/loadStories";

describe("story loading", () => {
  it("loads story paragraphs with short sentences", async () => {
    const stories = await loadStoriesFromDisk();
    expect(stories.length).toBeGreaterThanOrEqual(6);
    stories.forEach((story) => {
      expect(story.paragraphs.length).toBeGreaterThan(0);
      story.paragraphs.forEach((paragraph) => {
        expect(paragraph.length).toBeGreaterThanOrEqual(2);
        expect(paragraph.length).toBeLessThanOrEqual(4);
      });
    });
  });
});
