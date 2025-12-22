import { loadLessonsFromDisk } from "@/features/lesson-engine/loadLessons";
import { HomePageClient } from "./HomePageClient";

export default async function Home() {
  const lessons = await loadLessonsFromDisk();

  return <HomePageClient lessons={lessons} />;
}
