import { readdirSync, readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

// Arabic Unicode blocks (base, Supplement, Extended-A, Presentation Forms A/B) are disallowed in UI code.
const disallowedArabic =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const learningContentDir = "content";
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mdx",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".txt",
  ".svg",
]);

const collectFiles = (dir: string, ignoreDirs: Set<string>): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, ignoreDirs));
      continue;
    }

    if (textExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
};

describe("language separation", () => {
  it("keeps Arabic text out of the UI codebase", () => {
    const projectRoot = path.resolve(__dirname, "..");
    const srcRoot = path.join(projectRoot, "src");
    const files = collectFiles(srcRoot, new Set([learningContentDir]));

    const offenders: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      if (disallowedArabic.test(content)) {
        offenders.push(path.relative(process.cwd(), file));
      }
    }

    expect(offenders).toEqual([]);
  });
});
