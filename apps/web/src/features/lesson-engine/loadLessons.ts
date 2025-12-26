import { promises as fs } from "fs";
import path from "path";
import { lessonSchema, type Lesson } from "./lessonSchema";

type LessonComparator = (a: Lesson, b: Lesson) => number;

const numericId = (id: string) => {
  const match = id.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
};

const defaultOrderingByLevel: Record<number, string[]> = {
  1: ["level1-sound-a", "level1-sound-b", "level1-sound-t"],
  2: ["level2-thaa-shapes", "level2-noon-shapes", "level2-yaa-shapes"],
};

const allowedLevel2Ids = new Set(defaultOrderingByLevel[2]);

const compareLessons: LessonComparator = (a, b) => {
  if (a.level !== b.level) return a.level - b.level;

  const preferredOrder = defaultOrderingByLevel[a.level];
  if (preferredOrder) {
    const indexA = preferredOrder.indexOf(a.id);
    const indexB = preferredOrder.indexOf(b.id);

    if (indexA >= 0 || indexB >= 0) {
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      if (indexA !== indexB) return indexA - indexB;
    }
  }

  const numericCompare = numericId(a.id) - numericId(b.id);
  if (Number.isFinite(numericCompare) && numericCompare !== 0) {
    return numericCompare;
  }

  return a.id.localeCompare(b.id);
};

export const sortLessons = (lessons: Lesson[]) => [...lessons].sort(compareLessons);

export async function loadLessonsFromDisk(): Promise<Lesson[]> {
  const lessonsDir = path.join(process.cwd(), "src", "content", "lessons");
  const entries = await fs.readdir(lessonsDir);
  const lessons: Lesson[] = [];

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const filePath = path.join(lessonsDir, entry);
    const contents = await fs.readFile(filePath, "utf-8");
    try {
      const raw = JSON.parse(contents);
      const parsed = lessonSchema.parse(raw);
      if (parsed.level === 2 && !allowedLevel2Ids.has(parsed.id)) continue;
      lessons.push(parsed);
    } catch (error) {
      console.warn(`Skipping invalid lesson file ${entry}:`, error);
    }
  }

  return sortLessons(lessons);
}
