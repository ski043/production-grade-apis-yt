import { z } from "zod";
import { TutorialStatus } from "@/app/generated/prisma/enums";

export const TutorialStatusEnum = z.enum(
  Object.values(TutorialStatus) as [TutorialStatus, ...TutorialStatus[]],
);

export const TutorialSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens, no leading/trailing hyphens",
    ),
  content: z.string(),
  status: TutorialStatusEnum,
  tags: z.array(z.string().min(1).max(50)).max(10),
  authorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable(),
});

export type Tutorial = z.infer<typeof TutorialSchema>;

// ── Output schemas ──

export const TutorialOutput = TutorialSchema;

export const TutorialListOutput = z.object({
  items: z.array(TutorialOutput),
  nextCursor: z.string().nullable(),
});

// ── Input schemas ──

export const CreateTutorialInput = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    ),
  content: z.string().default(""),
  status: TutorialStatusEnum.exclude(["Archived"]).default("Draft"),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
});

export const UpdateTutorialInput = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    )
    .optional(),
  content: z.string().optional(),
  status: TutorialStatusEnum.exclude(["Archived"]).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
});

export const DeleteTutorialInput = z.object({
  id: z.uuid(),
});

export const GetBySlugInput = z.object({
  slug: z.string().min(1).max(100),
});

export const ListTutorialsInput = z.object({
  cursor: z.uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  status: TutorialStatusEnum.exclude(["Archived"]).optional(),
  tag: z.string().min(1).optional(),
  authorId: z.string().optional(),
});
