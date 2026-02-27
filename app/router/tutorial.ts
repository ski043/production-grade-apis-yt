import { implement } from "@orpc/server";
import { contract } from "../contract";
import prisma from "../lib/db";
import {
  authMiddleware,
  BaseContext,
  optionalAuthMiddleware,
} from "./middleware";

const os = implement(contract).$context<BaseContext>();

export const createTutorial = os.tutorial.create
  .use(authMiddleware)
  .handler(async ({ input, errors, context }) => {
    const existing = await prisma.tutorial.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });

    if (existing) {
      throw errors.CONFLICT({
        data: {
          field: "slug",
          value: input.slug,
        },
        cause: "SLUG_ALREADY_EXISTS",
      });
    }

    const data = await prisma.tutorial.create({
      data: {
        ...input,
        authorId: context.user.id,
        publishedAt: input.status === "Published" ? new Date() : null,
      },
    });

    return data;
  });

export const updateTutorial = os.tutorial.update
  .use(authMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { id, ...updates } = input;

    const tutorial = await prisma.tutorial.findUnique({ where: { id } });
    if (!tutorial) {
      throw errors.NOT_FOUND({
        data: {
          resourceId: id,
          resourceType: "",
        },
      });
    }
    if (tutorial.authorId !== context.user.id) {
      throw errors.FORBIDDEN();
    }

    if (updates.slug && updates.slug !== tutorial.slug) {
      const slugTaken = await prisma.tutorial.findUnique({
        where: { slug: updates.slug },
        select: { id: true },
      });
      if (slugTaken) {
        throw errors.CONFLICT({
          data: {
            field: "slug",
            value: updates.slug,
          },
        });
      }
    }

    return await prisma.tutorial.update({
      where: { id },
      data: {
        ...updates,
        publishedAt:
          updates.status === "Published" && !tutorial.publishedAt
            ? new Date()
            : undefined,
      },
    });
  });

// ── tutorial.delete ──

export const deleteTutorial = os.tutorial.delete
  .use(authMiddleware)
  .handler(async ({ input, context, errors }) => {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: input.id },
    });
    if (!tutorial) {
      throw errors.NOT_FOUND({
        data: {
          resourceId: input.id,
          resourceType: "Tutorial",
        },
      });
    }
    if (tutorial.authorId !== context.user.id) {
      throw errors.FORBIDDEN();
    }

    if (tutorial.status === "Archived") return tutorial;

    return prisma.tutorial.update({
      where: { id: input.id },
      data: { status: "Archived" },
    });
  });

// ── tutorial.getBySlug ──

export const getBySlug = os.tutorial.getBySlug
  .use(optionalAuthMiddleware)
  .handler(async ({ input, context, errors }) => {
    const tutorial = await prisma.tutorial.findUnique({
      where: { slug: input.slug },
    });

    if (!tutorial || tutorial.status === "Archived") {
      throw errors.NOT_FOUND({
        data: {
          resourceType: "Tutorial",
          resourceId: input.slug,
        },
      });
    }

    if (tutorial.status === "Draft" && tutorial.authorId !== context.user?.id) {
      throw errors.NOT_FOUND({
        data: {
          resourceType: "Tutorial",
          resourceId: input.slug,
        },
      });
    }

    return tutorial;
  });

// ── tutorial.list ──

export const listTutorials = os.tutorial.list
  .use(optionalAuthMiddleware)
  .handler(async ({ input, context, errors }) => {
    const { cursor, limit, status, tag, authorId } = input;
    const userId = context.user?.id ?? null;

    if (status === "Draft" && (!userId || (authorId && authorId !== userId))) {
      throw errors.FORBIDDEN();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    } else if (!userId) {
      where.status = "Published";
    } else {
      where.OR = [
        { status: "Published" },
        { status: "Draft", authorId: userId },
      ];
    }

    if (authorId) where.authorId = authorId;
    if (tag) where.tags = { has: tag };

    const rows = await prisma.tutorial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    };
  });
