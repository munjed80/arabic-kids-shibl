export type LessonProgressRecord = {
  lessonId: string;
  activityIndex: number;
  completed: boolean;
};

const STORAGE_KEY = "shibl-progress";

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readAll = (): LessonProgressRecord[] => {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LessonProgressRecord[]) : [];
  } catch {
    return [];
  }
};

export const loadProgress = (lessonId: string): LessonProgressRecord | undefined =>
  readAll().find((record) => record.lessonId === lessonId);

const normalizeRecord = (
  lessonIdOrRecord: string | LessonProgressRecord,
  data?: Omit<LessonProgressRecord, "lessonId">,
): LessonProgressRecord => {
  if (typeof lessonIdOrRecord === "string") {
    if (!data)
      throw new Error("Progress data (activityIndex and completed) is required when lessonId is provided.");
    return { lessonId: lessonIdOrRecord, ...data };
  }
  return lessonIdOrRecord;
};

export const saveProgress = (
  lessonIdOrRecord: string | LessonProgressRecord,
  data?: Omit<LessonProgressRecord, "lessonId">,
) => {
  if (!hasStorage()) return;
  const record = normalizeRecord(lessonIdOrRecord, data);
  const all = readAll().filter((item) => item.lessonId !== record.lessonId);
  all.push(record);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const clearProgress = (lessonId?: string) => {
  if (!hasStorage()) return;
  if (!lessonId) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const remaining = readAll().filter((record) => record.lessonId !== lessonId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
};
