export type LessonProgressRecord = {
  lessonId: string;
  activityIndex: number;
  completed: boolean;
};

export type LevelProgressRecord = {
  levelId: string;
  currentLessonId: string;
  lessons: LessonProgressRecord[];
  levelCompleted: boolean;
  started: boolean;
};

const STORAGE_KEY = "shibl-progress";

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const fallbackLevelRecord = (levelId: string, firstLessonId: string): LevelProgressRecord => ({
  levelId,
  currentLessonId: firstLessonId,
  lessons: [],
  levelCompleted: false,
  started: false,
});

const readAll = (): LevelProgressRecord[] => {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed as LevelProgressRecord[];
    }

    if (parsed?.levels && Array.isArray(parsed.levels)) {
      return parsed.levels as LevelProgressRecord[];
    }

    return [];
  } catch {
    return [];
  }
};

const writeAll = (levels: LevelProgressRecord[]) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
};

const upsertLevelRecord = (
  levelId: string,
  firstLessonId: string,
  updater: (record: LevelProgressRecord) => LevelProgressRecord,
) => {
  const all = readAll();
  const existing = all.find((record) => record.levelId === levelId);
  const next = updater(existing ?? fallbackLevelRecord(levelId, firstLessonId));
  const remaining = all.filter((record) => record.levelId !== levelId);
  remaining.push(next);
  writeAll(remaining);
  return next;
};

export const loadLevelProgress = (
  levelId: string,
  firstLessonId: string,
): LevelProgressRecord => {
  const all = readAll();
  return all.find((record) => record.levelId === levelId) ?? fallbackLevelRecord(levelId, firstLessonId);
};

export const getLessonProgressFromLevel = (
  level: LevelProgressRecord,
  lessonId: string,
): LessonProgressRecord =>
  level.lessons.find((entry) => entry.lessonId === lessonId) ?? { lessonId, activityIndex: 0, completed: false };

export const saveLessonProgress = (
  levelId: string,
  firstLessonId: string,
  lessonRecord: LessonProgressRecord,
) =>
  upsertLevelRecord(levelId, firstLessonId, (record) => {
    const lessons = record.lessons.filter((entry) => entry.lessonId !== lessonRecord.lessonId);
    lessons.push(lessonRecord);
    return { ...record, lessons, currentLessonId: lessonRecord.lessonId, started: true };
  });

export const updateLevelState = (
  levelId: string,
  firstLessonId: string,
  data: Partial<Pick<LevelProgressRecord, "currentLessonId" | "levelCompleted" | "started">>,
) => upsertLevelRecord(levelId, firstLessonId, (record) => ({ ...record, ...data }));

export const resetLevelProgress = (levelId: string, firstLessonId: string) => {
  if (!hasStorage()) return;
  const remaining = readAll().filter((record) => record.levelId !== levelId);
  remaining.push(fallbackLevelRecord(levelId, firstLessonId));
  writeAll(remaining);
};

export const clearProgress = resetLevelProgress;
