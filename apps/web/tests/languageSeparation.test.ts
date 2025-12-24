import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const disallowedArabic = /[\u0600-\u06FF]/;
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
    const srcRoot = path.join(process.cwd(), "src");
    const files = collectFiles(srcRoot, new Set(["content"]));

    const offenders = files
      .map((file) => ({
        file,
        content: readFileSync(file, "utf8"),
      }))
      .filter(({ content }) => disallowedArabic.test(content))
      .map(({ file }) => path.relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });
});
