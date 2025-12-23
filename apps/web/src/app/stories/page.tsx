import { loadStoriesFromDisk } from "@/features/stories/loadStories";
import { StoriesPageClient } from "./StoriesPageClient";

export default async function StoriesPage() {
  const stories = await loadStoriesFromDisk();
  return <StoriesPageClient stories={stories} />;
}
