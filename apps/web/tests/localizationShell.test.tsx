/// <reference types="vitest" />

import { act, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { AssessmentsPageClient } from "@/app/assessments/AssessmentsPageClient";
import { ExamsPageClient } from "@/app/exams/ExamsPageClient";
import { StoriesPageClient } from "@/app/stories/StoriesPageClient";
import { I18nProvider } from "@/i18n/I18nProvider";
import { storageKey } from "@/i18n/config";
import type { Assessment } from "@/features/assessments/assessmentSchema";
import type { Exam } from "@/features/exams/examSchema";
import type { Story } from "@/features/stories/storySchema";

const baseActivity = {
  id: "activity-1",
  type: "choose" as const,
  prompt: "اختر الإجابة الصحيحة",
  choices: ["أ", "ب"],
  answer: "أ",
};

const renderWithI18n = async (ui: ReactElement) => {
  const container = document.createElement("div");
  const root = createRoot(container);

  await act(async () => {
    root.render(<I18nProvider>{ui}</I18nProvider>);
  });

  await act(async () => {});

  return {
    textContent: container.textContent ?? "",
    unmount: async () =>
      act(async () => {
        root.unmount();
      }),
  };
};

describe("localization shells", () => {
  beforeEach(() => {
    localStorage.setItem(storageKey, "nl");
  });

  it("localizes exams UI without English fallbacks", async () => {
    const exams: Exam[] = [
      {
        id: "exam-1",
        category: "letters",
        title: "تدريب الأحرف",
        description: "اختبار هادئ",
        objective: "التحقق من الحروف",
        durationMinutes: 5,
        activities: [baseActivity],
      },
    ];

    const rendered = await renderWithI18n(<ExamsPageClient exams={exams} />);
    expect(rendered.textContent).toContain("Oefenexamens");
    expect(rendered.textContent).toContain("Ouder-vriendelijk rapport");
    expect(rendered.textContent).not.toContain("Practice Exams");
    expect(rendered.textContent).not.toContain("Parent-Friendly Report");
    await rendered.unmount();
  });

  it("localizes assessments UI without English fallbacks", async () => {
    const assessments: Assessment[] = [
      {
        id: "assessment-1",
        category: "letters",
        title: "تقييم الحروف",
        description: "تحقق سريع",
        objective: "قياس الثقة",
        durationMinutes: 3,
        activities: [baseActivity],
      },
    ];

    const rendered = await renderWithI18n(<AssessmentsPageClient assessments={assessments} />);
    expect(rendered.textContent).toContain("Check je lezen");
    expect(rendered.textContent).not.toContain("Check your reading");
    expect(rendered.textContent).not.toContain("Not checked yet");
    await rendered.unmount();
  });

  it("localizes stories UI without English fallbacks", async () => {
    const stories: Story[] = [
      {
        id: "story-1",
        title: "قصة ١",
        paragraphs: [
          ["أكل الولد التفاحة", "شرب اللبن"],
          ["ذهب إلى الباب", "نظر إلى السماء"],
        ],
      },
    ];

    const rendered = await renderWithI18n(<StoriesPageClient stories={stories} />);
    expect(rendered.textContent).toContain("Korte verhalen");
    expect(rendered.textContent).not.toContain("Short Stories");
    await rendered.unmount();
  });
});
