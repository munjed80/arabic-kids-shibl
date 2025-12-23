"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { useI18n } from "@/i18n/I18nProvider";
import type { Story } from "@/features/stories/storySchema";

type Props = {
  stories: Story[];
};

const previewParagraph = (story: Story) => story.paragraphs[0]?.join(" ");

export function StoriesPageClient({ stories }: Props) {
  const { t } = useI18n();

  return (
    <Container className="space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
            {t("stories.badge")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("stories.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">{t("stories.lede")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("stories.safety")}</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-700"
        >
          {t("stories.backToHome")}
        </Link>
      </div>

      <Card className="space-y-3 border-slate-200 bg-slate-50 p-4 text-slate-900">
        <h2 className="text-lg font-semibold">{t("stories.listHeading")}</h2>
        <p className="text-sm text-slate-700">{t("stories.listBody")}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <Card key={story.id} className="flex h-full flex-col gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                {t("stories.storyBadge")}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">{story.title}</h3>
              <p className="text-xs text-slate-600">
                {t("stories.paragraphCount", { total: story.paragraphs.length })}
              </p>
            </div>
            {previewParagraph(story) ? (
              <Card className="border border-slate-200 bg-slate-50 p-3 text-right" as="div">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {t("stories.preview")}
                </p>
                <p lang="ar" dir="rtl" className="mt-2 text-xl leading-relaxed text-slate-900">
                  {previewParagraph(story)}
                </p>
              </Card>
            ) : null}
            <div className="mt-auto flex items-center justify-between gap-2">
              <Link
                href={`/stories/${story.id}`}
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-600"
              >
                {t("stories.readStory")}
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
