"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { useI18n } from "@/i18n/I18nProvider";
import type { Story } from "@/features/stories/storySchema";
import { createCompanionAdapter } from "@/features/companion/companionAdapter";

type Props = {
  story: Story;
};

const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function StoryReaderClient({ story }: Props) {
  const { t } = useI18n();
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [speechAvailable] = useState(() => hasSpeech());
  const [companionMood, setCompanionMood] = useState(() => 
    createCompanionAdapter().getMood()
  );
  const companion = useMemo(
    () => createCompanionAdapter({ 
      onStateChange: (mood) => setCompanionMood(mood) 
    }),
    []
  );

  // Emit story started event
  useEffect(() => {
    companion.handleStoryEvent({
      type: "STORY_STARTED",
      payload: { storyId: story.id },
    });
  }, [story.id, companion]);

  // Emit paragraph changed event
  useEffect(() => {
    if (paragraphIndex > 0) {
      companion.handleStoryEvent({
        type: "STORY_PARAGRAPH_CHANGED",
        payload: { storyId: story.id, paragraphIndex },
      });
    }
  }, [paragraphIndex, story.id, companion]);

  useEffect(() => {
    return () => {
      if (speechAvailable) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechAvailable]);

  const paragraph = useMemo(() => story.paragraphs[paragraphIndex] ?? [], [paragraphIndex, story.paragraphs]);
  const progressLabel = t("stories.paragraphProgress", {
    current: paragraphIndex + 1,
    total: story.paragraphs.length,
  });

  const listenToParagraph = () => {
    if (!speechAvailable) return;
    const text = paragraph.join(" ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const goPrevious = () => setParagraphIndex((index) => Math.max(0, index - 1));
  const goNext = () => {
    const nextIndex = Math.min(story.paragraphs.length - 1, paragraphIndex + 1);
    setParagraphIndex(nextIndex);
    
    // Emit completion event if we've reached the end
    if (nextIndex === story.paragraphs.length - 1 && paragraphIndex < nextIndex) {
      companion.handleStoryEvent({
        type: "STORY_COMPLETED",
        payload: { storyId: story.id },
      });
    }
  };

  return (
    <Container className="space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
            {t("stories.badge")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{story.title}</h1>
          <p className="text-sm text-slate-700">{t("stories.readerLede")}</p>
          <p className="text-xs text-slate-600">{progressLabel}</p>
        </div>
        <Link
          href="/stories"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-700"
        >
          {t("stories.backToList")}
        </Link>
      </div>

      <CompanionAvatar mood={companionMood} />

      <Card className="space-y-4 border-slate-200 bg-white p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t("stories.reader")}</p>
            <p className="text-sm text-slate-700">{progressLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={goPrevious} disabled={paragraphIndex === 0}>
              {t("stories.previous")}
            </Button>
            <Button type="button" onClick={goNext} disabled={paragraphIndex >= story.paragraphs.length - 1}>
              {t("stories.next")}
            </Button>
            <Button type="button" onClick={listenToParagraph} disabled={!speechAvailable}>
              {t("stories.listen")}
            </Button>
          </div>
        </div>
        <Card className="border border-slate-200 bg-slate-50 p-4" as="div">
          <div className="space-y-2">
            {paragraph.map((sentence, index) => (
              <p
                key={`${paragraphIndex}-${index}`}
                lang="ar"
                className="arabic-content text-slate-900"
              >
                {sentence}
              </p>
            ))}
          </div>
        </Card>
        {!speechAvailable ? (
          <p className="text-xs text-slate-500">{t("stories.listenUnavailable")}</p>
        ) : (
          <p className="text-xs text-slate-500">{t("stories.listenOptional")}</p>
        )}
      </Card>
    </Container>
  );
}
