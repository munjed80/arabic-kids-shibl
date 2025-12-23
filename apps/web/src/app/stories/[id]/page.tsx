import { notFound } from "next/navigation";
import { loadStoryById } from "@/features/stories/loadStories";
import { StoryReaderClient } from "./StoryReaderClient";

type Props = {
  params: { id: string };
};

export default async function StoryPage({ params }: Props) {
  const story = await loadStoryById(params.id);
  if (!story) {
    return notFound();
  }
  return <StoryReaderClient story={story} />;
}
