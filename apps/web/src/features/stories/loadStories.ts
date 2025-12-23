import { promises as fs } from "fs";
import path from "path";
import { storySchema, type Story } from "./storySchema";

const numericId = (id: string) => {
  const match = id.match(/story-(\d+)/);
  return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
};

const sortStories = (stories: Story[]) =>
  [...stories].sort((a, b) => {
    const numeric = numericId(a.id) - numericId(b.id);
    if (Number.isFinite(numeric) && numeric !== 0) {
      return numeric;
    }
    return a.id.localeCompare(b.id);
  });

export async function loadStoriesFromDisk(): Promise<Story[]> {
  const storiesDir = path.join(process.cwd(), "src", "content", "stories");
  const entries = await fs.readdir(storiesDir);
  const stories: Story[] = [];

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const filePath = path.join(storiesDir, entry);
    const contents = await fs.readFile(filePath, "utf-8");
    try {
      const raw = JSON.parse(contents);
      const parsed = storySchema.parse(raw);
      stories.push(parsed);
    } catch (error) {
      console.warn(`Skipping invalid story file ${entry}:`, error);
    }
  }

  return sortStories(stories);
}

export async function loadStoryById(id: string): Promise<Story | undefined> {
  const filePath = path.join(process.cwd(), "src", "content", "stories", `${id}.json`);
  try {
    const contents = await fs.readFile(filePath, "utf-8");
    const raw = JSON.parse(contents);
    return storySchema.parse(raw);
  } catch (error) {
    console.warn(`Could not load story ${id}:`, error);
    return undefined;
  }
}
