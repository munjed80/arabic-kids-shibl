import { z } from "zod";

const sentenceSchema = z
  .string()
  .min(1)
  .refine(
    (value) => {
      const words = value.trim().split(/\s+/);
      return words.length >= 2 && words.length <= 4;
    },
    { message: "Sentences must be 2–4 words" },
  );

const paragraphSchema = z.array(sentenceSchema).min(2).max(4);

export const storySchema = z.object({
  id: z.string(),
  title: z.string(),
  paragraphs: z.array(paragraphSchema).min(1),
});

export type Story = z.infer<typeof storySchema>;
